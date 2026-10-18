import { MAX_TIME, selectMediumRecipe } from '../logic/brewing.ts';
import { createMixingState } from '../logic/ingredients.ts';
import type { MixingState } from '../logic/ingredients.ts';
import type { Recipe } from '../data/recipes.ts';

export { MAX_TIME as STARTING_TIME } from '../logic/brewing.ts';
export const STARTING_LIVES = 3;

export type GameStatus = 'playing' | 'game-over';
export type GameEndReason = 'out-of-lives' | 'out-of-ingredients' | null;

export interface GameState {
  readonly mixing: MixingState;
  readonly recipe: Recipe;
  readonly score: number;
  readonly lives: number;
  readonly timeRemaining: number;
  readonly status: GameStatus;
  readonly endReason: GameEndReason;
}

export function createGame(random: () => number = Math.random): GameState {
  const mixing = createMixingState(random);

  return {
    mixing,
    recipe: selectMediumRecipe(random),
    score: 0,
    lives: STARTING_LIVES,
    timeRemaining: MAX_TIME,
    status: 'playing',
    endReason: null,
  };
}
