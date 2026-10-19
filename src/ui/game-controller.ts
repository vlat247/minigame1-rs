import { getIngredient } from '../data/ingredients';
import { brewGame } from '../logic/brewing';
import { addIngredient } from '../logic/ingredients';
import { addLeaderboardEntry, isQualifyingScore, validatePlayerName } from '../logic/leaderboard';
import type { LeaderboardEntry } from '../logic/leaderboard';
import { advanceGameTime } from '../logic/session';
import { createGame } from '../state/game';
import { createLeaderboardStore } from '../storage/leaderboard';
import { dialogMarkup } from './dialogs';
import type { GameDialog } from './dialogs';
import { renderGameView, updateGameView, updateSessionView } from './game-view';
import type { GameViewState } from './game-view';
import { createSessionClock } from './session-clock';

export function mountGame(container: HTMLElement): () => void {
  const view = document.createElement('div');
  const dialog = document.createElement('dialog');
  const announcement = document.createElement('p');
  let state: GameViewState = { game: null, paused: false, lastBrew: null };
  let dialogs: GameDialog[] = [];
  let returnAction = 'start';
  const leaderboardStore = createLeaderboardStore();
  let leaderboard: readonly LeaderboardEntry[] = [];
  let storageNotice = '';
  let scoreMessage = '';
  let nameDraft = '';
  let nameError = '';
  let needsName = false;
  let finishedAt: string | null = null;
  let finishHandled = false;
  let warnedAboutTime = false;
  let memoryOnly = false;

  dialog.className = 'game-dialog';
  dialog.setAttribute('aria-labelledby', 'game-dialog-title');
  dialog.setAttribute('aria-describedby', 'game-dialog-description');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  container.replaceChildren(view, dialog, announcement);
  const clock = createSessionClock((elapsed) => {
    if (state.game === null || state.paused || state.game.status !== 'playing') return;
    const game = advanceGameTime(state.game, elapsed);
    state = { ...state, game };
    updateSessionView(view, state);
    if (game.timeRemaining < 15 && !warnedAboutTime && game.status === 'playing') {
      warnedAboutTime = true;
      announcement.textContent = 'Less than 15 seconds remaining.';
    }
    if (game.status === 'game-over') finishGame();
  });

  function refreshLeaderboard(): void {
    if (memoryOnly) return;
    const result = leaderboardStore.load();
    if (result.error !== 'unavailable') leaderboard = result.entries;
    storageNotice =
      result.error === 'unavailable'
        ? 'Browser storage is unavailable. Scores are kept for this visit only.'
        : result.error === 'corrupt'
          ? 'Some stored scores could not be read.'
          : '';
    if (result.error === 'unavailable') memoryOnly = true;
  }

  function finishGame(): void {
    if (state.game?.status !== 'game-over' || finishHandled) return;
    finishHandled = true;
    clock.stop();
    finishedAt = new Date().toISOString();
    refreshLeaderboard();
    needsName = isQualifyingScore(state.game.score, leaderboard);
    dismissDialogs();
    updateGameView(view, state);
    openDialog('game-over');
  }

  function render(): void {
    renderGameView(view, state);
  }

  function focusAction(action: string): void {
    view.querySelector<HTMLElement>(`[data-action="${action}"]`)?.focus();
  }

  function renderDialog(kind: GameDialog): void {
    const nameInput = dialog.querySelector<HTMLInputElement>('[name="player-name"]');
    if (nameInput !== null) nameDraft = nameInput.value;
    dialog.dataset.kind = kind;
    dialog.innerHTML = dialogMarkup(kind, state.game, {
      leaderboard,
      storageNotice,
      scoreMessage,
      needsName,
      nameDraft,
      nameError,
    });
    dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
  }

  function openDialog(kind: GameDialog): void {
    if (kind === 'leaderboard') refreshLeaderboard();
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
    dialog.replaceChildren();
  }

  function startGame(): void {
    clock.stop();
    dismissDialogs();
    finishHandled = false;
    warnedAboutTime = false;
    needsName = false;
    finishedAt = null;
    nameDraft = '';
    nameError = '';
    scoreMessage = '';
    state = { game: createGame(), paused: false, lastBrew: null };
    render();
    focusAction('pause');
    announcement.textContent = `Medium game started. Current recipe: ${state.game?.recipe.name}. You have two minutes and thirty seconds.`;
    clock.start();
    if (document.hidden) pauseGame();
  }

  function resumeGame(): void {
    if (state.game?.status !== 'playing') return;
    dismissDialogs();
    state = { ...state, paused: false };
    render();
    focusAction('pause');
    announcement.textContent = 'Workbench resumed.';
    clock.start();
  }

  function pauseGame(): void {
    if (state.game === null || state.game.status !== 'playing' || state.paused) return;
    clock.pause();
    if (state.game.status !== 'playing') return;
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
    clock.stop();
    dismissDialogs();
    state = { game: null, paused: false, lastBrew: null };
    render();
    focusAction('start');
    announcement.textContent = 'Returned to the empty start screen.';
  }

  function addPortion(id: string | undefined): void {
    clock.synchronize();
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
    clock.synchronize();
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
      finishGame();
    } else {
      view.querySelector<HTMLButtonElement>('.ingredient:not(:disabled)')?.focus();
    }
  }

  function handleScoreSubmit(event: SubmitEvent): void {
    if (!(event.target instanceof HTMLFormElement) || event.target.id !== 'score-form') return;
    event.preventDefault();
    if (!needsName || state.game?.status !== 'game-over' || finishedAt === null) return;
    const input = event.target.querySelector<HTMLInputElement>('[name="player-name"]');
    if (input === null) return;
    nameDraft = input.value;
    const validation = validatePlayerName(nameDraft);
    if (!validation.valid) {
      nameError = validation.error;
      const error = dialog.querySelector('#player-name-error');
      if (error !== null) error.textContent = nameError;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    refreshLeaderboard();
    needsName = false;
    if (!isQualifyingScore(state.game.score, leaderboard)) {
      scoreMessage = 'This score no longer enters the Top 10.';
    } else {
      leaderboard = addLeaderboardEntry(leaderboard, {
        name: validation.name,
        score: state.game.score,
        createdAt: finishedAt,
      });
      const saved = leaderboardStore.save(leaderboard);
      memoryOnly = !saved;
      scoreMessage = saved
        ? 'Your score was saved.'
        : 'Your score is kept for this visit only. Browser storage is unavailable.';
      storageNotice = saved
        ? ''
        : 'Browser storage is unavailable. Scores are kept for this visit only.';
    }
    nameError = '';
    renderDialog('game-over');
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
      case 'skip-score':
        needsName = false;
        scoreMessage = 'Your score was not saved.';
        renderDialog('game-over');
        break;
      case 'clear-leaderboard':
        openDialog('clear-leaderboard');
        break;
      case 'confirm-clear-leaderboard':
        if (leaderboardStore.clear()) {
          leaderboard = [];
          storageNotice = '';
          memoryOnly = false;
        } else {
          storageNotice = 'Saved scores could not be cleared. Browser storage is unavailable.';
        }
        closeDialog();
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
    const controls = [
      ...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'),
    ];
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
  dialog.addEventListener('submit', handleScoreSubmit);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    clock.dispose();
    container.removeEventListener('click', handleClick);
    dialog.removeEventListener('cancel', handleCancel);
    dialog.removeEventListener('keydown', handleDialogKeydown);
    dialog.removeEventListener('submit', handleScoreSubmit);
    document.removeEventListener('visibilitychange', handleVisibility);
    dismissDialogs();
  };
}
