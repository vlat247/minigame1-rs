import assert from 'node:assert/strict';
import test from 'node:test';
import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../src/data/difficulty.ts';
import { getShelfIngredients, INGREDIENT_IDS } from '../src/data/ingredients.ts';
import { RECIPES } from '../src/data/recipes.ts';
import { calculateTotals } from '../src/logic/ingredients.ts';
import { createGame } from '../src/state/game.ts';
import { GAME_SAVE_STORAGE_KEY, createGameSaveStore } from '../src/storage/save.ts';

function fakeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    values,
    calls,
    storage: {
      getItem(key) {
        calls.push(['get', key]);
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        calls.push(['set', key, value]);
        values.set(key, value);
      },
      removeItem(key) {
        calls.push(['remove', key]);
        values.delete(key);
      },
    },
  };
}

function unfinishedGame(difficulty = 'medium') {
  const game = createGame(() => 0.5, difficulty);
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelf = getShelfIngredients(difficulty);
  const mixture = [shelf[0].id, shelf[1].id, shelf[0].id];
  const inventory = { ...game.mixing.inventory, [shelf[0].id]: 0, [shelf[1].id]: 1 };
  return {
    ...game,
    mixing: { inventory, mixture, totals: calculateTotals(mixture) },
    score: settings.scorePerBrew * 2,
    lives: Math.max(1, settings.lives - 1),
    timeRemaining: settings.startingTime - 30.125,
    elapsedTime: 98.375,
  };
}

function serializedGame(difficulty = 'medium') {
  const fake = fakeStorage();
  const store = createGameSaveStore(() => fake.storage);
  assert.equal(store.save(unfinishedGame(difficulty), true), true);
  return JSON.parse(fake.values.get(GAME_SAVE_STORAGE_KEY));
}

test('an absent save returns no game without writing or removing anything', () => {
  const fake = fakeStorage();
  assert.deepEqual(createGameSaveStore(() => fake.storage).load(), { save: null, error: null });
  assert.deepEqual(fake.calls, [['get', GAME_SAVE_STORAGE_KEY]]);
});

test('every difficulty round-trips exact stocks, ordered duplicates, fractional time and pause status', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const paused of [false, true]) {
      const game = unfinishedGame(difficulty);
      const original = structuredClone(game);
      const fake = fakeStorage();
      const store = createGameSaveStore(() => fake.storage);
      assert.equal(store.save(game, paused), true);
      const result = store.load();
      assert.deepEqual(result, { save: { game, paused }, error: null });
      assert.deepEqual(game, original);
      assert.notEqual(result.save.game, game);
      assert.notEqual(result.save.game.mixing.inventory, game.mixing.inventory);
      assert.notEqual(result.save.game.mixing.mixture, game.mixing.mixture);
      assert.equal(
        result.save.game.recipe,
        RECIPES.find(({ id }) => id === game.recipe.id),
      );

      const serialized = JSON.parse(fake.values.get(GAME_SAVE_STORAGE_KEY));
      assert.equal(serialized.version, 1);
      assert.equal(serialized.difficulty, difficulty);
      assert.equal(serialized.status, paused ? 'paused' : 'playing');
      assert.equal(serialized.timeLeft, game.timeRemaining);
      assert.deepEqual(serialized.activeRecipe, game.recipe);
      assert.deepEqual(serialized.cauldronIngredients, game.mixing.mixture);
      assert.deepEqual(serialized.shelfStock, game.mixing.inventory);
      assert.equal(serialized.elapsedTime, game.elapsedTime);
      assert.equal(Object.hasOwn(serialized, 'totals'), false);
    }
  }
});

test('loading rebuilds totals from catalogue values and ignores cached derived data', () => {
  const saved = serializedGame();
  saved.totals = { temperature: 9999, density: 9999, magicPower: 9999 };
  const fake = fakeStorage({ [GAME_SAVE_STORAGE_KEY]: JSON.stringify(saved) });
  const result = createGameSaveStore(() => fake.storage).load();
  assert.equal(result.error, null);
  assert.deepEqual(result.save.game.mixing.totals, calculateTotals(saved.cauldronIngredients));
  assert.deepEqual(fake.calls, [['get', GAME_SAVE_STORAGE_KEY]]);
});

test('malformed JSON and unsupported schemas are rejected and removed without touching other data', () => {
  const valid = serializedGame();
  for (const raw of [
    '{broken',
    '',
    'null',
    '[]',
    '{}',
    '5',
    '"saved game"',
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, version: '1' }),
    JSON.stringify({ ...valid, version: undefined }),
  ]) {
    const fake = fakeStorage({
      [GAME_SAVE_STORAGE_KEY]: raw,
      'alchemists-cauldron:leaderboard:v1': 'leaderboard',
    });
    assert.deepEqual(createGameSaveStore(() => fake.storage).load(), {
      save: null,
      error: 'corrupt',
    });
    assert.equal(fake.values.has(GAME_SAVE_STORAGE_KEY), false);
    assert.equal(fake.values.get('alchemists-cauldron:leaderboard:v1'), 'leaderboard');
    assert.deepEqual(fake.calls, [
      ['get', GAME_SAVE_STORAGE_KEY],
      ['remove', GAME_SAVE_STORAGE_KEY],
    ]);
  }
});

test('missing and invalid run fields cannot produce a Continue game', () => {
  const valid = serializedGame();
  const settings = DIFFICULTY_SETTINGS.medium;
  const invalidFields = {
    difficulty: ['nightmare', null, 1],
    score: [-1, 0.5, 1, NaN, Infinity, '200', Number.MAX_SAFE_INTEGER + 1],
    timeLeft: [0, -1, NaN, Infinity, settings.startingTime + 0.01, '150'],
    lives: [0, -1, 1.5, settings.lives + 1, '3'],
    elapsedTime: [-1, NaN, Infinity, '20'],
    status: ['game-over', 'out-of-lives', '', null],
    activeRecipe: [null, [], {}, { ...valid.activeRecipe, id: 'unknown-recipe' }],
    shelfStock: [null, [], {}, { ...valid.shelfStock, unknown: 1 }],
    cauldronIngredients: [null, {}, ['unknown-ingredient'], [null], [42]],
  };
  for (const [field, invalidValues] of Object.entries(invalidFields)) {
    for (const value of [...invalidValues, undefined]) {
      const fake = fakeStorage({
        [GAME_SAVE_STORAGE_KEY]: JSON.stringify({ ...valid, [field]: value }),
      });
      assert.deepEqual(
        createGameSaveStore(() => fake.storage).load(),
        { save: null, error: 'corrupt' },
        `${field}: ${JSON.stringify(value)}`,
      );
    }
  }
});

test('the saved recipe must match its catalogue name, difficulty and all three ranges', () => {
  const valid = serializedGame();
  const recipes = [
    { ...valid.activeRecipe, name: 'Changed recipe' },
    { ...valid.activeRecipe, difficulty: 'easy' },
    { ...valid.activeRecipe, temperature: { ...valid.activeRecipe.temperature, min: -100 } },
    { ...valid.activeRecipe, density: { ...valid.activeRecipe.density, max: 999 } },
    { ...valid.activeRecipe, magicPower: { min: 0, max: 0 } },
    { ...valid.activeRecipe, density: null },
    RECIPES.find(({ difficulty }) => difficulty === 'hard'),
  ];
  for (const activeRecipe of recipes) {
    const fake = fakeStorage({
      [GAME_SAVE_STORAGE_KEY]: JSON.stringify({ ...valid, activeRecipe }),
    });
    assert.deepEqual(createGameSaveStore(() => fake.storage).load(), {
      save: null,
      error: 'corrupt',
    });
  }
});

test('stock must contain every catalogue ID with integers from zero to fifteen', () => {
  const valid = serializedGame();
  for (const stock of [-1, 16, 1.5, null, '2']) {
    const fake = fakeStorage({
      [GAME_SAVE_STORAGE_KEY]: JSON.stringify({
        ...valid,
        shelfStock: { ...valid.shelfStock, 'dragon-tears': stock },
      }),
    });
    assert.deepEqual(createGameSaveStore(() => fake.storage).load(), {
      save: null,
      error: 'corrupt',
    });
  }
  const shelfStock = { ...valid.shelfStock };
  delete shelfStock['dragon-tears'];
  const fake = fakeStorage({ [GAME_SAVE_STORAGE_KEY]: JSON.stringify({ ...valid, shelfStock }) });
  assert.deepEqual(createGameSaveStore(() => fake.storage).load(), {
    save: null,
    error: 'corrupt',
  });
});

test('off-shelf ingredients and a cauldron beyond difficulty capacity are rejected', () => {
  const valid = serializedGame('easy');
  const permitted = new Set(getShelfIngredients('easy').map(({ id }) => id));
  const unavailableId = INGREDIENT_IDS.find((id) => !permitted.has(id));
  assert.ok(unavailableId);
  for (const candidate of [
    { ...valid, shelfStock: { ...valid.shelfStock, [unavailableId]: 1 } },
    { ...valid, cauldronIngredients: [unavailableId] },
    {
      ...valid,
      cauldronIngredients: Array(DIFFICULTY_SETTINGS.easy.maxIngredients + 1).fill('dragon-tears'),
    },
  ]) {
    const fake = fakeStorage({ [GAME_SAVE_STORAGE_KEY]: JSON.stringify(candidate) });
    assert.deepEqual(createGameSaveStore(() => fake.storage).load(), {
      save: null,
      error: 'corrupt',
    });
  }
});

test('empty shelf is resumable with ingredients in the cauldron, and finished when both are empty', () => {
  const valid = serializedGame();
  valid.shelfStock = Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0]));
  const fake = fakeStorage({ [GAME_SAVE_STORAGE_KEY]: JSON.stringify(valid) });
  const store = createGameSaveStore(() => fake.storage);
  assert.equal(store.load().error, null);
  valid.cauldronIngredients = [];
  fake.values.set(GAME_SAVE_STORAGE_KEY, JSON.stringify(valid));
  assert.deepEqual(store.load(), { save: null, error: 'corrupt' });
});

test('invalid save input never overwrites the previous run or throws', () => {
  const previous = JSON.stringify(serializedGame());
  const fake = fakeStorage({ [GAME_SAVE_STORAGE_KEY]: previous });
  const store = createGameSaveStore(() => fake.storage);
  const game = unfinishedGame();
  for (const invalid of [
    null,
    {},
    { ...game, difficulty: 'unknown' },
    { ...game, score: 123 },
    { ...game, timeRemaining: 0 },
    { ...game, status: 'paused' },
    { ...game, endReason: 'out-of-lives' },
    {
      get status() {
        throw new Error('Bad getter');
      },
    },
  ]) {
    assert.equal(store.save(invalid, false), false);
    assert.equal(fake.values.get(GAME_SAVE_STORAGE_KEY), previous);
  }
  assert.equal(store.save(game, 'paused'), false);
  assert.deepEqual(fake.calls, []);
});

test('saving a finished game removes only the current save and never creates a resumable game', () => {
  for (const endReason of ['out-of-lives', 'out-of-ingredients', 'time-expired']) {
    const fake = fakeStorage({
      [GAME_SAVE_STORAGE_KEY]: JSON.stringify(serializedGame()),
      'alchemists-cauldron:leaderboard:v1': 'keep results',
    });
    const store = createGameSaveStore(() => fake.storage);
    assert.equal(store.save({ ...unfinishedGame(), status: 'game-over', endReason }, true), true);
    assert.equal(fake.values.has(GAME_SAVE_STORAGE_KEY), false);
    assert.equal(fake.values.get('alchemists-cauldron:leaderboard:v1'), 'keep results');
    assert.deepEqual(store.load(), { save: null, error: null });
  }
});

test('clearing succeeds for an empty store and removes only the current save key', () => {
  const fake = fakeStorage({
    [GAME_SAVE_STORAGE_KEY]: JSON.stringify(serializedGame()),
    other: 'keep this',
  });
  const store = createGameSaveStore(() => fake.storage);
  assert.equal(store.clear(), true);
  assert.equal(store.clear(), true);
  assert.equal(fake.values.has(GAME_SAVE_STORAGE_KEY), false);
  assert.equal(fake.values.get('other'), 'keep this');
  assert.deepEqual(fake.calls, [
    ['remove', GAME_SAVE_STORAGE_KEY],
    ['remove', GAME_SAVE_STORAGE_KEY],
  ]);
});

test('unavailable storage providers and blocked methods never escape the store', () => {
  const unavailable = createGameSaveStore(() => {
    throw new Error('Storage disabled');
  });
  assert.deepEqual(unavailable.load(), { save: null, error: 'unavailable' });
  assert.equal(unavailable.save(unfinishedGame(), false), false);
  assert.equal(unavailable.clear(), false);

  const blocked = createGameSaveStore(() => ({
    getItem() {
      throw new Error('Read blocked');
    },
    setItem() {
      throw new Error('Quota exceeded');
    },
    removeItem() {
      throw new Error('Removal blocked');
    },
  }));
  assert.deepEqual(blocked.load(), { save: null, error: 'unavailable' });
  assert.equal(blocked.save(unfinishedGame(), true), false);
  assert.equal(blocked.clear(), false);
  assert.equal(blocked.save({ ...unfinishedGame(), status: 'game-over' }, false), false);
});

test('failed cleanup of a corrupt save remains nonfatal and reports corrupt data', () => {
  const store = createGameSaveStore(() => ({
    getItem() {
      return '{bad json';
    },
    setItem() {
      assert.fail('Invalid saves must not be written.');
    },
    removeItem() {
      throw new Error('Removal blocked');
    },
  }));
  assert.deepEqual(store.load(), { save: null, error: 'corrupt' });
});
