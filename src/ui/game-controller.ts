import { getIngredient } from '../data/ingredients';
import { brewGame } from '../logic/brewing';
import { addIngredient } from '../logic/ingredients';
import { createGame } from '../state/game';
import { dialogMarkup } from './dialogs';
import type { GameDialog } from './dialogs';
import { renderGameView, updateGameView } from './game-view';
import type { GameViewState } from './game-view';

export function mountGame(container: HTMLElement): () => void {
  const view = document.createElement('div');
  const dialog = document.createElement('dialog');
  const announcement = document.createElement('p');
  let state: GameViewState = { game: null, paused: false, lastBrew: null };
  let dialogs: GameDialog[] = [];
  let returnAction = 'start';

  dialog.className = 'game-dialog';
  dialog.setAttribute('aria-labelledby', 'game-dialog-title');
  dialog.setAttribute('aria-describedby', 'game-dialog-description');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  container.replaceChildren(view, dialog, announcement);

  function render(): void {
    renderGameView(view, state);
  }

  function focusAction(action: string): void {
    view.querySelector<HTMLElement>(`[data-action="${action}"]`)?.focus();
  }

  function renderDialog(kind: GameDialog): void {
    dialog.innerHTML = dialogMarkup(kind, state.game);
    dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
  }

  function openDialog(kind: GameDialog): void {
    if (!dialog.open) {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused.dataset.action !== undefined) {
        returnAction = focused.dataset.action;
      }
    }
    dialogs.push(kind);
    renderDialog(kind);
    if (!dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
    }
  }

  function dismissDialogs(): void {
    dialogs = [];
    if (dialog.open) dialog.close();
  }

  function startGame(): void {
    dismissDialogs();
    state = { game: createGame(), paused: false, lastBrew: null };
    render();
    focusAction('pause');
    announcement.textContent = `Medium game started. Current recipe: ${state.game?.recipe.name}. Add up to four portions, then brew. The countdown is not active yet.`;
  }

  function resumeGame(): void {
    dismissDialogs();
    state = { ...state, paused: false };
    render();
    focusAction('pause');
    announcement.textContent = 'Workbench resumed.';
  }

  function pauseGame(): void {
    if (state.game === null || state.game.status !== 'playing' || state.paused) return;
    state = { ...state, paused: true };
    render();
    returnAction = 'pause';
    if (dialog.open) {
      dialogs.unshift('pause');
    } else {
      openDialog('pause');
    }
    announcement.textContent = 'Workbench paused.';
  }

  function closeDialog(): void {
    const current = dialogs.at(-1);
    if (current === 'game-over') {
      showStart();
      return;
    }
    if (current === 'pause') {
      resumeGame();
      return;
    }
    dialogs.pop();
    const previous = dialogs.at(-1);
    if (previous !== undefined) {
      renderDialog(previous);
      return;
    }
    dismissDialogs();
    focusAction(returnAction);
  }

  function showStart(): void {
    dismissDialogs();
    state = { game: null, paused: false, lastBrew: null };
    render();
    focusAction('start');
    announcement.textContent = 'Returned to the empty start screen.';
  }

  function addPortion(id: string | undefined): void {
    if (
      state.game === null ||
      state.game.status !== 'playing' ||
      state.paused ||
      dialog.open ||
      id === undefined
    )
      return;
    const result = addIngredient(state.game.mixing, id);
    const ingredient = getIngredient(id);
    if (ingredient === undefined) return;
    const feedback = view.querySelector('#ingredient-feedback');
    if (!result.accepted) {
      if (result.reason !== 'cauldron-full' && result.reason !== 'out-of-stock') return;
      if (feedback !== null) {
        feedback.textContent =
          result.reason === 'cauldron-full'
            ? 'Cauldron full: only four portions fit. Brew this mixture before adding more.'
            : `${ingredient.name} is out of stock.`;
      }
      return;
    }

    state = { ...state, game: { ...state.game, mixing: result.state }, lastBrew: null };
    // Update existing controls and gauges so keyboard focus and CSS transitions survive.
    updateGameView(view, state);
    if (feedback !== null) {
      const totals = result.state.totals;
      feedback.textContent = `${ingredient.name} added. Temperature ${totals.temperature}, Density ${totals.density}, Magic Power ${totals.magicPower}.`;
    }
    if (result.state.inventory[ingredient.id] === 0) {
      const next = view.querySelector<HTMLButtonElement>('.ingredient:not(:disabled)');
      next?.focus({ preventScroll: true });
    }
  }

  function brewPotion(): void {
    if (state.game === null || state.paused || dialog.open) return;
    const result = brewGame(state.game);
    if (!result.accepted) return;

    state = { ...state, game: result.state, lastBrew: result.feedback };
    updateGameView(view, state);
    const outcome = result.feedback;
    announcement.textContent = outcome.success
      ? `${outcome.recipe.name} brewed. ${outcome.scoreDelta} points earned; total score ${result.state.score}. Next recipe: ${result.state.recipe.name}.`
      : `${outcome.recipe.name} failed. One life lost; ${result.state.lives} lives remain. The recipe stays the same.`;
    const feedback = view.querySelector('#ingredient-feedback');
    if (feedback !== null) feedback.textContent = '';
    if (result.state.status === 'game-over') {
      openDialog('game-over');
    } else {
      view.querySelector<HTMLButtonElement>('.ingredient:not(:disabled)')?.focus();
    }
  }

  function handleClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest<HTMLElement>('[data-action]');
    if (control === null || !container.contains(control)) return;
    if (control instanceof HTMLButtonElement && control.disabled) return;
    event.preventDefault();

    switch (control.dataset.action) {
      case 'start':
      case 'confirm-new':
        startGame();
        break;
      case 'add-ingredient':
        addPortion(control.dataset.ingredient);
        break;
      case 'brew':
        brewPotion();
        break;
      case 'help':
      case 'menu':
      case 'leaderboard':
        openDialog(control.dataset.action);
        break;
      case 'new':
        if (state.game !== null && state.game.status === 'playing') openDialog('restart');
        else startGame();
        break;
      case 'pause':
        pauseGame();
        break;
      case 'resume':
        resumeGame();
        break;
      case 'home':
        if (state.game !== null && state.game.status === 'playing') openDialog('exit');
        else showStart();
        break;
      case 'exit':
        openDialog('exit');
        break;
      case 'confirm-exit':
        showStart();
        break;
      case 'dialog-close':
        closeDialog();
        break;
    }
  }

  function handleCancel(event: Event): void {
    event.preventDefault();
    // Escape must not reveal a blurred workbench with no Resume control.
    if (dialogs.at(-1) !== 'pause') closeDialog();
  }

  function handleVisibility(): void {
    if (document.hidden) pauseGame();
  }

  function handleDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const first = controls.at(0);
    const last = controls.at(-1);
    if (first === undefined || last === undefined) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  render();
  container.addEventListener('click', handleClick);
  dialog.addEventListener('cancel', handleCancel);
  dialog.addEventListener('keydown', handleDialogKeydown);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    container.removeEventListener('click', handleClick);
    dialog.removeEventListener('cancel', handleCancel);
    dialog.removeEventListener('keydown', handleDialogKeydown);
    document.removeEventListener('visibilitychange', handleVisibility);
    dismissDialogs();
  };
}
