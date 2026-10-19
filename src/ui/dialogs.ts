import { SCORE_PER_BREW } from '../logic/brewing';
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
}

interface DialogContent {
  readonly title: string;
  readonly description: string;
  readonly body: string;
}

const DIALOGS: Record<Exclude<GameDialog, 'game-over' | 'leaderboard'>, DialogContent> = {
  help: {
    title: 'How to play',
    description: 'A good potion is a matter of balance.',
    body: `
      <ol class="help-steps">
        <li><strong>Read the recipe.</strong><p>Find its Temperature, Density, and Magic Power target ranges.</p></li>
        <li><strong>Choose your ingredients.</strong><p>Each ingredient changes the three values. Use up to 4 portions per mixture; every added portion is spent.</p></li>
        <li><strong>Brew a potion.</strong><p>All three values must fit the targets, with a tolerance of ±8 in Medium mode. Success earns 200 points, adds up to 10 seconds without exceeding 2:30, and selects another recipe. Failure costs one life and keeps the recipe.</p></li>
      </ol>
      <p class="dialog-note">A Medium game begins with 2:30 and 3 lives. Time, lives, and ingredient stock limit the run.</p>
      <p class="dialog-note">Every brew clears the cauldron. Spent ingredients never return to the shelf. Green gauges mark the original recipe ranges; brewing also allows the ±8 tolerance.</p>
      <p class="dialog-note">Pause freezes the clock and hides the workbench. Switching tabs pauses automatically; return and choose Resume. Help, Menu, and Leaderboard keep the clock running unless you pause first.</p>
      <p class="dialog-note">A run ends when time or lives run out, or the shelf and cauldron are both empty. Qualifying results can be saved in this browser's Top 10.</p>
      <div class="dialog-actions"><button class="button button-primary" type="button" data-action="dialog-close" data-dialog-focus>Got it</button></div>`,
  },
  menu: {
    title: 'Game menu',
    description: 'Prepare your next round.',
    body: `
      <dl class="menu-rules"><div><dt>Difficulty</dt><dd>Medium</dd></div><div><dt>Starting time</dt><dd>2:30</dd></div><div><dt>Lives</dt><dd>3</dd></div></dl>
      <div class="menu-actions">
        <button class="menu-action" type="button" data-action="new" data-dialog-focus><span>${icon('play')}Start new game</span>${icon('arrow')}</button>
        <button class="menu-action" type="button" data-action="leaderboard"><span>${icon('trophy')}Leaderboard</span>${icon('arrow')}</button>
        <button class="menu-action" type="button" data-action="help"><span>${icon('help')}How to play</span>${icon('arrow')}</button>
      </div>
      <p class="dialog-note">New Game resets your score and lives, gives each ingredient 2–15 portions, and selects a random Medium recipe.</p>`,
  },
  'clear-leaderboard': {
    title: 'Clear the leaderboard?',
    description: 'This removes all saved scores from this browser.',
    body: '<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep scores</button><button class="button button-primary" type="button" data-action="confirm-clear-leaderboard">Clear Leaderboard</button></div>',
  },
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
    description: 'Returning to the start screen discards the current run and score.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep it open</button><button class="button button-primary" type="button" data-action="confirm-exit">Exit to start</button></div>`,
  },
  restart: {
    title: 'Start a new game?',
    description: 'This resets your score, lives, mixture, and stock, then selects a random recipe.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep current game</button><button class="button button-primary" type="button" data-action="confirm-new">Start new game</button></div>`,
  },
};

function gameOverContent(game: GameState | null, context: DialogContext): DialogContent {
  return {
    title: 'Game over',
    description:
      game?.endReason === 'time-expired'
        ? 'Time is up.'
        : game?.endReason === 'out-of-ingredients'
          ? 'Your ingredient stock is exhausted.'
          : 'You have no lives left.',
    body: `
      <dl class="menu-rules"><div><dt>Final score</dt><dd>${game?.score ?? 0}</dd></div><div><dt>Potions brewed</dt><dd>${(game?.score ?? 0) / SCORE_PER_BREW}</dd></div><div><dt>Time played</dt><dd>${Math.floor(game?.elapsedTime ?? 0)}s</dd></div></dl>
      ${
        context.needsName
          ? `<form id="score-form" class="score-name-form" novalidate>
        <p>Your score enters the Top 10.</p>
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
            description: 'The ten best completed games in this browser.',
            body: leaderboardMarkup(context.leaderboard, context.storageNotice),
          }
        : DIALOGS[kind];
  return `
    <div class="dialog-header">
      <h2 id="game-dialog-title">${content.title}</h2>
      <button class="button dialog-close" type="button" data-action="dialog-close" aria-label="${kind === 'pause' ? 'Resume game' : kind === 'game-over' ? 'Return to start screen' : 'Close dialog'}">${icon('close')}</button>
    </div>
    <p class="dialog-description" id="game-dialog-description">${content.description}</p>
    ${content.body}`;
}
