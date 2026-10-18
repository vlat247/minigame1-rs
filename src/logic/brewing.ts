import { LEVEL_ONE_INGREDIENTS } from '../data/ingredients.ts';
import { MEDIUM_RECIPES } from '../data/recipes.ts';
import type { Recipe, RecipeRange } from '../data/recipes.ts';
import type { GameEndReason, GameState } from '../state/game.ts';
import { calculateTotals } from './ingredients.ts';
import type { MixingState, MixtureTotals } from './ingredients.ts';

export const BREW_TOLERANCE = 8;
export const SCORE_PER_BREW = 200;
export const TIME_BONUS = 10;
export const MAX_TIME = 150;

export interface BrewChecks {
  readonly temperature: boolean;
  readonly density: boolean;
  readonly magicPower: boolean;
}

export interface BrewCheck {
  readonly success: boolean;
  readonly checks: BrewChecks;
}

export interface BrewFeedback extends BrewCheck {
  readonly recipe: Recipe;
  readonly totals: MixtureTotals;
  readonly scoreDelta: number;
  readonly timeDelta: number;
  readonly livesDelta: number;
}

export type BrewResult =
  | { readonly accepted: true; readonly state: GameState; readonly feedback: BrewFeedback }
  | {
      readonly accepted: false;
      readonly reason: 'empty-cauldron' | 'game-over';
      readonly state: GameState;
    };

export function selectMediumRecipe(random: () => number = Math.random): Recipe {
  const sample = random();

  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('The random source must return a number from 0 inclusive to 1 exclusive.');
  }

  const recipe = MEDIUM_RECIPES[Math.floor(sample * MEDIUM_RECIPES.length)];

  if (recipe === undefined) {
    throw new Error('The Medium recipe pool must contain at least one recipe.');
  }

  return recipe;
}

function isInRange(value: number, range: RecipeRange): boolean {
  return value >= range.min - BREW_TOLERANCE && value <= range.max + BREW_TOLERANCE;
}

export function checkBrew(totals: MixtureTotals, recipe: Recipe): BrewCheck {
  const checks: BrewChecks = {
    temperature: isInRange(totals.temperature, recipe.temperature),
    density: isInRange(totals.density, recipe.density),
    magicPower: isInRange(totals.magicPower, recipe.magicPower),
  };

  return {
    success: checks.temperature && checks.density && checks.magicPower,
    checks,
  };
}

function hasNoStock(mixing: MixingState): boolean {
  return LEVEL_ONE_INGREDIENTS.every((ingredient) => mixing.inventory[ingredient.id] <= 0);
}

export function brewGame(state: GameState, random: () => number = Math.random): BrewResult {
  if (
    state.status === 'game-over' ||
    state.lives <= 0 ||
    state.timeRemaining <= 0 ||
    (state.mixing.mixture.length === 0 && hasNoStock(state.mixing))
  ) {
    return { accepted: false, reason: 'game-over', state };
  }

  if (state.mixing.mixture.length === 0) {
    return { accepted: false, reason: 'empty-cauldron', state };
  }

  const totals = calculateTotals(state.mixing.mixture);
  const check = checkBrew(totals, state.recipe);
  const lives = state.lives - (check.success ? 0 : 1);
  const score = state.score + (check.success ? SCORE_PER_BREW : 0);
  const timeRemaining = check.success
    ? Math.min(MAX_TIME, state.timeRemaining + TIME_BONUS)
    : state.timeRemaining;
  const mixing: MixingState = {
    inventory: state.mixing.inventory,
    mixture: [],
    totals: calculateTotals([]),
  };
  const endReason: GameEndReason =
    lives === 0 ? 'out-of-lives' : hasNoStock(mixing) ? 'out-of-ingredients' : null;

  return {
    accepted: true,
    state: {
      mixing,
      recipe: check.success ? selectMediumRecipe(random) : state.recipe,
      score,
      lives,
      timeRemaining,
      status: endReason === null ? 'playing' : 'game-over',
      endReason,
    },
    feedback: {
      ...check,
      recipe: state.recipe,
      totals,
      scoreDelta: score - state.score,
      timeDelta: timeRemaining - state.timeRemaining,
      livesDelta: lives - state.lives,
    },
  };
}
