import type { Difficulty } from '../data/difficulty.ts';
import { INGREDIENT_CATALOGUE } from '../data/ingredients.ts';
import type { IngredientId } from '../data/ingredients.ts';
import { getReactions } from '../data/reactions.ts';
import type { Reaction } from '../data/reactions.ts';
import { calculateTotals } from './ingredients.ts';
import type { MixtureTotals } from './ingredients.ts';

export interface ReactionEvaluation {
  readonly totals: MixtureTotals;
  readonly activeReactions: readonly Reaction[];
}

/** Predicates inspect raw totals; active modifiers apply once, in catalogue order. */
export function evaluateReactions(
  mixture: readonly IngredientId[],
  difficulty: Difficulty,
): ReactionEvaluation {
  const ingredients = mixture.map((id) => INGREDIENT_CATALOGUE[id]);
  const rawTotals = calculateTotals(mixture);
  const activeReactions = getReactions(difficulty).filter((reaction) =>
    reaction.isActive(ingredients, rawTotals),
  );

  return {
    totals: activeReactions.reduce((totals, reaction) => reaction.apply(totals), rawTotals),
    activeReactions,
  };
}

export function calculateCauldronTotals(
  mixture: readonly IngredientId[],
  difficulty: Difficulty,
): MixtureTotals {
  return evaluateReactions(mixture, difficulty).totals;
}

/** Time/life effects are charged only for reactions newly active after an addition. */
export function getNewlyActiveReactions(
  before: readonly IngredientId[],
  after: readonly IngredientId[],
  difficulty: Difficulty,
): readonly Reaction[] {
  const activeBefore = new Set(
    evaluateReactions(before, difficulty).activeReactions.map((reaction) => reaction.id),
  );
  return evaluateReactions(after, difficulty).activeReactions.filter(
    (reaction) => !activeBefore.has(reaction.id),
  );
}
