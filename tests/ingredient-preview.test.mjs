import assert from 'node:assert/strict';
import test from 'node:test';
import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../src/data/difficulty.ts';
import { getShelfIngredients, INGREDIENTS } from '../src/data/ingredients.ts';
import { addGameIngredient } from '../src/logic/gameplay.ts';
import { parameterScaleLimit, projectIngredient } from '../src/logic/ingredient-preview.ts';
import { createGame } from '../src/state/game.ts';

function add(game, id) {
  const result = addGameIngredient(game, id);
  assert.equal(result.accepted, true);
  return result.state;
}

function freezeGame(game) {
  Object.freeze(game.mixing.inventory);
  Object.freeze(game.mixing.mixture);
  Object.freeze(game.mixing.totals);
  Object.freeze(game.mixing);
  return Object.freeze(game);
}

test('every shelf ingredient previews the game addition without consuming any game state', () => {
  for (const difficulty of DIFFICULTIES) {
    const game = freezeGame(createGame(() => 0.5, difficulty));
    const original = structuredClone(game);
    for (const ingredient of getShelfIngredients(difficulty)) {
      const preview = projectIngredient(game, ingredient.id);
      const addition = addGameIngredient(game, ingredient.id);
      assert.equal(addition.accepted, true);
      assert.equal(preview.ingredient, ingredient);
      assert.equal(preview.current, game.mixing.totals);
      assert.deepEqual(preview.projected, addition.state.mixing.totals);
      assert.deepEqual(preview.delta, {
        temperature: ingredient.temperature,
        density: ingredient.density,
        magicPower: ingredient.magicPower,
      });
      assert.deepEqual(game, original);
    }
  }
  assert.equal(getShelfIngredients('hard').length, INGREDIENTS.length);
});

test('a duplicate preview includes the existing ordered mixture and remains unapplied', () => {
  let game = createGame(() => 0.9, 'hard');
  game = add(game, 'essence-of-the-void');
  game = add(game, 'dragon-tears');
  game = freezeGame(add(game, 'essence-of-the-void'));
  const preview = projectIngredient(game, 'essence-of-the-void');
  assert.deepEqual(preview.current, { temperature: -15, density: -12, magicPower: 90 });
  assert.deepEqual(preview.projected, { temperature: -35, density: -22, magicPower: 130 });
  assert.deepEqual(preview.delta, { temperature: -20, density: -10, magicPower: 40 });
  assert.deepEqual(game.mixing.mixture, [
    'essence-of-the-void',
    'dragon-tears',
    'essence-of-the-void',
  ]);
  assert.equal(game.mixing.inventory['essence-of-the-void'], 12);
});

test('projections retain negative values, totals above one hundred and zero deltas', () => {
  let game = createGame(() => 0.9, 'hard');
  for (let count = 0; count < 4; count += 1) game = add(game, 'phoenix-feather');
  const feather = projectIngredient(freezeGame(game), 'phoenix-feather');
  assert.deepEqual(feather.projected, { temperature: 250, density: -50, magicPower: 150 });
  const slime = projectIngredient(game, 'toad-slime');
  assert.deepEqual(slime.projected, { temperature: 205, density: -10, magicPower: 120 });
  assert.equal(slime.delta.magicPower, 0);
});

test('full cauldrons and exhausted stock do not offer an impossible next addition', () => {
  for (const difficulty of DIFFICULTIES) {
    let game = createGame(() => 0.9, difficulty);
    for (let count = 0; count < DIFFICULTY_SETTINGS[difficulty].maxIngredients; count += 1) {
      game = add(game, 'fairy-dust');
    }
    assert.equal(projectIngredient(freezeGame(game), 'dragon-tears'), null);
  }
  let game = createGame(() => 0);
  game = add(game, 'dragon-tears');
  game = freezeGame(add(game, 'dragon-tears'));
  assert.equal(projectIngredient(game, 'dragon-tears'), null);
  assert.notEqual(projectIngredient(game, 'fairy-dust'), null);
});

test('missing, paused and ended games and unavailable ingredient IDs cannot be previewed', () => {
  const game = freezeGame(createGame(() => 0.5));
  assert.equal(projectIngredient(null, 'dragon-tears'), null);
  assert.equal(projectIngredient(game, 'dragon-tears', true), null);
  assert.equal(projectIngredient({ ...game, status: 'game-over' }, 'dragon-tears'), null);
  for (const id of ['unknown', '', '__proto__', 'constructor', 'phoenix-feather', 'toad-slime']) {
    assert.equal(projectIngredient(game, id), null);
  }
  assert.equal(
    projectIngredient(
      {
        ...game,
        mixing: { ...game.mixing, inventory: { ...game.mixing.inventory, 'toad-slime': 10 } },
      },
      'toad-slime',
    ),
    null,
  );
});

test('the gauge scale includes actual, target and projected totals without clamping them', () => {
  assert.equal(parameterScaleLimit(0, undefined), 100);
  assert.equal(parameterScaleLimit(-35, { min: 17, max: 27 }, -55), 100);
  assert.equal(parameterScaleLimit(200, { min: 57, max: 67 }, 250), 300);
  assert.equal(parameterScaleLimit(-205, { min: -240, max: -220 }, -255), 300);
  assert.equal(parameterScaleLimit(50, { min: 110, max: 125 }, 75), 200);
  assert.equal(parameterScaleLimit(160, { min: 10, max: 20 }), 200);
  assert.equal(parameterScaleLimit(100, { min: 0, max: 100 }, 100), 100);
});
