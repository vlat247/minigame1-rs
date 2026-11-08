import { RECIPES } from '../data/recipes.ts';

export interface CollectionProgress {
  readonly discoveredRecipeIds: readonly string[];
}

export type AchievementId = 'first-potion' | 'recipe-explorer' | 'hard-alchemist';

export interface Achievement {
  readonly id: AchievementId;
  readonly name: string;
  readonly description: string;
  readonly unlocked: boolean;
}

export function createCollection(): CollectionProgress {
  return {
    discoveredRecipeIds: [],
  };
}

export function discoverRecipe(progress: CollectionProgress, recipeId: string): CollectionProgress {
  const recipeExists = RECIPES.some((recipe) => recipe.id === recipeId);

  const alreadyDiscovered = progress.discoveredRecipeIds.includes(recipeId);

  if (!recipeExists || alreadyDiscovered) {
    return progress;
  }

  return {
    ...progress,
    discoveredRecipeIds: [...progress.discoveredRecipeIds, recipeId],
  };
}

export function getAchievements(progress: CollectionProgress): readonly Achievement[] {
  const discoveredRecipes = RECIPES.filter((recipe) =>
    progress.discoveredRecipeIds.includes(recipe.id),
  );

  return [
    {
      id: 'first-potion',
      name: 'First Potion',
      description: 'Successfully brew your first potion.',
      unlocked: discoveredRecipes.length >= 1,
    },
    {
      id: 'recipe-explorer',
      name: 'Recipe Explorer',
      description: 'Discover five different recipes.',
      unlocked: discoveredRecipes.length >= 5,
    },
    {
      id: 'hard-alchemist',
      name: 'Hard Alchemist',
      description: 'Successfully brew a potion on Hard difficulty.',
      unlocked: discoveredRecipes.some((recipe) => recipe.difficulty === 'hard'),
    },
  ];
}
