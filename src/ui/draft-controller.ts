import { dialogMarkup } from './dialogs';
import type { DraftDialog } from './dialogs';
import { renderGameDraft } from './game-draft';

export function mountGameDraft(container: HTMLElement): () => void {
  const view = document.createElement('div');
  const dialog = document.createElement('dialog');
  const announcement = document.createElement('p');
  const state = { started: false, paused: false };
  let dialogs: DraftDialog[] = [];
  let returnAction = 'start';

  dialog.className = 'game-dialog';
  dialog.setAttribute('aria-labelledby', 'draft-dialog-title');
  dialog.setAttribute('aria-describedby', 'draft-dialog-description');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  container.replaceChildren(view, dialog, announcement);

  function render(): void {
    renderGameDraft(view, state);
  }

  function focusAction(action: string): void {
    view.querySelector<HTMLElement>(`[data-action="${action}"]`)?.focus();
  }

  function renderDialog(kind: DraftDialog): void {
    dialog.innerHTML = dialogMarkup(kind);
    dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
  }

  function openDialog(kind: DraftDialog): void {
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

  function startPreview(): void {
    dismissDialogs();
    state.started = true;
    state.paused = false;
    render();
    focusAction('pause');
    announcement.textContent =
      'Medium workbench preview opened. Mixing, brewing, and timing are not active yet.';
  }

  function resumePreview(): void {
    dismissDialogs();
    state.paused = false;
    render();
    focusAction('pause');
    announcement.textContent = 'Preview resumed.';
  }

  function pausePreview(): void {
    if (!state.started || state.paused) return;
    state.paused = true;
    render();
    returnAction = 'pause';
    if (dialog.open) {
      dialogs.unshift('pause');
    } else {
      openDialog('pause');
    }
    announcement.textContent = 'Preview paused.';
  }

  function closeDialog(): void {
    const current = dialogs.at(-1);
    if (current === 'pause') {
      resumePreview();
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
    state.started = false;
    state.paused = false;
    render();
    focusAction('start');
    announcement.textContent = 'Returned to the empty start screen.';
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
        startPreview();
        break;
      case 'help':
      case 'menu':
      case 'leaderboard':
        openDialog(control.dataset.action);
        break;
      case 'new':
        if (state.started) openDialog('restart');
        else startPreview();
        break;
      case 'pause':
        pausePreview();
        break;
      case 'resume':
        resumePreview();
        break;
      case 'home':
        if (state.started) openDialog('exit');
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
    if (document.hidden) pausePreview();
  }

  render();
  container.addEventListener('click', handleClick);
  dialog.addEventListener('cancel', handleCancel);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    container.removeEventListener('click', handleClick);
    dialog.removeEventListener('cancel', handleCancel);
    document.removeEventListener('visibilitychange', handleVisibility);
    dismissDialogs();
  };
}
