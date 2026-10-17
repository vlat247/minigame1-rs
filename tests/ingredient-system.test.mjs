import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INGREDIENTS,
  INGREDIENT_IDS,
  LEVEL_ONE_INGREDIENTS,
  getIngredient,
  isIngredientId,
} from '../src/data/ingredients.ts';
import {
  MAX_STARTING_STOCK,
  MIN_STARTING_STOCK,
  MIXTURE_CAPACITY,
  addIngredient,
  calculateTotals,
  createMixingState,
} from '../src/logic/ingredients.ts';

function freezeState(state) {
  Object.freeze(state.inventory);
  Object.freeze(state.mixture);
  Object.freeze(state.totals);
  return Object.freeze(state);
}

function addSuccessfully(state, id) {
  const result = addIngredient(state, id);
  assert.equal(result.accepted, true);
  return result.state;
}

test('the catalogue preserves all official values and order, with six Level 1 ingredients', () => {
  assert.deepEqual(
    INGREDIENTS.map(({ id, name, temperature, density, magicPower }) => [
      id,
      name,
      temperature,
      density,
      magicPower,
    ]),
    [
      ['dragon-tears', 'Dragon Tears', 25, 8, 10],
      ['fairy-dust', 'Fairy Dust', 12, 9, 12],
      ['frost-lotus', 'Frost Lotus', -18, 4, 14],
      ['mandrake-root', 'Mandrake Root', -5, 20, 8],
      ['caustic-acid', 'Caustic Acid', 10, 14, 22],
      ['essence-of-the-void', 'Essence of the Void', -20, -10, 40],
      ['phoenix-feather', 'Phoenix Feather', 50, -10, 30],
      ['toad-slime', 'Toad Slime', 5, 30, 0],
    ],
  );
  assert.deepEqual(
    INGREDIENTS.map(({ id }) => id),
    INGREDIENT_IDS,
  );
  assert.deepEqual(LEVEL_ONE_INGREDIENTS, INGREDIENTS.slice(0, 6));
  assert.equal(isIngredientId('dragon-tears'), true);
  assert.equal(isIngredientId('phoenix-feather'), true);
  assert.equal(isIngredientId('constructor'), false);
  assert.equal(isIngredientId('__proto__'), false);
  assert.equal(getIngredient('missing'), undefined);
  assert.equal(getIngredient('fairy-dust'), INGREDIENTS[1]);
});

test('new games sample independently once per shelf ingredient and include both stock endpoints', () => {
  const samples = [0, 1 - Number.EPSILON, 0.1, 0.25, 0.5, 0.75];
  let calls = 0;
  const state = createMixingState(() => samples[calls++]);

  assert.equal(calls, 6);
  assert.deepEqual(state.inventory, {
    'dragon-tears': MIN_STARTING_STOCK,
    'fairy-dust': MAX_STARTING_STOCK,
    'frost-lotus': 3,
    'mandrake-root': 5,
    'caustic-acid': 9,
    'essence-of-the-void': 12,
    'phoenix-feather': 0,
    'toad-slime': 0,
  });
  assert.deepEqual(state.mixture, []);
  assert.deepEqual(state.totals, { temperature: 0, density: 0, magicPower: 0 });
});

test('each of the fourteen stock values occupies its own random interval', () => {
  for (let stock = MIN_STARTING_STOCK; stock <= MAX_STARTING_STOCK; stock += 1) {
    const state = createMixingState(() => (stock - MIN_STARTING_STOCK + 0.5) / 14);
    assert.ok(LEVEL_ONE_INGREDIENTS.every(({ id }) => state.inventory[id] === stock));
  }

  for (const sample of [-0.1, 1, Infinity, NaN]) {
    assert.throws(() => createMixingState(() => sample), RangeError);
  }
});

test('successful additions preserve duplicates and order, consume exactly one portion, and sum totals', () => {
  const initial = freezeState(createMixingState(() => 0.5));
  let state = initial;
  const additions = ['dragon-tears', 'frost-lotus', 'dragon-tears', 'essence-of-the-void'];

  for (const id of additions) {
    const previous = freezeState(state);
    state = addSuccessfully(previous, id);
    assert.notEqual(state, previous);
    assert.notEqual(state.inventory, previous.inventory);
    assert.notEqual(state.mixture, previous.mixture);
    assert.equal(state.inventory[id], previous.inventory[id] - 1);
    assert.equal(state.mixture.length, previous.mixture.length + 1);
    for (const otherId of INGREDIENT_IDS.filter((candidate) => candidate !== id)) {
      assert.equal(state.inventory[otherId], previous.inventory[otherId]);
    }
  }

  assert.deepEqual(state.mixture, additions);
  assert.deepEqual(state.totals, { temperature: 12, density: 10, magicPower: 74 });
  const initialStock = Object.values(initial.inventory).reduce((sum, stock) => sum + stock, 0);
  const remainingStock = Object.values(state.inventory).reduce((sum, stock) => sum + stock, 0);
  assert.equal(initialStock - remainingStock, additions.length);
  assert.deepEqual(initial.mixture, []);
  assert.equal(initial.inventory['dragon-tears'], 9);
});

test('a full cauldron rejects the next addition without changing or consuming anything', () => {
  let state = createMixingState(() => 0.9);
  for (let count = 0; count < MIXTURE_CAPACITY; count += 1) {
    state = addSuccessfully(state, 'fairy-dust');
  }
  freezeState(state);
  const result = addIngredient(state, 'caustic-acid');

  assert.deepEqual(result, { accepted: false, reason: 'cauldron-full', state });
  assert.equal(result.state, state);
  assert.equal(state.mixture.length, 4);
  assert.equal(state.inventory['caustic-acid'], 14);
});

test('exhausted stock rejects additions even when there is room in the cauldron', () => {
  let state = createMixingState(() => 0);
  state = addSuccessfully(state, 'dragon-tears');
  state = freezeState(addSuccessfully(state, 'dragon-tears'));
  const result = addIngredient(state, 'dragon-tears');

  assert.deepEqual(result, { accepted: false, reason: 'out-of-stock', state });
  assert.equal(result.state, state);
  assert.equal(state.mixture.length, 2);
  assert.equal(state.inventory['dragon-tears'], 0);
});

test('unknown and off-shelf ingredient IDs cannot change the state, even with forged stock', () => {
  const initial = createMixingState(() => 0.5);
  const state = freezeState({
    ...initial,
    inventory: { ...initial.inventory, 'phoenix-feather': 15, 'toad-slime': 15 },
  });

  for (const id of ['missing', '', '__proto__', 'constructor']) {
    const result = addIngredient(state, id);
    assert.deepEqual(result, { accepted: false, reason: 'unknown-ingredient', state });
    assert.equal(result.state, state);
  }
  for (const id of ['phoenix-feather', 'toad-slime']) {
    const result = addIngredient(state, id);
    assert.deepEqual(result, { accepted: false, reason: 'unavailable-ingredient', state });
    assert.equal(result.state, state);
  }
});

test('totals retain negative values and values above 100', () => {
  let state = createMixingState(() => 0.9);
  for (let count = 0; count < 4; count += 1) {
    state = addSuccessfully(state, 'essence-of-the-void');
  }

  assert.deepEqual(state.totals, { temperature: -80, density: -40, magicPower: 160 });
  assert.deepEqual(calculateTotals(state.mixture), state.totals);
  assert.deepEqual(calculateTotals([]), { temperature: 0, density: 0, magicPower: 0 });
});

test('starting another game resets the mixture and totals and samples fresh stock independently', () => {
  const played = freezeState(
    addSuccessfully(
      createMixingState(() => 0),
      'essence-of-the-void',
    ),
  );
  let calls = 0;
  const restarted = createMixingState(() => {
    calls += 1;
    return 1 - Number.EPSILON;
  });

  assert.equal(calls, 6);
  assert.deepEqual(restarted.mixture, []);
  assert.deepEqual(restarted.totals, { temperature: 0, density: 0, magicPower: 0 });
  assert.ok(LEVEL_ONE_INGREDIENTS.every(({ id }) => restarted.inventory[id] === 15));
  assert.equal(restarted.inventory['phoenix-feather'], 0);
  assert.equal(restarted.inventory['toad-slime'], 0);
  assert.deepEqual(played.mixture, ['essence-of-the-void']);
  assert.equal(played.inventory['essence-of-the-void'], 1);
  assert.deepEqual(played.totals, { temperature: -20, density: -10, magicPower: 40 });
});
