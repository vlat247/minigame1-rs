import assert from 'node:assert/strict';
import test from 'node:test';
import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../src/data/difficulty.ts';
import { INGREDIENT_CATALOGUE } from '../src/data/ingredients.ts';
import { getReactions, REACTIONS, REACTION_IDS_BY_DIFFICULTY } from '../src/data/reactions.ts';
import { calculateTotals } from '../src/logic/ingredients.ts';
import {
  calculateCauldronTotals,
  evaluateReactions,
  getNewlyActiveReactions,
} from '../src/logic/reactions.ts';

function byId(id) {
  const reaction = REACTIONS.find((candidate) => candidate.id === id);
  assert.ok(reaction, `Reaction ${id} exists`);
  return reaction;
}

function ingredients(...ids) {
  return ids.map((id) => INGREDIENT_CATALOGUE[id]);
}

function assertTotals(actual, expected) {
  for (const parameter of ['temperature', 'density', 'magicPower']) {
    assert.ok(
      Math.abs(actual[parameter] - expected[parameter]) < 1e-9,
      `${parameter}: expected ${expected[parameter]}, got ${actual[parameter]}`,
    );
  }
}

test('the catalogue contains all fifteen official reactions in their specified order', () => {
  assert.deepEqual(
    REACTIONS.map(({ id, name }) => [id, name]),
    [
      ['bubbling', 'Bubbling'],
      ['volatile-mix', 'Volatile Mix'],
      ['solar-frost', 'Solar Frost'],
      ['rooted-steam', 'Rooted Steam'],
      ['ashen-bloom', 'Ashen Bloom'],
      ['annihilation', 'Annihilation'],
      ['pressure-spike', 'Pressure Spike'],
      ['magma-flux', 'Magma Flux'],
      ['deep-freeze', 'Deep Freeze'],
      ['arcane-saturation', 'Arcane Saturation'],
      ['steam-burst', 'Steam Burst'],
      ['black-ice', 'Black Ice'],
      ['heavy-spark', 'Heavy Spark'],
      ['burning-root', 'Burning Root'],
      ['void-resonance', 'Void Resonance'],
    ],
  );
  assert.equal(new Set(REACTIONS.map(({ id }) => id)).size, 15);
  for (const reaction of REACTIONS) assert.ok(reaction.description.length > 0);
});

test('each difficulty has the configured number of reachable reactions', () => {
  assert.deepEqual(REACTION_IDS_BY_DIFFICULTY, {
    easy: [],
    medium: ['bubbling', 'solar-frost'],
    hard: ['bubbling', 'volatile-mix', 'solar-frost'],
  });
  for (const difficulty of DIFFICULTIES) {
    assert.equal(getReactions(difficulty).length, DIFFICULTY_SETTINGS[difficulty].reactionCount);
    assert.deepEqual(
      getReactions(difficulty).map(({ id }) => id),
      REACTION_IDS_BY_DIFFICULTY[difficulty],
    );
  }
  assert.equal(getReactions('medium').includes(byId('volatile-mix')), false);
  assert.equal(getReactions('hard').includes(byId('volatile-mix')), true);
});

test('catalogue transforms match the published formulas without mutating their input', () => {
  const base = Object.freeze({ temperature: 40, density: 50, magicPower: 80 });
  const expected = [
    [40, 50, 120],
    [40, 50, 80],
    [0, 60, 80],
    [40, 62.5, 72],
    [50, 50, 100],
    [0, 100, 80],
    [40, 70, 88],
    [40, 45, 96],
    [40, 57.5, 68],
    [45, 50, 80],
    [50, 50, 80],
    [30, 50, 96],
    [40, 60, 88],
    [55, 45, 80],
    [35, 50, 104],
  ];
  for (const [index, reaction] of REACTIONS.entries()) {
    const [temperature, density, magicPower] = expected[index];
    assertTotals(reaction.apply(base), { temperature, density, magicPower });
  }
  assert.deepEqual(base, { temperature: 40, density: 50, magicPower: 80 });
});

test('only specified activation penalties are present in the full catalogue', () => {
  assert.deepEqual(
    REACTIONS.filter(
      ({ timePenalty, lifePenalty, clearsCauldron }) =>
        timePenalty > 0 || lifePenalty > 0 || clearsCauldron,
    ).map(({ id, timePenalty, lifePenalty, clearsCauldron }) => [
      id,
      timePenalty,
      lifePenalty,
      clearsCauldron,
    ]),
    [
      ['bubbling', 10, 0, false],
      ['volatile-mix', 0, 1, true],
      ['steam-burst', 5, 0, false],
    ],
  );
});

test('ingredient-pair reactions require both types and permit ordered duplicates', () => {
  const cases = [
    ['bubbling', 'fairy-dust', 'caustic-acid'],
    ['volatile-mix', 'phoenix-feather', 'essence-of-the-void'],
    ['solar-frost', 'dragon-tears', 'frost-lotus'],
    ['rooted-steam', 'mandrake-root', 'toad-slime'],
    ['ashen-bloom', 'phoenix-feather', 'fairy-dust'],
  ];
  const totals = { temperature: 0, density: 0, magicPower: 0 };
  for (const [id, first, second] of cases) {
    const reaction = byId(id);
    assert.equal(reaction.isActive([], totals), false);
    assert.equal(reaction.isActive(ingredients(first), totals), false);
    assert.equal(reaction.isActive(ingredients(second), totals), false);
    assert.equal(reaction.isActive(ingredients(first, first), totals), false);
    assert.equal(reaction.isActive(ingredients(first, second), totals), true);
    assert.equal(reaction.isActive(ingredients(second, first), totals), true);
    assert.equal(reaction.isActive(ingredients(first, second, second), totals), true);
  }
});

test('Annihilation checks strict per-ingredient temperature limits', () => {
  const reaction = byId('annihilation');
  const totals = { temperature: 100, density: 70, magicPower: 80 };
  assert.equal(reaction.isActive(ingredients('dragon-tears', 'frost-lotus'), totals), true);
  assert.equal(reaction.isActive(ingredients('dragon-tears', 'essence-of-the-void'), totals), true);
  assert.equal(reaction.isActive(ingredients('dragon-tears', 'mandrake-root'), totals), false);
  assert.equal(reaction.isActive(ingredients('fairy-dust', 'frost-lotus'), totals), false);
  assert.equal(
    reaction.isActive(
      [
        { ...INGREDIENT_CATALOGUE['dragon-tears'], temperature: 15 },
        INGREDIENT_CATALOGUE['frost-lotus'],
      ],
      totals,
    ),
    false,
  );
  assert.equal(
    reaction.isActive(
      [
        INGREDIENT_CATALOGUE['dragon-tears'],
        { ...INGREDIENT_CATALOGUE['frost-lotus'], temperature: -15 },
      ],
      totals,
    ),
    false,
  );
});

test('raw-stat predicates include their exact published boundaries', () => {
  const cases = [
    ['pressure-spike', 'density', 70, 69.99, 70.01],
    ['magma-flux', 'temperature', 60, 59.99, 60.01],
    ['deep-freeze', 'temperature', -20, -19.99, -20.01],
    ['arcane-saturation', 'magicPower', 80, 79.99, 80.01],
  ];
  const base = { temperature: 0, density: 0, magicPower: 0 };
  for (const [id, parameter, boundary, outside, inside] of cases) {
    const reaction = byId(id);
    assert.equal(reaction.isActive([], { ...base, [parameter]: boundary }), true);
    assert.equal(reaction.isActive([], { ...base, [parameter]: outside }), false);
    assert.equal(reaction.isActive([], { ...base, [parameter]: inside }), true);
  }
});

test('mixed predicates require both the ingredient pair and the inclusive raw-stat threshold', () => {
  const cases = [
    ['steam-burst', ['dragon-tears', 'caustic-acid'], 'temperature', 35, 34.99],
    ['black-ice', ['frost-lotus', 'essence-of-the-void'], 'density', 0, 0.01],
    ['heavy-spark', ['fairy-dust', 'toad-slime'], 'density', 40, 39.99],
    ['burning-root', ['mandrake-root', 'phoenix-feather'], 'temperature', 40, 39.99],
    ['void-resonance', ['essence-of-the-void', 'dragon-tears'], 'magicPower', 50, 49.99],
  ];
  const base = { temperature: 0, density: 0, magicPower: 0 };
  for (const [id, ids, parameter, boundary, outside] of cases) {
    const reaction = byId(id);
    const totals = { ...base, [parameter]: boundary };
    assert.equal(reaction.isActive(ingredients(...ids), totals), true);
    assert.equal(reaction.isActive(ingredients(...ids), { ...base, [parameter]: outside }), false);
    assert.equal(reaction.isActive(ingredients(ids[0]), totals), false);
    assert.equal(reaction.isActive(ingredients(ids[1]), totals), false);
    assert.equal(reaction.isActive([], totals), false);
  }
});

test('Easy uses raw sums even when a catalogue trigger would otherwise be active', () => {
  const mixture = ['dragon-tears', 'frost-lotus'];
  assert.deepEqual(evaluateReactions(mixture, 'easy'), {
    totals: calculateTotals(mixture),
    activeReactions: [],
  });
});

test('Bubbling recomputes from fresh sums without compounding its multiplier', () => {
  const mixture = Object.freeze(['fairy-dust', 'caustic-acid']);
  assert.deepEqual(calculateCauldronTotals(mixture, 'medium'), {
    temperature: 22,
    density: 23,
    magicPower: 51,
  });
  assert.deepEqual(calculateCauldronTotals(mixture, 'medium'), {
    temperature: 22,
    density: 23,
    magicPower: 51,
  });
  assert.deepEqual(calculateCauldronTotals([...mixture, 'fairy-dust'], 'medium'), {
    temperature: 34,
    density: 32,
    magicPower: 69,
  });
  assert.deepEqual(mixture, ['fairy-dust', 'caustic-acid']);
});

test('Solar Frost retains fractional totals and applies once across additional ingredients', () => {
  assertTotals(calculateCauldronTotals(['dragon-tears', 'frost-lotus'], 'medium'), {
    temperature: 0,
    density: 14.4,
    magicPower: 24,
  });
  assertTotals(
    calculateCauldronTotals(['dragon-tears', 'frost-lotus', 'mandrake-root'], 'medium'),
    {
      temperature: 0,
      density: 38.4,
      magicPower: 32,
    },
  );
});

test('simultaneous enabled modifiers are evaluated in catalogue order from the same ingredient list', () => {
  const mixture = Object.freeze(['fairy-dust', 'caustic-acid', 'dragon-tears', 'frost-lotus']);
  const evaluation = evaluateReactions(mixture, 'hard');
  assert.deepEqual(
    evaluation.activeReactions.map(({ id }) => id),
    ['bubbling', 'solar-frost'],
  );
  assertTotals(evaluation.totals, { temperature: 0, density: 42, magicPower: 87 });
});

test('disabled catalogue entries do not alter Hard totals or create extra active reactions', () => {
  const mixture = ['phoenix-feather', 'phoenix-feather'];
  const evaluation = evaluateReactions(mixture, 'hard');
  assert.deepEqual(evaluation.activeReactions, []);
  assert.deepEqual(evaluation.totals, { temperature: 100, density: -20, magicPower: 60 });
  assert.equal(
    byId('magma-flux').isActive(ingredients(...mixture), calculateTotals(mixture)),
    true,
  );
});

test('new activation excludes continuing reactions and resets after the mixture is cleared', () => {
  const before = Object.freeze(['fairy-dust']);
  const active = Object.freeze(['fairy-dust', 'caustic-acid']);
  const continued = Object.freeze([...active, 'fairy-dust']);
  assert.deepEqual(
    getNewlyActiveReactions(before, active, 'medium').map(({ id }) => id),
    ['bubbling'],
  );
  assert.deepEqual(getNewlyActiveReactions(active, continued, 'medium'), []);
  assert.deepEqual(getNewlyActiveReactions(continued, [], 'medium'), []);
  assert.deepEqual(
    getNewlyActiveReactions([], active, 'medium').map(({ id }) => id),
    ['bubbling'],
  );
  assert.deepEqual(getNewlyActiveReactions(before, active, 'easy'), []);
});

test('a new reaction can activate while an existing modifier remains active', () => {
  const before = ['fairy-dust', 'caustic-acid', 'dragon-tears'];
  const after = [...before, 'frost-lotus'];
  assert.deepEqual(
    getNewlyActiveReactions(before, after, 'hard').map(({ id }) => id),
    ['solar-frost'],
  );
  assert.deepEqual(
    evaluateReactions(after, 'hard').activeReactions.map(({ id }) => id),
    ['bubbling', 'solar-frost'],
  );
});

test('Volatile Mix reports its activation without mutating or clearing the inspected mixture', () => {
  const before = Object.freeze(['phoenix-feather']);
  const after = Object.freeze(['phoenix-feather', 'essence-of-the-void']);
  const evaluation = evaluateReactions(after, 'hard');
  assert.deepEqual(
    evaluation.activeReactions.map(({ id }) => id),
    ['volatile-mix'],
  );
  assert.deepEqual(evaluation.totals, { temperature: 30, density: -20, magicPower: 70 });
  const newlyActive = getNewlyActiveReactions(before, after, 'hard');
  assert.equal(newlyActive[0].lifePenalty, 1);
  assert.equal(newlyActive[0].clearsCauldron, true);
  assert.deepEqual(after, ['phoenix-feather', 'essence-of-the-void']);
});
