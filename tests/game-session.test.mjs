import assert from 'node:assert/strict';
import test from 'node:test';
import { brewGame } from '../src/logic/brewing.ts';
import { addIngredient } from '../src/logic/ingredients.ts';
import { advanceGameTime } from '../src/logic/session.ts';
import { createGame } from '../src/state/game.ts';
import { createSessionClock } from '../src/ui/session-clock.ts';

function createFakeClock(onElapsed) {
  let timestamp = 0;
  let nextHandle = 0;
  const activeCallbacks = new Map();
  const callbacks = new Map();
  const clock = createSessionClock(onElapsed, {
    now: () => timestamp,
    setInterval: (callback) => {
      const handle = ++nextHandle;
      activeCallbacks.set(handle, callback);
      callbacks.set(handle, callback);
      return handle;
    },
    clearInterval: (handle) => activeCallbacks.delete(handle),
  });

  return {
    clock,
    advance(milliseconds) {
      timestamp += milliseconds;
    },
    tick() {
      for (const callback of [...activeCallbacks.values()]) callback();
    },
    captureCallback() {
      const callback = callbacks.get(nextHandle);
      assert.ok(callback);
      return callback;
    },
    get activeCount() {
      return activeCallbacks.size;
    },
  };
}

function freezeGame(game) {
  Object.freeze(game.mixing.inventory);
  Object.freeze(game.mixing.mixture);
  Object.freeze(game.mixing.totals);
  Object.freeze(game.mixing);
  return Object.freeze(game);
}

function winningGame(timeRemaining) {
  let game = { ...createGame(() => 0), timeRemaining };
  for (const id of ['fairy-dust', 'caustic-acid']) {
    const result = addIngredient(game.mixing, id);
    assert.equal(result.accepted, true);
    game = { ...game, mixing: result.state };
  }
  return game;
}

test('elapsed time subtracts fractional seconds without changing inventory or other run data', () => {
  const game = freezeGame(createGame(() => 0));
  const advanced = advanceGameTime(game, 0.375);

  assert.equal(advanced.timeRemaining, 149.625);
  assert.equal(advanced.elapsedTime, 0.375);
  assert.equal(advanced.status, 'playing');
  assert.equal(advanced.endReason, null);
  assert.equal(advanced.mixing, game.mixing);
  assert.equal(advanced.recipe, game.recipe);
  assert.equal(advanced.score, game.score);
  assert.equal(advanced.lives, game.lives);
  assert.equal(game.timeRemaining, 150);
  assert.equal(game.elapsedTime, 0);
});

test('a delayed update expires at zero and records only time actually available', () => {
  const game = freezeGame({ ...createGame(() => 0), timeRemaining: 2.75, elapsedTime: 12.5 });
  const expired = advanceGameTime(game, 10);

  assert.equal(expired.timeRemaining, 0);
  assert.equal(expired.elapsedTime, 15.25);
  assert.equal(expired.status, 'game-over');
  assert.equal(expired.endReason, 'time-expired');
  assert.equal(advanceGameTime(expired, 30), expired);
});

test('ended games and nonpositive or invalid elapsed samples leave the same state unchanged', () => {
  const game = freezeGame(createGame(() => 0));
  for (const elapsed of [0, -1, NaN, Infinity, -Infinity]) {
    assert.equal(advanceGameTime(game, elapsed), game);
  }
  const ended = freezeGame({ ...game, status: 'game-over', endReason: 'out-of-lives', lives: 0 });
  assert.equal(advanceGameTime(ended, 2), ended);
});

test('delayed callbacks catch up from timestamps instead of counting interval ticks', () => {
  let game = createGame(() => 0);
  const samples = [];
  const fake = createFakeClock((seconds) => {
    samples.push(seconds);
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(4500);
  fake.tick();

  assert.equal(game.timeRemaining, 145.5);
  assert.equal(game.elapsedTime, 4.5);
  fake.tick();
  assert.deepEqual(samples, [4.5]);
  fake.advance(250);
  fake.clock.synchronize();
  assert.equal(game.timeRemaining, 145.25);
  assert.equal(game.elapsedTime, 4.75);
  assert.deepEqual(samples, [4.5, 0.25]);
});

test('pause flushes fractional time and resume excludes the entire paused interval', () => {
  let game = createGame(() => 0);
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(375);
  fake.clock.pause();

  assert.equal(game.timeRemaining, 149.625);
  assert.equal(game.elapsedTime, 0.375);
  assert.equal(fake.activeCount, 0);
  fake.advance(60000);
  fake.tick();
  fake.clock.synchronize();
  assert.equal(game.timeRemaining, 149.625);

  fake.clock.start();
  fake.advance(125);
  fake.tick();
  assert.equal(game.timeRemaining, 149.5);
  assert.equal(game.elapsedTime, 0.5);
  fake.clock.pause();
  assert.equal(game.elapsedTime, 0.5);
});

test('pausing exactly at the deadline flushes expiry before the run can be preserved as paused', () => {
  let game = { ...createGame(() => 0), timeRemaining: 0.25 };
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(250);
  fake.clock.pause();

  assert.equal(game.status, 'game-over');
  assert.equal(game.endReason, 'time-expired');
  assert.equal(game.timeRemaining, 0);
  assert.equal(game.elapsedTime, 0.25);
  assert.equal(fake.activeCount, 0);
});

test('synchronizing before a brew prevents a last-moment bonus from reviving expired time', () => {
  let game = winningGame(0.25);
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(250);
  fake.clock.synchronize();
  const result = brewGame(game, () => {
    assert.fail('An expired run must not select another recipe.');
  });

  assert.deepEqual(result, { accepted: false, reason: 'game-over', state: game });
  assert.equal(result.state, game);
  assert.equal(game.score, 0);
  assert.equal(game.lives, 3);
  assert.equal(game.timeRemaining, 0);
  assert.equal(game.elapsedTime, 0.25);
});

test('a valid brew just before expiry adds its bonus without losing fractional play time', () => {
  let game = winningGame(0.5);
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(250);
  fake.clock.synchronize();
  const result = brewGame(game, () => 0);
  assert.equal(result.accepted, true);
  assert.equal(result.feedback.timeDelta, 10);
  game = result.state;

  assert.equal(game.timeRemaining, 10.25);
  assert.equal(game.elapsedTime, 0.25);
  assert.equal(game.score, 200);
  fake.advance(250);
  fake.tick();
  assert.equal(game.timeRemaining, 10);
  assert.equal(game.elapsedTime, 0.5);
  assert.equal(game.status, 'playing');
});

test('a capped bonus between ticks keeps the clock anchor and reports the actual gain', () => {
  let game = winningGame(149.75);
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  fake.advance(125);
  fake.clock.synchronize();
  const result = brewGame(game, () => 0);
  assert.equal(result.accepted, true);
  assert.equal(result.feedback.timeDelta, 0.375);
  game = result.state;
  assert.equal(game.timeRemaining, 150);
  assert.equal(game.elapsedTime, 0.125);

  fake.advance(375);
  fake.tick();
  assert.equal(game.timeRemaining, 149.625);
  assert.equal(game.elapsedTime, 0.5);
});

test('restarting invalidates already queued callbacks so an old run cannot tick the new run', () => {
  let game = createGame(() => 0);
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
  });
  fake.clock.start();
  const oldCallback = fake.captureCallback();
  fake.advance(5000);
  fake.clock.stop();
  game = createGame(() => 0);
  const freshGame = game;
  fake.clock.start();
  fake.advance(250);
  oldCallback();

  assert.equal(game, freshGame);
  assert.equal(fake.activeCount, 1);
  fake.tick();
  assert.equal(game.timeRemaining, 149.75);
  assert.equal(game.elapsedTime, 0.25);
});

test('starting again replaces the active sampler and discards its pending old time', () => {
  const samples = [];
  const fake = createFakeClock((seconds) => samples.push(seconds));
  fake.clock.start();
  const oldCallback = fake.captureCallback();
  fake.advance(1000);
  fake.clock.start();
  assert.equal(fake.activeCount, 1);
  oldCallback();
  assert.deepEqual(samples, []);
  fake.advance(125);
  fake.tick();
  assert.deepEqual(samples, [0.125]);
});

test('disposing invalidates queued callbacks permanently and never emits pending time', () => {
  const samples = [];
  const fake = createFakeClock((seconds) => samples.push(seconds));
  fake.clock.start();
  const callback = fake.captureCallback();
  fake.advance(125);
  fake.clock.synchronize();
  fake.advance(500);
  fake.clock.dispose();
  assert.equal(fake.activeCount, 0);
  callback();
  fake.clock.start();
  fake.clock.pause();
  fake.clock.synchronize();
  fake.advance(1000);
  callback();

  assert.deepEqual(samples, [0.125]);
  assert.equal(fake.activeCount, 0);
});

test('an expiry callback can stop its own clock without leaving another live sampler', () => {
  let game = { ...createGame(() => 0), timeRemaining: 0.125 };
  const fake = createFakeClock((seconds) => {
    game = advanceGameTime(game, seconds);
    if (game.status === 'game-over') fake.clock.stop();
  });
  fake.clock.start();
  const callback = fake.captureCallback();
  fake.advance(500);
  fake.tick();

  assert.equal(game.status, 'game-over');
  assert.equal(game.elapsedTime, 0.125);
  assert.equal(fake.activeCount, 0);
  const ended = game;
  fake.advance(5000);
  callback();
  assert.equal(game, ended);
});
