import type { GameState } from '../state/game.ts';

export function advanceGameTime(game: GameState, elapsedSeconds: number): GameState {
  if (game.status === 'game-over' || !Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return game;
  }

  const consumed = Math.min(elapsedSeconds, Math.max(0, game.timeRemaining));
  const timeRemaining = Math.max(0, game.timeRemaining - elapsedSeconds);

  return {
    ...game,
    timeRemaining,
    elapsedTime: game.elapsedTime + consumed,
    status: timeRemaining === 0 ? 'game-over' : 'playing',
    endReason: timeRemaining === 0 ? 'time-expired' : game.endReason,
  };
}
