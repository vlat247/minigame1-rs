import { getIngredient } from '../data/ingredients';
import { projectIngredient } from '../logic/ingredient-preview';
import { DIFFICULTY_SETTINGS, isDifficulty } from '../data/difficulty';
import type { Difficulty } from '../data/difficulty';
import { brewGame } from '../logic/brewing';
import { addIngredient } from '../logic/ingredients';
import { addLeaderboardEntry, isQualifyingScore, validatePlayerName } from '../logic/leaderboard';
import type { LeaderboardEntry } from '../logic/leaderboard';
import { advanceGameTime } from '../logic/session';
import { createGame } from '../state/game';
import { createLeaderboardStore } from '../storage/leaderboard';
import { createGameSaveStore } from '../storage/save';
import type { SavedGame } from '../storage/save';
import { dialogMarkup } from './dialogs';
import type { GameDialog } from './dialogs';
import {
  renderGameView,
  updateGameView,
  updateIngredientPreview,
  updateSessionView,
} from './game-view';
import type { GameViewState } from './game-view';
import { createSessionClock } from './session-clock';
import '../styles/ingredient-preview.css';

export function mountGame(container: HTMLElement): () => void {
  const view = document.createElement('div');
  const dialog = document.createElement('dialog');
  const announcement = document.createElement('p');
  const gameSaveStore = createGameSaveStore();
  const initialSave = gameSaveStore.load();
  let savedGame: SavedGame | null = initialSave.save;
  let state: GameViewState = {
    game: null,
    paused: false,
    lastBrew: null,
    selectedDifficulty: savedGame?.game.difficulty ?? 'medium',
    canContinue: savedGame !== null,
    previewMode: false,
    previewIngredient: null,
    saveNotice:
      initialSave.error === 'unavailable'
        ? 'Game saving is unavailable. Progress may be lost when you leave this page.'
        : initialSave.error === 'corrupt'
          ? 'The saved game could not be read. You can start a new game.'
          : '',
  };
  let dialogs: GameDialog[] = [];
  let returnAction = 'start';
  const leaderboardStores = {
    easy: createLeaderboardStore(undefined, 'easy'),
    medium: createLeaderboardStore(undefined, 'medium'),
    hard: createLeaderboardStore(undefined, 'hard'),
  };
  const cachedBoards: Record<Difficulty, readonly LeaderboardEntry[]> = {
    easy: [],
    medium: [],
    hard: [],
  };
  let leaderboardDifficulty: Difficulty = state.selectedDifficulty;
  let leaderboard: readonly LeaderboardEntry[] = [];
  let storageNotice = '';
  let scoreMessage = '';
  let nameDraft = '';
  let nameError = '';
  let needsName = false;
  let finishedAt: string | null = null;
  let finishHandled = false;
  let warnedAboutTime = false;
  const memoryOnlyBoards = new Set<Difficulty>();
  let lastSavedSecond: number | null = null;
  let previewSource: 'pointer' | 'focus' | 'selection' | null = null;
  let lastInputWasPointer = false;
  let suppressFocusPreview = false;

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
    else persistGame(false);
  });

  function persistGame(force = true): void {
    if (state.game === null || state.game.status !== 'playing') return;
    const second = Math.ceil(state.game.timeRemaining);
    if (!force && second === lastSavedSecond) return;
    lastSavedSecond = second;
    const saved = gameSaveStore.save(state.game, state.paused);
    savedGame = { game: state.game, paused: state.paused };
    state = {
      ...state,
      canContinue: true,
      saveNotice: saved
        ? ''
        : 'Game saving is unavailable. Progress may be lost when you leave this page.',
    };
    updateSessionView(view, state);
  }

  function clearSavedGame(): void {
    const cleared = gameSaveStore.clear();
    savedGame = null;
    lastSavedSecond = null;
    state = {
      ...state,
      canContinue: false,
      saveNotice: cleared
        ? ''
        : 'The saved game could not be cleared. Browser storage is unavailable.',
    };
  }

  function refreshLeaderboard(difficulty: Difficulty = leaderboardDifficulty): void {
    leaderboardDifficulty = difficulty;
    leaderboard = cachedBoards[difficulty];
    if (memoryOnlyBoards.has(difficulty)) {
      storageNotice = 'Browser storage is unavailable. Scores are kept for this visit only.';
      return;
    }
    const result = leaderboardStores[difficulty].load();
    if (result.error !== 'unavailable') {
      leaderboard = result.entries;
      cachedBoards[difficulty] = leaderboard;
    }
    storageNotice =
      result.error === 'unavailable'
        ? 'Browser storage is unavailable. Scores are kept for this visit only.'
        : result.error === 'corrupt'
          ? 'Some stored scores could not be read.'
          : '';
    if (result.error === 'unavailable') memoryOnlyBoards.add(difficulty);
  }

  function finishGame(): void {
    if (state.game?.status !== 'game-over' || finishHandled) return;
    finishHandled = true;
    clearIngredientPreview(true);
    clock.stop();
    clearSavedGame();
    finishedAt = new Date().toISOString();
    refreshLeaderboard(state.game.difficulty);
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

  function clearIngredientPreview(resetMode = false): void {
    previewSource = null;
    if (state.previewIngredient === null && (!resetMode || !state.previewMode)) return;
    state = {
      ...state,
      previewIngredient: null,
      previewMode: resetMode ? false : state.previewMode,
    };
    updateIngredientPreview(view, state);
  }

  function showIngredientPreview(
    id: string | undefined,
    source: NonNullable<typeof previewSource>,
  ): void {
    if (id === undefined || dialog.open) return;
    const projection = projectIngredient(state.game, id, state.paused);
    if (projection === null) {
      clearIngredientPreview();
      return;
    }
    previewSource = source;
    state = { ...state, previewIngredient: projection.ingredient.id };
    updateIngredientPreview(view, state);
  }

  function focusAvailableIngredient(): void {
    suppressFocusPreview = true;
    view
      .querySelector<HTMLButtonElement>('.ingredient:not(:disabled)')
      ?.focus({ preventScroll: true });
    suppressFocusPreview = false;
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
      selectedDifficulty: state.selectedDifficulty,
      leaderboardDifficulty,
      canContinue: state.canContinue,
      saveNotice: state.saveNotice,
    });
    dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
  }

  function openDialog(kind: GameDialog): void {
    clearIngredientPreview();
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
    state = {
      ...state,
      game: createGame(Math.random, state.selectedDifficulty),
      paused: false,
      lastBrew: null,
      previewMode: false,
      previewIngredient: null,
    };
    persistGame();
    render();
    focusAction('pause');
    const settings = DIFFICULTY_SETTINGS[state.selectedDifficulty];
    announcement.textContent = `${settings.label} game started. Current recipe: ${state.game?.recipe.name}. You have ${settings.startingTime} seconds and ${settings.lives} lives.`;
    clock.start();
    if (document.hidden) pauseGame();
  }

  function continueGame(): void {
    if (state.game?.status === 'playing') return;
    const loaded = gameSaveStore.load();
    savedGame = loaded.save;
    if (savedGame === null) {
      state = {
        ...state,
        canContinue: false,
        saveNotice:
          loaded.error === 'unavailable'
            ? 'The saved game is unavailable. You can start a new game.'
            : 'There is no valid unfinished game to continue.',
      };
      dismissDialogs();
      render();
      focusAction('start');
      return;
    }
    clock.stop();
    dismissDialogs();
    finishHandled = false;
    warnedAboutTime = savedGame.game.timeRemaining < 15;
    needsName = false;
    finishedAt = null;
    nameDraft = '';
    nameError = '';
    scoreMessage = '';
    state = {
      ...state,
      game: savedGame.game,
      paused: true,
      lastBrew: null,
      selectedDifficulty: savedGame.game.difficulty,
      canContinue: true,
      saveNotice: '',
      previewMode: false,
      previewIngredient: null,
    };
    persistGame();
    render();
    openDialog('pause');
    announcement.textContent = 'Saved game restored paused. Choose Resume when you are ready.';
  }

  function resumeGame(): void {
    if (state.game?.status !== 'playing') return;
    dismissDialogs();
    state = { ...state, paused: false };
    persistGame();
    render();
    focusAction('pause');
    announcement.textContent = 'Workbench resumed.';
    clock.start();
  }

  function pauseGame(): void {
    if (state.game === null || state.game.status !== 'playing' || state.paused) return;
    clock.pause();
    if (state.game.status !== 'playing') return;
    clearIngredientPreview();
    state = { ...state, paused: true };
    persistGame();
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
    if (state.game !== null) clearSavedGame();
    clearIngredientPreview(true);
    state = { ...state, game: null, paused: false, lastBrew: null };
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
    if (state.previewMode) {
      showIngredientPreview(id, 'selection');
      return;
    }
    clearIngredientPreview();
    const result = addIngredient(state.game.mixing, id, state.game.difficulty);
    const ingredient = getIngredient(id);
    if (ingredient === undefined) return;
    const feedback = view.querySelector('#ingredient-feedback');
    if (!result.accepted) {
      if (result.reason !== 'cauldron-full' && result.reason !== 'out-of-stock') return;
      if (feedback !== null) {
        feedback.classList.add('is-error');
        feedback.textContent =
          result.reason === 'cauldron-full'
            ? `Cauldron full (${DIFFICULTY_SETTINGS[state.game.difficulty].maxIngredients}/${DIFFICULTY_SETTINGS[state.game.difficulty].maxIngredients}). Brew to continue.`
            : `${ingredient.name} is out of stock.`;
      }
      return;
    }

    state = { ...state, game: { ...state.game, mixing: result.state }, lastBrew: null };
    persistGame();
    // Update existing controls and gauges so keyboard focus and CSS transitions survive.
    updateGameView(view, state);
    if (feedback !== null) {
      feedback.classList.remove('is-error');
      const totals = result.state.totals;
      feedback.textContent = `${ingredient.name} added. Temperature ${totals.temperature}, Density ${totals.density}, Magic Power ${totals.magicPower}.`;
    }
    if (result.state.inventory[ingredient.id] === 0) {
      focusAvailableIngredient();
    }
  }

  function brewPotion(): void {
    clock.synchronize();
    if (state.game === null || state.paused || dialog.open) return;
    const result = brewGame(state.game);
    if (!result.accepted) return;

    clearIngredientPreview();
    state = { ...state, game: result.state, lastBrew: result.feedback };
    updateGameView(view, state);
    const outcome = result.feedback;
    announcement.textContent = outcome.success
      ? `${outcome.recipe.name} brewed. ${outcome.scoreDelta} points earned; total score ${result.state.score}. Next recipe: ${result.state.recipe.name}.`
      : `${outcome.recipe.name} failed. One life lost; ${result.state.lives} lives remain. The recipe stays the same.`;
    const feedback = view.querySelector('#ingredient-feedback');
    if (feedback !== null) {
      feedback.textContent = '';
      feedback.classList.remove('is-error');
    }
    if (result.state.status === 'game-over') {
      finishGame();
    } else {
      persistGame();
      focusAvailableIngredient();
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
    refreshLeaderboard(state.game.difficulty);
    needsName = false;
    if (!isQualifyingScore(state.game.score, leaderboard)) {
      scoreMessage = 'This score no longer enters the Top 10.';
    } else {
      leaderboard = addLeaderboardEntry(leaderboard, {
        name: validation.name,
        score: state.game.score,
        createdAt: finishedAt,
      });
      cachedBoards[leaderboardDifficulty] = leaderboard;
      const saved = leaderboardStores[leaderboardDifficulty].save(leaderboard);
      if (saved) memoryOnlyBoards.delete(leaderboardDifficulty);
      else memoryOnlyBoards.add(leaderboardDifficulty);
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
      case 'continue':
        continueGame();
        break;
      case 'select-difficulty': {
        const difficulty = control.dataset.difficulty;
        if (
          difficulty === undefined ||
          !isDifficulty(difficulty) ||
          state.game?.status === 'playing'
        )
          return;
        state = { ...state, selectedDifficulty: difficulty };
        render();
        renderDialog('menu');
        break;
      }
      case 'leaderboard-difficulty': {
        const difficulty = control.dataset.difficulty;
        if (difficulty === undefined || !isDifficulty(difficulty)) return;
        refreshLeaderboard(difficulty);
        renderDialog('leaderboard');
        dialog.querySelector<HTMLElement>(`[data-difficulty="${difficulty}"]`)?.focus();
        break;
      }
      case 'add-ingredient':
        addPortion(control.dataset.ingredient);
        break;
      case 'toggle-preview':
        if (state.game?.status !== 'playing' || state.paused || dialog.open) return;
        clearIngredientPreview();
        state = { ...state, previewMode: !state.previewMode };
        updateIngredientPreview(view, state);
        announcement.textContent = state.previewMode
          ? 'Preview on. Tap an ingredient to preview. Switch Preview off to add.'
          : 'Preview off. Ingredients add normally.';
        break;
      case 'brew':
        brewPotion();
        break;
      case 'help':
      case 'menu':
        openDialog(control.dataset.action);
        break;
      case 'leaderboard':
        refreshLeaderboard(state.game?.difficulty ?? state.selectedDifficulty);
        openDialog('leaderboard');
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
        if (leaderboardStores[leaderboardDifficulty].clear()) {
          leaderboard = [];
          cachedBoards[leaderboardDifficulty] = [];
          storageNotice = '';
          memoryOnlyBoards.delete(leaderboardDifficulty);
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

  function ingredientButton(target: EventTarget | null): HTMLButtonElement | null {
    if (!(target instanceof Element)) return null;
    const button = target.closest<HTMLButtonElement>('[data-action="add-ingredient"]');
    return button !== null && view.contains(button) ? button : null;
  }

  function handlePointerOver(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const button = ingredientButton(event.target);
    if (button === null || button === ingredientButton(event.relatedTarget)) return;
    showIngredientPreview(button.dataset.ingredient, 'pointer');
  }

  function handlePointerOut(event: PointerEvent): void {
    if (
      event.pointerType === 'touch' ||
      (previewSource !== 'pointer' && previewSource !== 'selection')
    )
      return;
    const button = ingredientButton(event.target);
    if (button !== null && button !== ingredientButton(event.relatedTarget))
      clearIngredientPreview();
  }

  function handlePointerDown(event: PointerEvent): void {
    lastInputWasPointer = true;
    if (ingredientButton(event.target) === null) clearIngredientPreview();
  }

  function handleFocusIn(event: FocusEvent): void {
    if (lastInputWasPointer || suppressFocusPreview) return;
    const button = ingredientButton(event.target);
    if (button !== null) showIngredientPreview(button.dataset.ingredient, 'focus');
  }

  function handleFocusOut(event: FocusEvent): void {
    if (previewSource !== 'focus' && previewSource !== 'selection') return;
    const button = ingredientButton(event.target);
    if (button !== null && button !== ingredientButton(event.relatedTarget))
      clearIngredientPreview();
  }

  function handlePreviewKeydown(event: KeyboardEvent): void {
    lastInputWasPointer = false;
    if (
      event.key === 'Escape' &&
      !dialog.open &&
      (state.previewIngredient !== null || state.previewMode)
    ) {
      event.preventDefault();
      clearIngredientPreview(true);
      announcement.textContent = 'Preview closed. Ingredients add normally.';
    }
  }

  function handleVisibility(): void {
    if (document.hidden) pauseGame();
  }

  function handlePageHide(): void {
    if (state.game?.status === 'playing' && !state.paused) pauseGame();
    else persistGame();
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
  container.addEventListener('pointerover', handlePointerOver);
  container.addEventListener('pointerout', handlePointerOut);
  container.addEventListener('pointerdown', handlePointerDown);
  container.addEventListener('focusin', handleFocusIn);
  container.addEventListener('focusout', handleFocusOut);
  container.addEventListener('keydown', handlePreviewKeydown);
  dialog.addEventListener('cancel', handleCancel);
  dialog.addEventListener('keydown', handleDialogKeydown);
  dialog.addEventListener('submit', handleScoreSubmit);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', handlePageHide);

  return () => {
    clock.synchronize();
    persistGame();
    clock.dispose();
    container.removeEventListener('click', handleClick);
    container.removeEventListener('pointerover', handlePointerOver);
    container.removeEventListener('pointerout', handlePointerOut);
    container.removeEventListener('pointerdown', handlePointerDown);
    container.removeEventListener('focusin', handleFocusIn);
    container.removeEventListener('focusout', handleFocusOut);
    container.removeEventListener('keydown', handlePreviewKeydown);
    dialog.removeEventListener('cancel', handleCancel);
    dialog.removeEventListener('keydown', handleDialogKeydown);
    dialog.removeEventListener('submit', handleScoreSubmit);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', handlePageHide);
    dismissDialogs();
  };
}
