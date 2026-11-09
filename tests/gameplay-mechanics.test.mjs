import assert from 'node:assert/strict';
import test from 'node:test';
import { INGREDIENT_IDS } from '../src/data/ingredients.ts';
import { RECIPES } from '../src/data/recipes.ts';
import { brewGame } from '../src/logic/brewing.ts';
import { POUR_OUT_TIME_COST, addGameIngredient, pourOutGame } from '../src/logic/gameplay.ts';
import { projectIngredient } from '../src/logic/ingredient-preview.ts';
import { createGame } from '../src/state/game.ts';
import { GAME_SAVE_STORAGE_KEY, createGameSaveStore } from '../src/storage/save.ts';

function add(game, id) {
  const result = addGameIngredient(game, id);
  assert.equal(result.accepted, true, `${id} should be available`);
  return result;
}

function addAll(game, ids) {
  for (const id of ids) game = add(game, id).state;
  return game;
}

function freezeGame(game) {
  Object.freeze(game.mixing.inventory);
  Object.freeze(game.mixing.mixture);
  Object.freeze(game.mixing.totals);
  Object.freeze(game.mixing);
  return Object.freeze(game);
}

function noStockExcept(id, amount = 1) {
  return Object.fromEntries(
    INGREDIENT_IDS.map((candidate) => [candidate, candidate === id ? amount : 0]),
  );
}

function memoryStore() {
  const values = new Map();
  return createGameSaveStore(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }));
}

test('Bubbling changes the mixture once and charges time only on activation', () => {
  const initial = freezeGame(createGame(() => 0.9));
  const original = structuredClone(initial);
  const first = add(initial, 'fairy-dust');
  assert.deepEqual(first.feedback.reactions, []);
  assert.equal(first.state.timeRemaining, 150);
  const bubbling = add(freezeGame(first.state), 'caustic-acid');
  assert.deepEqual(
    bubbling.feedback.reactions.map(({ id }) => id),
    ['bubbling'],
  );
  assert.deepEqual(bubbling.state.mixing.totals, { temperature: 22, density: 23, magicPower: 51 });
  assert.equal(bubbling.feedback.timeDelta, -10);
  assert.equal(bubbling.feedback.livesDelta, 0);
  assert.equal(bubbling.feedback.cleared, false);
  assert.equal(bubbling.state.timeRemaining, 140);

  const continued = add(freezeGame(bubbling.state), 'fairy-dust');
  assert.deepEqual(continued.feedback.reactions, []);
  assert.equal(continued.feedback.timeDelta, 0);
  assert.equal(continued.state.timeRemaining, 140);
  assert.deepEqual(continued.state.mixing.totals, { temperature: 34, density: 32, magicPower: 69 });
  assert.deepEqual(initial, original);
  assert.equal(
    continued.state.mixing.inventory['fairy-dust'],
    initial.mixing.inventory['fairy-dust'] - 2,
  );
  assert.equal(
    continued.state.mixing.inventory['caustic-acid'],
    initial.mixing.inventory['caustic-acid'] - 1,
  );
  assert.equal(continued.state.elapsedTime, initial.elapsedTime);
});

test('Solar Frost is disabled on Easy and recalculates active modifiers without compounding', () => {
  const easy = addAll(
    createGame(() => 0.9, 'easy'),
    ['dragon-tears', 'frost-lotus'],
  );
  assert.deepEqual(easy.mixing.totals, { temperature: 7, density: 12, magicPower: 24 });
  assert.equal(easy.timeRemaining, 180);

  for (const difficulty of ['medium', 'hard']) {
    const game = addAll(
      createGame(() => 0.9, difficulty),
      ['dragon-tears', 'frost-lotus'],
    );
    assert.equal(game.mixing.totals.temperature, 0);
    assert.ok(Math.abs(game.mixing.totals.density - 14.4) < 1e-10);
    assert.equal(game.mixing.totals.magicPower, 24);
    const next = add(freezeGame(game), 'dragon-tears');
    assert.deepEqual(next.feedback.reactions, []);
    assert.deepEqual(next.state.mixing.totals, { temperature: 0, density: 24, magicPower: 34 });
    assert.equal(next.state.timeRemaining, game.timeRemaining);
  }
});

test('brewing checks reaction-adjusted totals even when cached totals would pass', () => {
  const mixed = addAll(
    createGame(() => 0.9),
    ['fairy-dust', 'caustic-acid'],
  );
  const recipe = RECIPES.find(({ id }) => id === 'acid-spark');
  assert.ok(recipe);
  const game = freezeGame({
    ...mixed,
    recipe,
    mixing: { ...mixed.mixing, totals: { temperature: 22, density: 23, magicPower: 34 } },
  });
  const result = brewGame(game);
  assert.equal(result.accepted, true);
  assert.equal(result.feedback.success, false);
  assert.deepEqual(result.feedback.checks, { temperature: true, density: true, magicPower: false });
  assert.deepEqual(result.feedback.totals, { temperature: 22, density: 23, magicPower: 51 });
  assert.equal(result.state.score, 0);
  assert.equal(result.state.lives, 2);
  assert.equal(result.state.timeRemaining, 140);
  assert.deepEqual(result.state.mixing.mixture, []);
});

test('clearing through Brew or Pour Out allows a reaction to activate again', () => {
  for (const clear of [(game) => brewGame(game), pourOutGame]) {
    const mixed = addAll(
      createGame(() => 0.9),
      ['fairy-dust', 'caustic-acid'],
    );
    const cleared = clear(mixed);
    assert.equal(cleared.accepted, true);
    const afterFairy = add(cleared.state, 'fairy-dust');
    const next = add(afterFairy.state, 'caustic-acid');
    assert.deepEqual(
      next.feedback.reactions.map(({ id }) => id),
      ['bubbling'],
    );
    assert.equal(next.feedback.timeDelta, -10);
    assert.equal(next.state.timeRemaining, cleared.state.timeRemaining - 10);
    assert.deepEqual(next.state.mixing.totals, { temperature: 22, density: 23, magicPower: 51 });
  }
});

test('reaction previews match actual additions while leaving stock, time, lives and mixture untouched', () => {
  const game = freezeGame(
    add(
      createGame(() => 0.9),
      'fairy-dust',
    ).state,
  );
  const original = structuredClone(game);
  const preview = projectIngredient(game, 'caustic-acid');
  const actual = add(game, 'caustic-acid');
  assert.deepEqual(preview.projected, actual.state.mixing.totals);
  assert.deepEqual(preview.delta, { temperature: 10, density: 14, magicPower: 39 });
  assert.deepEqual(
    preview.reactions.map(({ id }) => id),
    ['bubbling'],
  );
  assert.equal(preview.timeDelta, -10);
  assert.equal(preview.livesDelta, 0);
  assert.equal(preview.cleared, false);
  assert.deepEqual(game, original);

  const active = freezeGame(actual.state);
  const ongoing = projectIngredient(active, 'fairy-dust');
  assert.deepEqual(ongoing.projected, { temperature: 34, density: 32, magicPower: 69 });
  assert.deepEqual(ongoing.delta, { temperature: 12, density: 9, magicPower: 18 });
  assert.deepEqual(ongoing.reactions, []);
  assert.equal(ongoing.timeDelta, 0);
});

test('Volatile Mix previews the life loss and clearing without detonating the current mixture', () => {
  const game = freezeGame(
    add(
      createGame(() => 0.9, 'hard'),
      'phoenix-feather',
    ).state,
  );
  const original = structuredClone(game);
  const preview = projectIngredient(game, 'essence-of-the-void');
  assert.deepEqual(
    preview.reactions.map(({ id }) => id),
    ['volatile-mix'],
  );
  assert.deepEqual(preview.projected, { temperature: 0, density: 0, magicPower: 0 });
  assert.deepEqual(preview.delta, { temperature: -50, density: 10, magicPower: -30 });
  assert.equal(preview.livesDelta, -1);
  assert.equal(preview.timeDelta, 0);
  assert.equal(preview.cleared, true);
  assert.deepEqual(game, original);

  const actual = add(game, 'essence-of-the-void');
  assert.deepEqual(actual.state.mixing.totals, preview.projected);
  assert.deepEqual(actual.state.mixing.mixture, []);
  assert.equal(actual.state.lives, game.lives - 1);
  assert.equal(actual.state.timeRemaining, game.timeRemaining);
  assert.equal(actual.state.score, game.score);
  assert.equal(actual.state.recipe, game.recipe);
  assert.equal(
    actual.state.mixing.inventory['phoenix-feather'],
    game.mixing.inventory['phoenix-feather'],
  );
  assert.equal(
    actual.state.mixing.inventory['essence-of-the-void'],
    game.mixing.inventory['essence-of-the-void'] - 1,
  );
});

test('saving and continuing preserves adjusted totals without charging activation again', () => {
  const game = freezeGame(
    addAll(
      createGame(() => 0.9),
      ['fairy-dust', 'caustic-acid'],
    ),
  );
  const store = memoryStore();
  assert.equal(store.save(game, true), true);
  const loaded = store.load();
  assert.equal(loaded.error, null);
  assert.equal(loaded.save.paused, true);
  assert.deepEqual(loaded.save.game, game);
  const continued = add(freezeGame(loaded.save.game), 'fairy-dust');
  assert.deepEqual(continued.feedback.reactions, []);
  assert.equal(continued.state.timeRemaining, 140);
  assert.deepEqual(continued.state.mixing.totals, { temperature: 34, density: 32, magicPower: 69 });
});

test('an impossible saved Volatile Mix is rejected without charging lives or rewriting a valid run', () => {
  const values = new Map();
  const calls = [];
  const store = createGameSaveStore(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      calls.push(['set', key]);
      values.set(key, value);
    },
    removeItem: (key) => {
      calls.push(['remove', key]);
      values.delete(key);
    },
  }));
  const game = freezeGame(
    add(
      createGame(() => 0.9, 'hard'),
      'phoenix-feather',
    ).state,
  );
  assert.equal(store.save(game, true), true);
  const originalSave = values.get(GAME_SAVE_STORAGE_KEY);
  calls.length = 0;
  const impossible = freezeGame({
    ...game,
    mixing: {
      inventory: {
        ...game.mixing.inventory,
        'essence-of-the-void': game.mixing.inventory['essence-of-the-void'] - 1,
      },
      mixture: ['phoenix-feather', 'essence-of-the-void'],
      totals: { temperature: 30, density: -20, magicPower: 70 },
    },
  });
  const original = structuredClone(impossible);
  assert.equal(store.save(impossible, true), false);
  assert.equal(values.get(GAME_SAVE_STORAGE_KEY), originalSave);
  assert.deepEqual(calls, []);

  const invalidSave = JSON.parse(originalSave);
  invalidSave.cauldronIngredients = [...impossible.mixing.mixture];
  invalidSave.shelfStock = { ...impossible.mixing.inventory };
  values.set(GAME_SAVE_STORAGE_KEY, JSON.stringify(invalidSave));
  assert.deepEqual(store.load(), { save: null, error: 'corrupt' });
  assert.equal(values.has(GAME_SAVE_STORAGE_KEY), false);
  assert.deepEqual(calls, [['remove', GAME_SAVE_STORAGE_KEY]]);
  assert.deepEqual(impossible, original);
  assert.equal(game.lives, 3);
});

test('Bubbling can expire a run and spends only the accepted ingredient', () => {
  const first = add(
    createGame(() => 0.9),
    'fairy-dust',
  ).state;
  for (const remaining of [10, 4.25]) {
    const game = freezeGame({ ...first, timeRemaining: remaining, elapsedTime: 17.5 });
    const result = add(game, 'caustic-acid');
    assert.equal(result.state.status, 'game-over');
    assert.equal(result.state.endReason, 'time-expired');
    assert.equal(result.state.timeRemaining, 0);
    assert.equal(result.feedback.timeDelta, -remaining);
    assert.equal(result.state.elapsedTime, game.elapsedTime);
    assert.equal(result.state.lives, game.lives);
    assert.equal(
      result.state.mixing.inventory['caustic-acid'],
      game.mixing.inventory['caustic-acid'] - 1,
    );
    assert.deepEqual(result.state.mixing.mixture, ['fairy-dust', 'caustic-acid']);
    assert.deepEqual(addGameIngredient(result.state, 'dragon-tears'), {
      accepted: false,
      reason: 'game-over',
      state: result.state,
    });
  }
});

test('Volatile Mix ends on the last life or when its clearing consumes the last stock', () => {
  const base = add(
    createGame(() => 0.9, 'hard'),
    'phoenix-feather',
  ).state;
  const lastLife = add(freezeGame({ ...base, lives: 1 }), 'essence-of-the-void');
  assert.equal(lastLife.state.lives, 0);
  assert.equal(lastLife.state.status, 'game-over');
  assert.equal(lastLife.state.endReason, 'out-of-lives');
  assert.deepEqual(lastLife.state.mixing.mixture, []);

  const depleted = add(
    freezeGame({
      ...base,
      mixing: { ...base.mixing, inventory: noStockExcept('essence-of-the-void') },
    }),
    'essence-of-the-void',
  );
  assert.equal(depleted.state.lives, 2);
  assert.equal(depleted.state.status, 'game-over');
  assert.equal(depleted.state.endReason, 'out-of-ingredients');
  assert.deepEqual(depleted.state.mixing.mixture, []);
  assert.ok(Object.values(depleted.state.mixing.inventory).every((stock) => stock === 0));
});

test('rejected additions leave reaction penalties and every game field unchanged', () => {
  const initial = createGame(() => 0.9);
  const full = addAll(initial, Array(4).fill('fairy-dust'));
  const exhausted = {
    ...initial,
    mixing: { ...initial.mixing, inventory: { ...initial.mixing.inventory, 'caustic-acid': 0 } },
  };
  for (const [input, id, reason] of [
    [initial, 'unknown', 'unknown-ingredient'],
    [initial, 'phoenix-feather', 'unavailable-ingredient'],
    [full, 'caustic-acid', 'cauldron-full'],
    [exhausted, 'caustic-acid', 'out-of-stock'],
    [{ ...initial, timeRemaining: 0 }, 'fairy-dust', 'game-over'],
    [{ ...initial, lives: 0 }, 'fairy-dust', 'game-over'],
    [{ ...initial, status: 'game-over', endReason: 'time-expired' }, 'fairy-dust', 'game-over'],
  ]) {
    const game = freezeGame(input);
    const result = addGameIngredient(game, id);
    assert.deepEqual(result, { accepted: false, reason, state: game });
    assert.equal(result.state, game);
  }
});

test('Pour Out clears only the mixture and costs ten seconds without refunding ingredients', () => {
  assert.equal(POUR_OUT_TIME_COST, 10);
  const game = freezeGame({
    ...addAll(
      createGame(() => 0.9),
      ['fairy-dust', 'caustic-acid'],
    ),
    score: 400,
    lives: 2,
    timeRemaining: 65.125,
    elapsedTime: 90.875,
  });
  const original = structuredClone(game);
  const result = pourOutGame(game);
  assert.equal(result.accepted, true);
  assert.equal(result.timeDelta, -10);
  assert.deepEqual(result.state, {
    ...game,
    timeRemaining: 55.125,
    mixing: {
      inventory: game.mixing.inventory,
      mixture: [],
      totals: { temperature: 0, density: 0, magicPower: 0 },
    },
  });
  assert.equal(result.state.mixing.inventory, game.mixing.inventory);
  assert.equal(result.state.recipe, game.recipe);
  assert.deepEqual(game, original);
});

test('empty and ended Pour Out actions are free no-ops', () => {
  const empty = createGame(() => 0.9);
  const mixed = add(empty, 'dragon-tears').state;
  for (const [input, reason] of [
    [empty, 'empty-cauldron'],
    [{ ...mixed, timeRemaining: 0 }, 'game-over'],
    [{ ...mixed, lives: 0 }, 'game-over'],
    [{ ...mixed, status: 'game-over', endReason: 'out-of-lives' }, 'game-over'],
  ]) {
    const game = freezeGame(input);
    const result = pourOutGame(game);
    assert.deepEqual(result, { accepted: false, reason, state: game });
    assert.equal(result.state, game);
  }
});

test('Pour Out handles fractional timeout and empty-stock endings without counting its penalty as play time', () => {
  const base = add(
    createGame(() => 0.9),
    'dragon-tears',
  ).state;
  for (const remaining of [10, 3.25]) {
    const game = freezeGame({ ...base, timeRemaining: remaining, elapsedTime: 8.5 });
    const result = pourOutGame(game);
    assert.equal(result.accepted, true);
    assert.equal(result.state.status, 'game-over');
    assert.equal(result.state.endReason, 'time-expired');
    assert.equal(result.state.timeRemaining, 0);
    assert.equal(result.timeDelta, -remaining);
    assert.equal(result.state.elapsedTime, 8.5);
    assert.deepEqual(result.state.mixing.mixture, []);
  }

  const depleted = freezeGame({
    ...base,
    mixing: { ...base.mixing, inventory: noStockExcept('dragon-tears', 0) },
  });
  const result = pourOutGame(depleted);
  assert.equal(result.accepted, true);
  assert.equal(result.state.status, 'game-over');
  assert.equal(result.state.endReason, 'out-of-ingredients');
  assert.equal(result.state.timeRemaining, depleted.timeRemaining - 10);
  assert.equal(result.state.lives, depleted.lives);
  assert.equal(result.state.mixing.inventory, depleted.mixing.inventory);
});
