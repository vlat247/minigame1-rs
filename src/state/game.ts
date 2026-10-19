import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import type { Difficulty } from '../data/difficulty.ts';
import { selectRecipe } from '../logic/brewing.ts';
import { createMixingState } from '../logic/ingredients.ts';
import type { MixingState } from '../logic/ingredients.ts';
import type { Recipe } from '../data/recipes.ts';

export { MAX_TIME as STARTING_TIME } from '../logic/brewing.ts';
export const STARTING_LIVES = DIFFICULTY_SETTINGS.medium.lives;

export type GameStatus = 'playing' | 'game-over';
export type GameEndReason = 'out-of-lives' | 'out-of-ingredients' | 'time-expired' | null;

export interface GameState {
  readonly difficulty: Difficulty;
  readonly mixing: MixingState;
  readonly recipe: Recipe;
  readonly score: number;
  readonly lives: number;
  readonly timeRemaining: number;
  readonly elapsedTime: number;
  readonly status: GameStatus;
  readonly endReason: GameEndReason;
}

export function createGame(
  random: () => number = Math.random,
  difficulty: Difficulty = 'medium',
): GameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const mixing = createMixingState(random, difficulty);

  return {
    difficulty,
    mixing,
    recipe: selectRecipe(difficulty, random),
    score: 0,
    lives: settings.lives,
    timeRemaining: settings.startingTime,
    elapsedTime: 0,
    status: 'playing',
    endReason: null,
  };
}
