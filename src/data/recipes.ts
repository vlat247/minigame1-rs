import type { Difficulty } from './difficulty.ts';

export type RecipeDifficulty = Difficulty;

export interface RecipeRange {
  readonly min: number;
  readonly max: number;
}

export interface Recipe {
  readonly id: string;
  readonly name: string;
  readonly difficulty: RecipeDifficulty;
  readonly temperature: RecipeRange;
  readonly density: RecipeRange;
  readonly magicPower: RecipeRange;
}

type RecipeRow = readonly [
  id: string,
  name: string,
  difficulty: RecipeDifficulty,
  temperature: readonly [number, number],
  density: readonly [number, number],
  magicPower: readonly [number, number],
];

const recipeRows: readonly RecipeRow[] = [
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
];

export const RECIPES: readonly Recipe[] = recipeRows.map(
  ([id, name, difficulty, temperature, density, magicPower]) => ({
    id,
    name,
    difficulty,
    temperature: { min: temperature[0], max: temperature[1] },
    density: { min: density[0], max: density[1] },
    magicPower: { min: magicPower[0], max: magicPower[1] },
  }),
);

export function getRecipesByDifficulty(difficulty: Difficulty): readonly Recipe[] {
  return RECIPES.filter((recipe) => recipe.difficulty === difficulty);
}

export const MEDIUM_RECIPES: readonly Recipe[] = getRecipesByDifficulty('medium');
