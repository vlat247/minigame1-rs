import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import type { Difficulty } from '../data/difficulty.ts';
import { getRecipesByDifficulty } from '../data/recipes.ts';
import type { Recipe, RecipeRange } from '../data/recipes.ts';
import type { GameEndReason, GameState } from '../state/game.ts';
import { clearCauldron, hasNoStock } from './ingredients.ts';
import type { MixtureTotals } from './ingredients.ts';
import { calculateCauldronTotals } from './reactions.ts';

export const BREW_TOLERANCE = DIFFICULTY_SETTINGS.medium.tolerance;
export const SCORE_PER_BREW = DIFFICULTY_SETTINGS.medium.scorePerBrew;
export const TIME_BONUS = DIFFICULTY_SETTINGS.medium.timeBonus;
export const MAX_TIME = DIFFICULTY_SETTINGS.medium.startingTime;

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

export function selectRecipe(difficulty: Difficulty, random: () => number = Math.random): Recipe {
  const sample = random();

  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('The random source must return a number from 0 inclusive to 1 exclusive.');
  }

  const recipes = getRecipesByDifficulty(difficulty);
  const recipe = recipes[Math.floor(sample * recipes.length)];

  if (recipe === undefined) {
    throw new Error(`The ${difficulty} recipe pool must contain at least one recipe.`);
  }

  return recipe;
}

export function selectMediumRecipe(random: () => number = Math.random): Recipe {
  return selectRecipe('medium', random);
}

function isInRange(value: number, range: RecipeRange, tolerance: number): boolean {
  return value >= range.min - tolerance && value <= range.max + tolerance;
}

export function checkBrew(
  totals: MixtureTotals,
  recipe: Recipe,
  difficulty: Difficulty = recipe.difficulty,
): BrewCheck {
  const tolerance = DIFFICULTY_SETTINGS[difficulty].tolerance;
  const checks: BrewChecks = {
    temperature: isInRange(totals.temperature, recipe.temperature, tolerance),
    density: isInRange(totals.density, recipe.density, tolerance),
    magicPower: isInRange(totals.magicPower, recipe.magicPower, tolerance),
  };

  return {
    success: checks.temperature && checks.density && checks.magicPower,
    checks,
  };
}

export function brewGame(state: GameState, random: () => number = Math.random): BrewResult {
  if (
    state.status === 'game-over' ||
    state.lives <= 0 ||
    state.timeRemaining <= 0 ||
    (state.mixing.mixture.length === 0 && hasNoStock(state.mixing, state.difficulty))
  ) {
    return { accepted: false, reason: 'game-over', state };
  }

  if (state.mixing.mixture.length === 0) {
    return { accepted: false, reason: 'empty-cauldron', state };
  }

  const settings = DIFFICULTY_SETTINGS[state.difficulty];
  const totals = calculateCauldronTotals(state.mixing.mixture, state.difficulty);
  const check = checkBrew(totals, state.recipe, state.difficulty);
  const lives = state.lives - (check.success ? 0 : 1);
  const score = state.score + (check.success ? settings.scorePerBrew : 0);
  const timeRemaining = check.success
    ? Math.min(settings.startingTime, state.timeRemaining + settings.timeBonus)
    : state.timeRemaining;
  const mixing = clearCauldron(state.mixing);
  const endReason: GameEndReason =
    lives === 0
      ? 'out-of-lives'
      : hasNoStock(mixing, state.difficulty)
        ? 'out-of-ingredients'
        : null;

  return {
    accepted: true,
    state: {
      ...state,
      mixing,
      recipe: check.success ? selectRecipe(state.difficulty, random) : state.recipe,
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
