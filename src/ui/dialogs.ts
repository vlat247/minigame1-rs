import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/difficulty';
import type { Difficulty } from '../data/difficulty';
import type { GameState } from '../state/game';
import type { LeaderboardEntry } from '../logic/leaderboard';
import { icon } from './icons';
import { escapeHtml, leaderboardMarkup } from './leaderboard-view';

export type GameDialog =
  | 'help'
  | 'menu'
  | 'leaderboard'
  | 'clear-leaderboard'
  | 'pause'
  | 'exit'
  | 'restart'
  | 'game-over';

export interface DialogContext {
  readonly leaderboard: readonly LeaderboardEntry[];
  readonly storageNotice: string;
  readonly scoreMessage: string;
  readonly needsName: boolean;
  readonly nameDraft: string;
  readonly nameError: string;
  readonly selectedDifficulty: Difficulty;
  readonly leaderboardDifficulty: Difficulty;
  readonly canContinue: boolean;
  readonly saveNotice: string;
}

interface DialogContent {
  readonly title: string;
  readonly description: string;
  readonly body: string;
}

function helpContent(difficulty: Difficulty): DialogContent {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return {
    title: 'How to play',
    description: 'A good potion is a matter of balance.',
    body: `
      <ol class="help-steps">
        <li><strong>Read the recipe.</strong><p>Find its Temperature, Density, and Magic Power target ranges.</p></li>
        <li><strong>Choose your ingredients.</strong><p>Each ingredient changes the three values. Use up to ${settings.maxIngredients} portions per mixture; every added portion is spent.</p></li>
        <li><strong>Brew a potion.</strong><p>All three values must fit the targets, with a tolerance of ±${settings.tolerance} in ${settings.label} mode. Success earns ${settings.scorePerBrew} points, adds up to ${settings.timeBonus} seconds without exceeding ${settings.startingTime} seconds, and selects another recipe. Failure costs one life and keeps the recipe.</p></li>
      </ol>
      <p class="dialog-note">A ${settings.label} game begins with ${settings.startingTime} seconds, ${settings.lives} lives and ${settings.ingredientCount} ingredient types. Choose the difficulty in Menu before starting.</p>
      <p class="dialog-note">Every brew clears the cauldron. Spent ingredients never return to the shelf. Green gauges mark the original recipe ranges; brewing also allows the ±${settings.tolerance} tolerance.</p>
      <p class="dialog-note">Pause freezes the clock and hides the workbench. Switching tabs pauses automatically; return and choose Resume. Help, Menu, and Leaderboard keep the clock running unless you pause first.</p>
      <p class="dialog-note">Progress saves automatically. After a reload, Continue Game restores your unfinished run paused. Exit to Menu discards that save.</p>
      <p class="dialog-note">A run ends when time or lives run out, or the shelf and cauldron are both empty. Each difficulty has its own Top 10.</p>
      <div class="dialog-actions"><button class="button button-primary" type="button" data-action="dialog-close" data-dialog-focus>Got it</button></div>`,
  };
}

function menuContent(game: GameState | null, context: DialogContext): DialogContent {
  const difficulty = game?.difficulty ?? context.selectedDifficulty;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const running = game?.status === 'playing';
  return {
    title: 'Game menu',
    description: 'Prepare your next round.',
    body: `
      <div class="difficulty-options" role="group" aria-label="Game difficulty">
        ${DIFFICULTIES.map((option) => `<button class="button button-secondary" type="button" data-action="select-difficulty" data-difficulty="${option}" aria-pressed="${option === difficulty}" ${running ? 'disabled' : ''} ${!running && option === difficulty ? 'data-dialog-focus' : ''}>${DIFFICULTY_SETTINGS[option].label}</button>`).join('')}
      </div>
      <p class="dialog-note">${running ? 'Exit this run to change difficulty.' : 'Choose a difficulty for your next game.'}</p>
      <dl class="menu-rules"><div><dt>Difficulty</dt><dd>${settings.label}</dd></div><div><dt>Starting time</dt><dd>${settings.startingTime}s</dd></div><div><dt>Lives</dt><dd>${settings.lives}</dd></div></dl>
      <p class="dialog-note">${settings.ingredientCount} ingredient types · ${settings.maxIngredients} portions per mixture · ±${settings.tolerance} tolerance · ${settings.scorePerBrew} points and +${settings.timeBonus}s per brew.</p>
      <div class="menu-actions">
        ${game === null && context.canContinue ? `<button class="menu-action" type="button" data-action="continue"><span>${icon('play')}Continue Game</span>${icon('arrow')}</button>` : ''}
        <button class="menu-action" type="button" data-action="new" ${running ? 'data-dialog-focus' : ''}><span>${icon('play')}Start new game</span>${icon('arrow')}</button>
        <button class="menu-action" type="button" data-action="leaderboard"><span>${icon('trophy')}Leaderboard</span>${icon('arrow')}</button>
        <button class="menu-action" type="button" data-action="help"><span>${icon('help')}How to play</span>${icon('arrow')}</button>
      </div>
      <p class="dialog-note">New Game replaces the unfinished save, resets your score and lives, gives each ingredient 2–15 portions, and selects a random ${settings.label} recipe.</p>
      ${context.saveNotice === '' ? '' : `<p class="save-notice" role="status">${escapeHtml(context.saveNotice)}</p>`}`,
  };
}

const DIALOGS: Record<
  Exclude<GameDialog, 'game-over' | 'leaderboard' | 'help' | 'menu' | 'clear-leaderboard'>,
  DialogContent
> = {
  pause: {
    title: 'Game paused',
    description: 'Your workbench will be here when you return.',
    body: `
      <div class="dialog-actions dialog-actions-stacked">
        <button class="button button-primary" type="button" data-action="resume" data-dialog-focus>${icon('play')}Resume</button>
        <button class="button button-secondary" type="button" data-action="exit">Exit to Menu</button>
        <button class="button button-quiet" type="button" data-action="help">How to play</button>
      </div>`,
  },
  exit: {
    title: 'Leave the workbench?',
    description:
      'Returning to the start screen discards the current run, score and unfinished save.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep it open</button><button class="button button-primary" type="button" data-action="confirm-exit">Exit to start</button></div>`,
  },
  restart: {
    title: 'Start a new game?',
    description: 'This resets your score, lives, mixture, and stock, then selects a random recipe.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep current game</button><button class="button button-primary" type="button" data-action="confirm-new">Start new game</button></div>`,
  },
};

function gameOverContent(game: GameState | null, context: DialogContext): DialogContent {
  const settings = DIFFICULTY_SETTINGS[game?.difficulty ?? context.selectedDifficulty];
  return {
    title: 'Game over',
    description:
      game?.endReason === 'time-expired'
        ? 'Time is up.'
        : game?.endReason === 'out-of-ingredients'
          ? 'Your ingredient stock is exhausted.'
          : 'You have no lives left.',
    body: `
      <p class="dialog-note">${settings.label} difficulty</p>
      <dl class="menu-rules"><div><dt>Final score</dt><dd>${game?.score ?? 0}</dd></div><div><dt>Potions brewed</dt><dd>${(game?.score ?? 0) / settings.scorePerBrew}</dd></div><div><dt>Time played</dt><dd>${Math.floor(game?.elapsedTime ?? 0)}s</dd></div></dl>
      ${
        context.needsName
          ? `<form id="score-form" class="score-name-form" novalidate>
        <p>Your score enters the ${settings.label} Top 10.</p>
        <label for="player-name">Player name</label>
        <input id="player-name" name="player-name" type="text" autocomplete="nickname" maxlength="30" value="${escapeHtml(context.nameDraft)}" aria-describedby="player-name-help player-name-error" ${context.nameError === '' ? '' : 'aria-invalid="true"'} data-dialog-focus>
        <p id="player-name-help" class="dialog-note">2–15 characters: letters, digits, spaces, _ or -.</p>
        <p id="player-name-error" class="form-error" role="alert">${escapeHtml(context.nameError)}</p>
        <div class="dialog-actions"><button class="button button-secondary" type="button" data-action="skip-score">Skip saving</button><button class="button button-primary" type="submit">Save score</button></div>
      </form>`
          : ''
      }
      ${context.scoreMessage === '' ? '' : `<p class="dialog-note" role="status">${escapeHtml(context.scoreMessage)}</p>`}
      ${context.storageNotice === '' ? '' : `<p class="dialog-note">${escapeHtml(context.storageNotice)}</p>`}
      <div class="dialog-actions"><button class="button button-secondary" type="button" data-action="leaderboard">Leaderboard</button><button class="button button-primary" type="button" data-action="confirm-new" ${context.needsName ? '' : 'data-dialog-focus'}>Play again</button></div>`,
  };
}

export function dialogMarkup(
  kind: GameDialog,
  game: GameState | null,
  context: DialogContext,
): string {
  const content =
    kind === 'game-over'
      ? gameOverContent(game, context)
      : kind === 'leaderboard'
        ? {
            title: 'Leaderboard',
            description: `The ten best ${DIFFICULTY_SETTINGS[context.leaderboardDifficulty].label} games in this browser.`,
            body: leaderboardMarkup(
              context.leaderboard,
              context.storageNotice,
              context.leaderboardDifficulty,
            ),
          }
        : kind === 'help'
          ? helpContent(game?.difficulty ?? context.selectedDifficulty)
          : kind === 'menu'
            ? menuContent(game, context)
            : kind === 'clear-leaderboard'
              ? {
                  title: 'Clear the leaderboard?',
                  description: `This removes saved ${DIFFICULTY_SETTINGS[context.leaderboardDifficulty].label} scores only. Other difficulties are kept.`,
                  body: '<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep scores</button><button class="button button-primary" type="button" data-action="confirm-clear-leaderboard">Clear Leaderboard</button></div>',
                }
              : DIALOGS[kind];
  return `
    <div class="dialog-header">
      <h2 id="game-dialog-title">${content.title}</h2>
      <button class="button dialog-close" type="button" data-action="dialog-close" aria-label="${kind === 'pause' ? 'Resume game' : kind === 'game-over' ? 'Return to start screen' : 'Close dialog'}">${icon('close')}</button>
    </div>
    <p class="dialog-description" id="game-dialog-description">${content.description}</p>
    ${context.saveNotice !== '' && kind !== 'menu' ? `<p class="save-notice" role="status">${escapeHtml(context.saveNotice)}</p>` : ''}
    ${content.body}`;
}
