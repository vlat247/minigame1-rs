import { icon } from './icons';

export type DraftDialog = 'help' | 'menu' | 'leaderboard' | 'pause' | 'exit' | 'restart';

interface DialogContent {
  readonly title: string;
  readonly description: string;
  readonly body: string;
}

const DIALOGS: Record<DraftDialog, DialogContent> = {
  help: {
    title: 'How to play',
    description: 'A good potion is a matter of balance.',
    body: `
      <ol class="help-steps">
        <li><strong>Read the recipe.</strong><p>Find its Temperature, Density, and Magic Power target ranges.</p></li>
        <li><strong>Choose your ingredients.</strong><p>Each ingredient changes the three values. Use up to 4 portions per mixture; every added portion is spent.</p></li>
        <li><strong>Brew a potion.</strong><p>All three values must fit the targets, with a tolerance of ±8 in Medium mode. A successful brew earns 200 points and up to 10 extra seconds. A failed brew costs one life.</p></li>
      </ol>
      <p class="dialog-note">A Medium game begins with 2:30 and 3 lives. Time, lives, and ingredient stock limit the run.</p>
      <p class="dialog-note">This draft previews the screens. Mixing, brewing, and timing will be implemented in later branches.</p>
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
      <p class="dialog-note">New Game opens a visual preview of the Medium workbench.</p>`,
  },
  leaderboard: {
    title: 'Leaderboard',
    description: 'The ten best potion-making runs.',
    body: `
      <div class="leaderboard-empty">${icon('trophy', 'empty-state-icon')}<h3>No results yet</h3><p>Completed games will appear here with a player name, score, and date.</p></div>
      <div class="dialog-actions"><button class="button button-primary" type="button" data-action="dialog-close" data-dialog-focus>Back</button></div>`,
  },
  pause: {
    title: 'Game paused',
    description: 'Your workbench will be here when you return.',
    body: `
      <div class="dialog-actions dialog-actions-stacked">
        <button class="button button-primary" type="button" data-action="resume" data-dialog-focus>${icon('play')}Resume</button>
        <button class="button button-secondary" type="button" data-action="exit">Exit to start</button>
        <button class="button button-quiet" type="button" data-action="help">How to play</button>
      </div>`,
  },
  exit: {
    title: 'Leave the workbench?',
    description: 'Returning to the start screen closes the current preview.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep it open</button><button class="button button-primary" type="button" data-action="confirm-exit">Exit to start</button></div>`,
  },
  restart: {
    title: 'Start a new game?',
    description: 'This will replace the current preview with a fresh workbench.',
    body: `<div class="dialog-actions"><button class="button button-secondary" type="button" data-action="dialog-close" data-dialog-focus>Keep current preview</button><button class="button button-primary" type="button" data-action="confirm-new">Start new game</button></div>`,
  },
};

export function dialogMarkup(kind: DraftDialog): string {
  const content = DIALOGS[kind];
  return `
    <div class="dialog-header">
      <h2 id="draft-dialog-title">${content.title}</h2>
      <button class="button dialog-close" type="button" data-action="dialog-close" aria-label="${kind === 'pause' ? 'Resume preview' : 'Close dialog'}">${icon('close')}</button>
    </div>
    <p class="dialog-description" id="draft-dialog-description">${content.description}</p>
    ${content.body}`;
}
