import assert from 'node:assert/strict';
import test from 'node:test';
import { createCollection, discoverRecipe, getAchievements } from '../src/logic/collections.ts';

test('discovering a recipe creates new progress without changing the original collection', () => {
  const original = createCollection();
  Object.freeze(original.discoveredRecipeIds);
  Object.freeze(original);

  const updated = discoverRecipe(original, 'moon-mist');

  assert.deepEqual(updated.discoveredRecipeIds, ['moon-mist']);
  assert.deepEqual(original.discoveredRecipeIds, []);
  assert.notStrictEqual(updated, original);
});

test('brewing the same recipe again does not add another discovery', () => {
  const progress = discoverRecipe(createCollection(), 'moon-mist');

  const repeated = discoverRecipe(progress, 'moon-mist');

  assert.deepEqual(repeated.discoveredRecipeIds, ['moon-mist']);
  assert.strictEqual(repeated, progress);
});

test('unknown recipe IDs leave existing discoveries unchanged', () => {
  const progress = discoverRecipe(createCollection(), 'moon-mist');

  for (const recipeId of ['', 'unknown', '__proto__', 'constructor']) {
    assert.strictEqual(discoverRecipe(progress, recipeId), progress);
  }
  assert.deepEqual(progress.discoveredRecipeIds, ['moon-mist']);
});

test('different recipes accumulate across difficulties and preserve discovery order', () => {
  const easy = discoverRecipe(createCollection(), 'moon-mist');
  const medium = discoverRecipe(easy, 'void-ember');
  const hard = discoverRecipe(medium, 'phoenix-pulse');

  assert.deepEqual(hard.discoveredRecipeIds, ['moon-mist', 'void-ember', 'phoenix-pulse']);
  assert.deepEqual(easy.discoveredRecipeIds, ['moon-mist']);
  assert.deepEqual(medium.discoveredRecipeIds, ['moon-mist', 'void-ember']);
});

test('an empty collection has exactly three named achievements and all are locked', () => {
  const achievements = getAchievements(createCollection());

  assert.deepEqual(
    achievements.map(({ id, name, unlocked }) => ({ id, name, unlocked })),
    [
      { id: 'first-potion', name: 'First Potion', unlocked: false },
      { id: 'recipe-explorer', name: 'Recipe Explorer', unlocked: false },
      { id: 'hard-alchemist', name: 'Hard Alchemist', unlocked: false },
    ],
  );
  for (const achievement of achievements) {
    assert.equal(typeof achievement.description, 'string');
    assert.ok(achievement.description.trim().length > 0);
  }
});

test('the first Easy recipe unlocks only First Potion', () => {
  const progress = discoverRecipe(createCollection(), 'moon-mist');

  assert.deepEqual(
    getAchievements(progress).map(({ unlocked }) => unlocked),
    [true, false, false],
  );
});

test('Recipe Explorer unlocks at five distinct recipes but stays locked at four', () => {
  const four = {
    discoveredRecipeIds: ['moon-mist', 'root-bloom', 'frost-steam', 'quiet-swirl'],
  };
  const five = discoverRecipe(four, 'bright-dew');

  assert.deepEqual(
    getAchievements(four).map(({ unlocked }) => unlocked),
    [true, false, false],
  );
  assert.deepEqual(
    getAchievements(five).map(({ unlocked }) => unlocked),
    [true, true, false],
  );
});

test('a first Hard recipe unlocks First Potion and Hard Alchemist together', () => {
  const progress = discoverRecipe(createCollection(), 'phoenix-pulse');

  assert.deepEqual(
    getAchievements(progress).map(({ unlocked }) => unlocked),
    [true, false, true],
  );
});

test('achievement rules ignore duplicate and unknown IDs without changing frozen progress', () => {
  const unknownOnly = Object.freeze({
    discoveredRecipeIds: Object.freeze(['', 'unknown', '__proto__', 'constructor', 'hard']),
  });
  const duplicates = Object.freeze({
    discoveredRecipeIds: Object.freeze([
      'moon-mist',
      'moon-mist',
      'root-bloom',
      'frost-steam',
      'quiet-swirl',
      'hard',
      'unknown',
    ]),
  });
  const originalUnknown = structuredClone(unknownOnly);
  const originalDuplicates = structuredClone(duplicates);

  assert.deepEqual(
    getAchievements(unknownOnly).map(({ unlocked }) => unlocked),
    [false, false, false],
  );
  assert.deepEqual(
    getAchievements(duplicates).map(({ unlocked }) => unlocked),
    [true, false, false],
  );
  assert.deepEqual(unknownOnly, originalUnknown);
  assert.deepEqual(duplicates, originalDuplicates);
});
