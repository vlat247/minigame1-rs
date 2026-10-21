import { getIngredient } from '../data/ingredients.ts';
import type { Ingredient } from '../data/ingredients.ts';
import type { RecipeRange } from '../data/recipes.ts';
import type { GameState } from '../state/game.ts';
import { addIngredient } from './ingredients.ts';
import type { MixtureTotals } from './ingredients.ts';

export interface IngredientProjection {
  readonly ingredient: Ingredient;
  readonly current: MixtureTotals;
  readonly projected: MixtureTotals;
  readonly delta: MixtureTotals;
}

/** Inspect the ordinary addition result without applying it to the game or spending stock. */
export function projectIngredient(
  game: GameState | null,
  id: string,
  paused = false,
): IngredientProjection | null {
  if (game === null || game.status !== 'playing' || paused) return null;
  const ingredient = getIngredient(id);
  if (ingredient === undefined) return null;
  const addition = addIngredient(game.mixing, id, game.difficulty);
  if (!addition.accepted) return null;

  return {
    ingredient,
    current: game.mixing.totals,
    projected: addition.state.totals,
    delta: {
      temperature: ingredient.temperature,
      density: ingredient.density,
      magicPower: ingredient.magicPower,
    },
  };
}

/** Keep current, target and projected values on the same expanding, symmetric scale. */
export function parameterScaleLimit(
  current: number,
  range: RecipeRange | undefined,
  projected = current,
): number {
  return Math.max(
    100,
    Math.ceil(
      Math.max(
        Math.abs(current),
        Math.abs(range?.min ?? 0),
        Math.abs(range?.max ?? 0),
        Math.abs(projected),
      ) / 100,
    ) * 100,
  );
}
