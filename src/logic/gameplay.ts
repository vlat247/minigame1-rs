import type { Reaction } from '../data/reactions.ts';
import type { GameEndReason, GameState } from '../state/game.ts';
import { addIngredient, clearCauldron, hasNoStock } from './ingredients.ts';
import type { IngredientRejectionReason } from './ingredients.ts';
import { calculateCauldronTotals, getNewlyActiveReactions } from './reactions.ts';

export const POUR_OUT_TIME_COST = 10;

export interface ReactionFeedback {
  readonly reactions: readonly Reaction[];
  readonly timeDelta: number;
  readonly livesDelta: number;
  readonly cleared: boolean;
}

export type GameAdditionResult =
  | { readonly accepted: true; readonly state: GameState; readonly feedback: ReactionFeedback }
  | {
      readonly accepted: false;
      readonly reason: IngredientRejectionReason | 'game-over';
      readonly state: GameState;
    };

export type PourOutResult =
  | { readonly accepted: true; readonly state: GameState; readonly timeDelta: number }
  | {
      readonly accepted: false;
      readonly reason: 'empty-cauldron' | 'game-over';
      readonly state: GameState;
    };

function cannotPlay(game: GameState): boolean {
  return (
    game.status !== 'playing' ||
    game.lives <= 0 ||
    game.timeRemaining <= 0 ||
    (game.mixing.mixture.length === 0 && hasNoStock(game.mixing, game.difficulty))
  );
}

function settleGame(game: GameState): GameState {
  const endReason: GameEndReason =
    game.lives <= 0
      ? 'out-of-lives'
      : game.timeRemaining <= 0
        ? 'time-expired'
        : game.mixing.mixture.length === 0 && hasNoStock(game.mixing, game.difficulty)
          ? 'out-of-ingredients'
          : null;

  return { ...game, status: endReason === null ? 'playing' : 'game-over', endReason };
}

/** Spend a portion, recalculate active modifiers, and charge only newly activated effects. */
export function addGameIngredient(game: GameState, id: string): GameAdditionResult {
  if (cannotPlay(game)) return { accepted: false, reason: 'game-over', state: game };
  const addition = addIngredient(game.mixing, id, game.difficulty);
  if (!addition.accepted) return { ...addition, state: game };

  const reactions = getNewlyActiveReactions(
    game.mixing.mixture,
    addition.state.mixture,
    game.difficulty,
  );
  const cleared = reactions.some((reaction) => reaction.clearsCauldron);
  const timeRemaining = Math.max(
    0,
    game.timeRemaining - reactions.reduce((sum, reaction) => sum + reaction.timePenalty, 0),
  );
  const lives = Math.max(
    0,
    game.lives - reactions.reduce((sum, reaction) => sum + reaction.lifePenalty, 0),
  );
  const mixing = cleared
    ? clearCauldron(addition.state)
    : {
        ...addition.state,
        totals: calculateCauldronTotals(addition.state.mixture, game.difficulty),
      };

  return {
    accepted: true,
    state: settleGame({ ...game, mixing, timeRemaining, lives }),
    feedback: {
      reactions,
      timeDelta: timeRemaining - game.timeRemaining,
      livesDelta: lives - game.lives,
      cleared,
    },
  };
}

/** Empty the mixture without refunding stock or counting a time penalty as active play. */
export function pourOutGame(game: GameState): PourOutResult {
  if (cannotPlay(game)) return { accepted: false, reason: 'game-over', state: game };
  if (game.mixing.mixture.length === 0) {
    return { accepted: false, reason: 'empty-cauldron', state: game };
  }

  const timeRemaining = Math.max(0, game.timeRemaining - POUR_OUT_TIME_COST);
  return {
    accepted: true,
    state: settleGame({ ...game, mixing: clearCauldron(game.mixing), timeRemaining }),
    timeDelta: timeRemaining - game.timeRemaining,
  };
}
