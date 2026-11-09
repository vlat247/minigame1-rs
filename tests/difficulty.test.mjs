import assert from 'node:assert/strict';
import test from 'node:test';
import { DIFFICULTIES, DIFFICULTY_SETTINGS, isDifficulty } from '../src/data/difficulty.ts';
import { INGREDIENTS, INGREDIENT_IDS, getShelfIngredients } from '../src/data/ingredients.ts';
import { RECIPES, getRecipesByDifficulty } from '../src/data/recipes.ts';
import { brewGame, checkBrew, selectRecipe } from '../src/logic/brewing.ts';
import { addIngredient, createMixingState } from '../src/logic/ingredients.ts';
import { createGame } from '../src/state/game.ts';

const expectedSettings = {
  easy: {
    label: 'Easy',
    ingredientCount: 4,
    maxIngredients: 4,
    startingTime: 180,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonus: 15,
    reactionCount: 0,
  },
  medium: {
    label: 'Medium',
    ingredientCount: 6,
    maxIngredients: 4,
    startingTime: 150,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonus: 10,
    reactionCount: 2,
  },
  hard: {
    label: 'Hard',
    ingredientCount: 8,
    maxIngredients: 5,
    startingTime: 150,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonus: 5,
    reactionCount: 3,
  },
};

const winningPortions = {
  easy: ['dragon-tears', 'fairy-dust'],
  medium: ['dragon-tears', 'caustic-acid'],
  hard: ['phoenix-feather', 'fairy-dust'],
};

function addPortions(game, portions) {
  let mixing = game.mixing;
  for (const id of portions) {
    const result = addIngredient(mixing, id, game.difficulty);
    assert.equal(result.accepted, true);
    mixing = result.state;
  }
  return { ...game, mixing };
}

function freezeGame(game) {
  Object.freeze(game.mixing.inventory);
  Object.freeze(game.mixing.mixture);
  Object.freeze(game.mixing.totals);
  Object.freeze(game.mixing);
  return Object.freeze(game);
}

test('difficulty settings match every official table value and reject inherited keys', () => {
  assert.deepEqual(DIFFICULTIES, ['easy', 'medium', 'hard']);
  assert.deepEqual(DIFFICULTY_SETTINGS, expectedSettings);
  for (const difficulty of DIFFICULTIES) assert.equal(isDifficulty(difficulty), true);
  for (const value of ['', 'Easy', 'expert', '__proto__', 'constructor']) {
    assert.equal(isDifficulty(value), false);
  }
});

for (const difficulty of DIFFICULTIES) {
  const settings = expectedSettings[difficulty];

  test(`${difficulty}: shelf uses the ordered prefix and samples stock once per available ingredient`, () => {
    let calls = 0;
    const mixing = createMixingState(() => {
      const sample = calls % 2 === 0 ? 0 : 1 - Number.EPSILON;
      calls += 1;
      return sample;
    }, difficulty);
    const shelf = getShelfIngredients(difficulty);
    assert.deepEqual(shelf, INGREDIENTS.slice(0, settings.ingredientCount));
    assert.equal(calls, settings.ingredientCount);
    for (const [index, id] of INGREDIENT_IDS.entries()) {
      assert.equal(
        mixing.inventory[id],
        index >= settings.ingredientCount ? 0 : index % 2 === 0 ? 2 : 15,
      );
    }
    assert.deepEqual(mixing.mixture, []);
    assert.deepEqual(mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
  });

  test(`${difficulty}: additions spend stock, preserve order and stop at the configured capacity`, () => {
    let mixing = createMixingState(() => 0.9, difficulty);
    const additions = Array.from({ length: settings.maxIngredients }, (_, index) =>
      index % 2 === 0 ? 'dragon-tears' : 'fairy-dust',
    );
    for (const id of additions) {
      const result = addIngredient(mixing, id, difficulty);
      assert.equal(result.accepted, true);
      assert.equal(result.state.inventory[id], mixing.inventory[id] - 1);
      mixing = result.state;
    }
    assert.deepEqual(mixing.mixture, additions);
    const extra = addIngredient(mixing, 'frost-lotus', difficulty);
    assert.deepEqual(extra, { accepted: false, reason: 'cauldron-full', state: mixing });
    for (const ingredient of INGREDIENTS.slice(settings.ingredientCount)) {
      const forged = {
        ...createMixingState(() => 0, difficulty),
        inventory: { ...mixing.inventory, [ingredient.id]: 15 },
      };
      assert.deepEqual(addIngredient(forged, ingredient.id, difficulty), {
        accepted: false,
        reason: 'unavailable-ingredient',
        state: forged,
      });
    }
  });

  test(`${difficulty}: a new game samples its shelf and recipe with the chosen starting rules`, () => {
    let calls = 0;
    const game = createGame(() => {
      calls += 1;
      return calls === settings.ingredientCount + 1 ? 1 - Number.EPSILON : 0;
    }, difficulty);
    const recipes = getRecipesByDifficulty(difficulty);
    assert.equal(calls, settings.ingredientCount + 1);
    assert.equal(game.difficulty, difficulty);
    assert.equal(game.recipe, recipes.at(-1));
    assert.equal(game.lives, settings.lives);
    assert.equal(game.timeRemaining, settings.startingTime);
    assert.equal(game.elapsedTime, 0);
    assert.equal(game.score, 0);
    assert.equal(game.status, 'playing');
    assert.equal(game.endReason, null);
  });

  test(`${difficulty}: recipe selection reaches every matching row and permits repeats`, () => {
    const recipes = getRecipesByDifficulty(difficulty);
    assert.deepEqual(
      recipes,
      RECIPES.filter((recipe) => recipe.difficulty === difficulty),
    );
    assert.equal(recipes.length, difficulty === 'easy' ? 6 : 7);
    assert.equal(
      selectRecipe(difficulty, () => 0),
      recipes[0],
    );
    assert.equal(
      selectRecipe(difficulty, () => 1 - Number.EPSILON),
      recipes.at(-1),
    );
    for (const [index, recipe] of recipes.entries()) {
      assert.equal(
        selectRecipe(difficulty, () => (index + 0.5) / recipes.length),
        recipe,
      );
    }
    assert.equal(
      selectRecipe(difficulty, () => 0),
      selectRecipe(difficulty, () => 0),
    );
    for (const sample of [-1, 1, NaN, Infinity]) {
      assert.throws(() => selectRecipe(difficulty, () => sample), RangeError);
    }
  });

  test(`${difficulty}: all three recipe parameters use its inclusive tolerance`, () => {
    const recipe = getRecipesByDifficulty(difficulty)[0];
    const center = Object.fromEntries(
      ['temperature', 'density', 'magicPower'].map((key) => [
        key,
        (recipe[key].min + recipe[key].max) / 2,
      ]),
    );
    for (const parameter of ['temperature', 'density', 'magicPower']) {
      for (const [boundary, outside] of [
        [recipe[parameter].min - settings.tolerance, -0.01],
        [recipe[parameter].max + settings.tolerance, 0.01],
      ]) {
        assert.equal(checkBrew({ ...center, [parameter]: boundary }, recipe).success, true);
        const failed = checkBrew({ ...center, [parameter]: boundary + outside }, recipe);
        assert.equal(failed.success, false);
        assert.equal(failed.checks[parameter], false);
      }
    }
  });

  test(`${difficulty}: success awards its score and time, clears spent portions and stays in its recipe pool`, () => {
    const mixed = addPortions(
      createGame(() => 0, difficulty),
      winningPortions[difficulty],
    );
    const game = freezeGame({ ...mixed, score: 600, timeRemaining: 100 });
    const result = brewGame(game, () => 1 - Number.EPSILON);
    assert.equal(result.accepted, true);
    assert.equal(result.feedback.success, true);
    assert.equal(result.state.difficulty, difficulty);
    assert.equal(result.state.score, 600 + settings.scorePerBrew);
    assert.equal(result.state.timeRemaining, 100 + settings.timeBonus);
    assert.equal(result.state.lives, settings.lives);
    assert.equal(result.feedback.scoreDelta, settings.scorePerBrew);
    assert.equal(result.feedback.timeDelta, settings.timeBonus);
    assert.equal(result.state.recipe, getRecipesByDifficulty(difficulty).at(-1));
    assert.equal(result.state.mixing.inventory, game.mixing.inventory);
    assert.deepEqual(result.state.mixing.mixture, []);
    assert.deepEqual(result.state.mixing.totals, { temperature: 0, density: 0, magicPower: 0 });
    assert.equal(result.state.status, 'playing');
  });

  test(`${difficulty}: successful time bonuses stop at its own starting time`, () => {
    for (const [remaining, gain] of [
      [settings.startingTime - 2, 2],
      [settings.startingTime, 0],
    ]) {
      const game = addPortions(
        { ...createGame(() => 0, difficulty), timeRemaining: remaining },
        winningPortions[difficulty],
      );
      const result = brewGame(game, () => 0);
      assert.equal(result.accepted, true);
      assert.equal(result.feedback.success, true);
      assert.equal(result.state.timeRemaining, settings.startingTime);
      assert.equal(result.feedback.timeDelta, gain);
    }
  });

  test(`${difficulty}: failure keeps the recipe, spends the mixture and the last life ends the run`, () => {
    const mixed = addPortions(
      createGame(() => 0, difficulty),
      ['frost-lotus'],
    );
    for (const lives of [settings.lives, 1]) {
      const game = freezeGame({ ...mixed, lives, score: 600, timeRemaining: 90 });
      const result = brewGame(game, () => assert.fail('Failure cannot draw a recipe.'));
      assert.equal(result.accepted, true);
      assert.equal(result.feedback.success, false);
      assert.equal(result.state.lives, lives - 1);
      assert.equal(result.state.score, 600);
      assert.equal(result.state.timeRemaining, 90);
      assert.equal(result.state.recipe, game.recipe);
      assert.equal(result.state.mixing.inventory, game.mixing.inventory);
      assert.deepEqual(result.state.mixing.mixture, []);
      assert.equal(result.state.status, lives === 1 ? 'game-over' : 'playing');
      assert.equal(result.state.endReason, lives === 1 ? 'out-of-lives' : null);
    }
  });

  test(`${difficulty}: the last stocked mixture remains brewable before its shelf is exhausted`, () => {
    const mixed = addPortions(
      createGame(() => 0, difficulty),
      winningPortions[difficulty],
    );
    const game = freezeGame({
      ...mixed,
      mixing: {
        ...mixed.mixing,
        inventory: Object.fromEntries(
          INGREDIENT_IDS.map((id, index) => [id, index < settings.ingredientCount ? 0 : 15]),
        ),
      },
    });
    const result = brewGame(game, () => 0);
    assert.equal(result.accepted, true);
    assert.equal(result.feedback.success, true);
    assert.equal(result.state.status, 'game-over');
    assert.equal(result.state.endReason, 'out-of-ingredients');
    assert.deepEqual(result.state.mixing.mixture, []);
    assert.deepEqual(brewGame(result.state), {
      accepted: false,
      reason: 'game-over',
      state: result.state,
    });
  });
}

test('Hard stock includes Phoenix Feather and Toad Slime when deciding whether the run can continue', () => {
  const mixed = addPortions(
    createGame(() => 0, 'hard'),
    winningPortions.hard,
  );
  const game = {
    ...mixed,
    mixing: {
      ...mixed.mixing,
      inventory: Object.fromEntries(INGREDIENT_IDS.map((id) => [id, id === 'toad-slime' ? 1 : 0])),
    },
  };
  const result = brewGame(game, () => 0);
  assert.equal(result.accepted, true);
  assert.equal(result.state.status, 'playing');
  assert.equal(result.state.endReason, null);
});

test('low-level additions retain raw sums for both additional Hard ingredients', () => {
  const portions = [
    'phoenix-feather',
    'toad-slime',
    'essence-of-the-void',
    'phoenix-feather',
    'toad-slime',
  ];
  const game = addPortions(
    createGame(() => 0.9, 'hard'),
    portions,
  );
  assert.deepEqual(game.mixing.mixture, portions);
  assert.deepEqual(game.mixing.totals, { temperature: 90, density: 30, magicPower: 100 });
  assert.equal(game.mixing.inventory['phoenix-feather'], 12);
  assert.equal(game.mixing.inventory['toad-slime'], 12);
});

test('brew validation can explicitly use the run difficulty instead of the recipe default', () => {
  const recipe = getRecipesByDifficulty('easy')[0];
  const totals = { temperature: 22, density: 17, magicPower: 22 };
  assert.equal(checkBrew(totals, recipe).success, true);
  assert.equal(checkBrew(totals, recipe, 'hard').success, false);
});
