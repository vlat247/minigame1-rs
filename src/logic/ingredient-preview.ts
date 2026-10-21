import { getIngredient } from '../data/ingredients.ts';
import type { Ingredient } from '../data/ingredients.ts';
import type { RecipeRange } from '../data/recipes.ts';
import type { GameState } from '../state/game.ts';
import type { Reaction } from '../data/reactions.ts';
import { addGameIngredient } from './gameplay.ts';
import type { MixtureTotals } from './ingredients.ts';

export interface IngredientProjection {
  readonly ingredient: Ingredient;
  readonly current: MixtureTotals;
  readonly projected: MixtureTotals;
  readonly delta: MixtureTotals;
  readonly reactions: readonly Reaction[];
  readonly timeDelta: number;
  readonly livesDelta: number;
  readonly cleared: boolean;
}

/** Simulate the complete addition, including reactions, without applying any game changes. */
export function projectIngredient(
  game: GameState | null,
  id: string,
  paused = false,
): IngredientProjection | null {
  if (game === null || game.status !== 'playing' || paused) return null;
  const ingredient = getIngredient(id);
  if (ingredient === undefined) return null;
  const addition = addGameIngredient(game, id);
  if (!addition.accepted) return null;

  return {
    ingredient,
    current: game.mixing.totals,
    projected: addition.state.mixing.totals,
    delta: {
      temperature: addition.state.mixing.totals.temperature - game.mixing.totals.temperature,
      density: addition.state.mixing.totals.density - game.mixing.totals.density,
      magicPower: addition.state.mixing.totals.magicPower - game.mixing.totals.magicPower,
    },
    ...addition.feedback,
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
