import assert from 'node:assert/strict';
import test from 'node:test';
import { INGREDIENT_IDS } from '../src/data/ingredients.ts';
import { MEDIUM_RECIPES, RECIPES } from '../src/data/recipes.ts';
import {
  BREW_TOLERANCE,
  MAX_TIME,
  SCORE_PER_BREW,
  TIME_BONUS,
  brewGame,
  checkBrew,
  selectMediumRecipe,
} from '../src/logic/brewing.ts';
import { addIngredient } from '../src/logic/ingredients.ts';
import { STARTING_LIVES, STARTING_TIME, createGame } from '../src/state/game.ts';

function recipeById(id) {
  const recipe = RECIPES.find((candidate) => candidate.id === id);
  assert.ok(recipe, `Recipe ${id} exists`);
  return recipe;
}

function addPortions(game, ids) {
  let mixing = game.mixing;
  for (const id of ids) {
    const result = addIngredient(mixing, id, game.difficulty);
    assert.equal(result.accepted, true);
    mixing = result.state;
  }
  return { ...game, mixing };
}

function gameWithMixture(ids, recipeId = 'acid-spark') {
  return addPortions({ ...createGame(() => 0.9), recipe: recipeById(recipeId) }, ids);
}

function freezeGame(game) {
  Object.freeze(game.mixing.inventory);
  Object.freeze(game.mixing.mixture);
  Object.freeze(game.mixing.totals);
  Object.freeze(game.mixing);
  return Object.freeze(game);
}

test('the catalogue contains all twenty official recipes in order with their exact ranges', () => {
  assert.deepEqual(
    RECIPES.map((recipe) => [
      recipe.id,
      recipe.name,
      recipe.difficulty,
      [recipe.temperature.min, recipe.temperature.max],
      [recipe.density.min, recipe.density.max],
      [recipe.magicPower.min, recipe.magicPower.max],
    ]),
    [
      ['moon-mist', 'Moon Mist', 'easy', [32, 42], [12, 22], [17, 27]],
      ['root-bloom', 'Root Bloom', 'easy', [2, 12], [24, 34], [15, 25]],
      ['frost-steam', 'Frost Steam', 'easy', [2, 12], [7, 17], [19, 29]],
      ['quiet-swirl', 'Quiet Swirl', 'easy', [-28, -18], [19, 29], [17, 27]],
      ['bright-dew', 'Bright Dew', 'easy', [27, 37], [32, 42], [25, 35]],
      ['snow-dust', 'Snow Dust', 'easy', [-16, -6], [28, 38], [29, 39]],
      ['acid-spark', 'Acid Spark', 'medium', [17, 27], [18, 28], [29, 39]],
      ['void-ember', 'Void Ember', 'medium', [0, 10], [0, 10], [45, 55]],
      ['heavy-acid', 'Heavy Acid', 'medium', [0, 10], [29, 39], [25, 35]],
      ['frost-acid', 'Frost Acid', 'medium', [-13, -3], [13, 23], [31, 41]],
      ['dusty-void', 'Dusty Void', 'medium', [-13, -3], [0, 10], [47, 57]],
      ['dragon-void', 'Dragon Void', 'medium', [25, 35], [1, 11], [55, 65]],
      ['rooted-night', 'Rooted Night', 'medium', [-18, -8], [14, 24], [55, 65]],
      ['phoenix-pulse', 'Phoenix Pulse', 'hard', [57, 67], [0, 10], [37, 47]],
      ['slime-crown', 'Slime Crown', 'hard', [-5, 5], [45, 55], [3, 13]],
      ['void-flame', 'Void Flame', 'hard', [25, 35], [0, 10], [60, 70]],
      ['acid-bog', 'Acid Bog', 'hard', [10, 20], [39, 49], [17, 27]],
      ['frozen-ash', 'Frozen Ash', 'hard', [27, 37], [0, 10], [39, 49]],
      ['triple-eclipse', 'Triple Eclipse', 'hard', [-20, -10], [19, 29], [60, 70]],
      ['ember-soup', 'Ember Soup', 'hard', [62, 72], [24, 34], [37, 47]],
    ],
  );
  assert.equal(new Set(RECIPES.map(({ id }) => id)).size, 20);
  assert.deepEqual(MEDIUM_RECIPES, RECIPES.slice(6, 13));
});

test('random selection reaches all seven Medium recipes and permits immediate repeats', () => {
  assert.equal(
    selectMediumRecipe(() => 0),
    MEDIUM_RECIPES[0],
  );
  assert.equal(
    selectMediumRecipe(() => 1 - Number.EPSILON),
    MEDIUM_RECIPES[6],
  );
  for (let index = 0; index < MEDIUM_RECIPES.length; index += 1) {
    assert.equal(
      selectMediumRecipe(() => (index + 0.5) / MEDIUM_RECIPES.length),
      MEDIUM_RECIPES[index],
    );
  }
  assert.equal(
    selectMediumRecipe(() => 0),
    selectMediumRecipe(() => 0),
  );
  for (const invalid of [-0.1, 1, Infinity, NaN]) {
    assert.throws(() => selectMediumRecipe(() => invalid), RangeError);
  }
});

test('new games initialize inventory, a random Medium recipe, score, lives and time', () => {
  let calls = 0;
  const game = createGame(() => {
    calls += 1;
    return calls === 7 ? 1 - Number.EPSILON : 0;
  });

  assert.equal(calls, 7);
  assert.equal(game.difficulty, 'medium');
  assert.equal(game.recipe, MEDIUM_RECIPES[6]);
  assert.equal(game.score, 0);
  assert.equal(game.lives, STARTING_LIVES);
  assert.equal(game.lives, 3);
  assert.equal(STARTING_TIME, MAX_TIME);
  assert.equal(game.timeRemaining, 150);
  assert.equal(game.status, 'playing');
  assert.equal(game.endReason, null);
  assert.deepEqual(game.mixing.mixture, []);
  assert.deepEqual(game.mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
  assert.equal(game.mixing.inventory['dragon-tears'], 2);
  assert.equal(game.mixing.inventory['essence-of-the-void'], 2);
  assert.equal(game.mixing.inventory['phoenix-feather'], 0);
});

test('each parameter uses inclusive ±8 boundaries, including negative ranges', () => {
  const recipe = recipeById('frost-acid');
  const center = { temperature: -8, density: 18, magicPower: 36 };
  assert.equal(BREW_TOLERANCE, 8);
  assert.equal(checkBrew(center, recipe).success, true);

  for (const parameter of ['temperature', 'density', 'magicPower']) {
    const minimum = recipe[parameter].min - BREW_TOLERANCE;
    const maximum = recipe[parameter].max + BREW_TOLERANCE;
    for (const boundary of [minimum, maximum]) {
      const result = checkBrew({ ...center, [parameter]: boundary }, recipe);
      assert.equal(result.success, true, `${parameter}: ${boundary}`);
      assert.deepEqual(result.checks, { temperature: true, density: true, magicPower: true });
    }
    for (const outside of [minimum - 0.01, maximum + 0.01]) {
      const result = checkBrew({ ...center, [parameter]: outside }, recipe);
      assert.equal(result.success, false, `${parameter}: ${outside}`);
      assert.equal(result.checks[parameter], false);
      for (const other of ['temperature', 'density', 'magicPower'].filter(
        (key) => key !== parameter,
      )) {
        assert.equal(result.checks[other], true);
      }
    }
  }
});

test('success awards score, applies the actual time bonus, picks a new recipe, and preserves spent stock', () => {
  const game = freezeGame({
    ...gameWithMixture(['fairy-dust', 'caustic-acid']),
    timeRemaining: 130,
  });
  let calls = 0;
  const result = brewGame(game, () => {
    calls += 1;
    return 1 - Number.EPSILON;
  });

  assert.equal(result.accepted, true);
  assert.equal(calls, 1);
  assert.equal(result.state.score, SCORE_PER_BREW);
  assert.equal(result.state.lives, 3);
  assert.equal(result.state.timeRemaining, 140);
  assert.equal(result.state.recipe, MEDIUM_RECIPES[6]);
  assert.equal(result.state.status, 'playing');
  assert.equal(result.state.endReason, null);
  assert.equal(result.state.mixing.inventory, game.mixing.inventory);
  assert.deepEqual(result.state.mixing.mixture, []);
  assert.deepEqual(result.state.mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
  assert.deepEqual(result.feedback, {
    success: true,
    checks: { temperature: true, density: true, magicPower: true },
    recipe: game.recipe,
    totals: { temperature: 22, density: 23, magicPower: 34 },
    scoreDelta: 200,
    timeDelta: TIME_BONUS,
    livesDelta: 0,
  });
  assert.deepEqual(game.mixing.mixture, ['fairy-dust', 'caustic-acid']);
  assert.equal(game.score, 0);
});

test('success caps the bonus at 150 and reports only the time actually gained', () => {
  for (const [before, after, delta] of [
    [139, 149, 10],
    [140, 150, 10],
    [147, 150, 3],
    [150, 150, 0],
  ]) {
    const game = freezeGame({
      ...gameWithMixture(['fairy-dust', 'caustic-acid']),
      timeRemaining: before,
    });
    const result = brewGame(game, () => 0);
    assert.equal(result.accepted, true);
    assert.equal(result.state.timeRemaining, after);
    assert.equal(result.feedback.timeDelta, delta);
  }
});

test('failure loses exactly one life, keeps the recipe and score, and clears only the mixture', () => {
  const game = freezeGame({ ...gameWithMixture(['dragon-tears']), score: 400, timeRemaining: 120 });
  const result = brewGame(game, () => {
    assert.fail('A failed brew must not draw another recipe.');
  });

  assert.equal(result.accepted, true);
  assert.equal(result.feedback.success, false);
  assert.deepEqual(result.feedback.checks, {
    temperature: true,
    density: false,
    magicPower: false,
  });
  assert.equal(result.state.lives, 2);
  assert.equal(result.state.score, 400);
  assert.equal(result.state.timeRemaining, 120);
  assert.equal(result.state.recipe, game.recipe);
  assert.equal(result.state.mixing.inventory, game.mixing.inventory);
  assert.deepEqual(result.state.mixing.mixture, []);
  assert.deepEqual(result.state.mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
  assert.equal(result.feedback.recipe, game.recipe);
  assert.deepEqual(result.feedback.totals, { temperature: 25, density: 8, magicPower: 10 });
  assert.equal(result.feedback.scoreDelta, 0);
  assert.equal(result.feedback.timeDelta, 0);
  assert.equal(result.feedback.livesDelta, -1);
});

test('brew checks recalculate ingredients instead of trusting cached totals', () => {
  const correctMixture = gameWithMixture(['fairy-dust', 'caustic-acid']);
  const cachedFailure = freezeGame({
    ...correctMixture,
    mixing: {
      ...correctMixture.mixing,
      totals: { temperature: -999, density: -999, magicPower: -999 },
    },
  });
  const success = brewGame(cachedFailure, () => 0);
  assert.equal(success.accepted, true);
  assert.equal(success.feedback.success, true);
  assert.deepEqual(success.feedback.totals, { temperature: 22, density: 23, magicPower: 34 });

  const wrongMixture = gameWithMixture(Array(4).fill('essence-of-the-void'));
  const cachedSuccess = freezeGame({
    ...wrongMixture,
    mixing: { ...wrongMixture.mixing, totals: { temperature: 22, density: 23, magicPower: 34 } },
  });
  const failure = brewGame(cachedSuccess);
  assert.equal(failure.accepted, true);
  assert.equal(failure.feedback.success, false);
  assert.deepEqual(failure.feedback.totals, { temperature: -80, density: -40, magicPower: 160 });
});

test('raw negative and above-100 values are compared without clamping', () => {
  const recipe = {
    ...recipeById('acid-spark'),
    temperature: { min: -80, max: -80 },
    density: { min: -40, max: -40 },
    magicPower: { min: 152, max: 152 },
  };
  assert.equal(
    checkBrew({ temperature: -80, density: -40, magicPower: 160 }, recipe).success,
    true,
  );
  assert.equal(
    checkBrew({ temperature: -80, density: -40, magicPower: 161 }, recipe).success,
    false,
  );
});

test('repeated successful brews can repeat the recipe while stock stays spent and is never refilled', () => {
  let game = { ...createGame(() => 0), timeRemaining: 120 };
  assert.equal(game.recipe.id, 'acid-spark');

  for (let count = 1; count <= 2; count += 1) {
    game = freezeGame(addPortions(game, ['fairy-dust', 'caustic-acid']));
    const stockBeforeBrew = game.mixing.inventory;
    const result = brewGame(game, () => 0);
    assert.equal(result.accepted, true);
    assert.equal(result.feedback.success, true);
    assert.equal(result.state.recipe, game.recipe);
    assert.equal(result.state.mixing.inventory, stockBeforeBrew);
    assert.equal(result.state.mixing.inventory['fairy-dust'], 2 - count);
    assert.equal(result.state.mixing.inventory['caustic-acid'], 2 - count);
    assert.equal(result.state.score, count * 200);
    assert.equal(result.state.timeRemaining, 120 + count * 10);
    assert.equal(result.state.lives, 3);
    game = result.state;
  }
  assert.equal(game.mixing.inventory['dragon-tears'], 2);
  assert.equal(game.status, 'playing');
});

test('empty and ended games reject brewing without changing state, charging lives, or drawing randomness', () => {
  const initial = createGame(() => 0);
  const noStock = Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0]));
  const cases = [
    [initial, 'empty-cauldron'],
    [{ ...initial, status: 'game-over', endReason: 'out-of-lives' }, 'game-over'],
    [{ ...gameWithMixture(['dragon-tears']), lives: 0 }, 'game-over'],
    [{ ...gameWithMixture(['dragon-tears']), timeRemaining: 0 }, 'game-over'],
    [{ ...initial, mixing: { ...initial.mixing, inventory: noStock } }, 'game-over'],
  ];

  for (const [input, reason] of cases) {
    const game = freezeGame(input);
    const result = brewGame(game, () => {
      assert.fail('Rejected brewing must not draw a recipe.');
    });
    assert.deepEqual(result, { accepted: false, reason, state: game });
    assert.equal(result.state, game);
  }
});

test('losing the last life ends the game and the terminal state cannot be brewed again', () => {
  const game = freezeGame({ ...gameWithMixture(['dragon-tears']), lives: 1 });
  const result = brewGame(game);
  assert.equal(result.accepted, true);
  assert.equal(result.state.lives, 0);
  assert.equal(result.state.status, 'game-over');
  assert.equal(result.state.endReason, 'out-of-lives');
  assert.equal(result.state.mixing.inventory, game.mixing.inventory);
  assert.deepEqual(result.state.mixing.mixture, []);
  const again = brewGame(freezeGame(result.state));
  assert.deepEqual(again, { accepted: false, reason: 'game-over', state: result.state });
  assert.equal(again.state, result.state);
});

test('the final stocked mixture may be brewed, then an empty shelf and cauldron end the game', () => {
  for (const ids of [['fairy-dust', 'caustic-acid'], ['dragon-tears']]) {
    const mixed = gameWithMixture(ids);
    const game = freezeGame({
      ...mixed,
      mixing: {
        ...mixed.mixing,
        inventory: Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0])),
      },
    });
    const result = brewGame(game, () => 0);
    assert.equal(result.accepted, true);
    assert.equal(result.state.status, 'game-over');
    assert.equal(result.state.endReason, 'out-of-ingredients');
    assert.equal(result.state.mixing.inventory, game.mixing.inventory);
    assert.deepEqual(result.state.mixing.mixture, []);
    assert.deepEqual(result.state.mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
  }
});
