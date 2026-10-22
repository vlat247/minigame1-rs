export interface ShortcutKey {
  readonly key: string;
  readonly repeat: boolean;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly isComposing: boolean;
  readonly defaultPrevented: boolean;
}

export interface ShortcutContext {
  readonly playing: boolean;
  readonly paused: boolean;
  readonly dialogOpen: boolean;
  readonly editable: boolean;
  readonly ingredientCount: number;
}

export const GAME_SHORTCUTS = [
  { key: 'b', action: 'brew' },
  { key: 'o', action: 'pour-out' },
  { key: 'p', action: 'pause' },
  { key: 'v', action: 'toggle-preview' },
] as const;

export type GameShortcut =
  | { readonly action: 'add-ingredient'; readonly index: number }
  | { readonly action: (typeof GAME_SHORTCUTS)[number]['action'] };

/** Resolve plain active-game keys without consuming native button or browser navigation keys. */
export function resolveGameShortcut(
  event: ShortcutKey,
  context: ShortcutContext,
): GameShortcut | null {
  if (
    !context.playing ||
    context.paused ||
    context.dialogOpen ||
    context.editable ||
    event.repeat ||
    event.isComposing ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return null;
  }

  if (/^[1-8]$/u.test(event.key)) {
    const index = Number(event.key) - 1;
    return Number.isInteger(context.ingredientCount) &&
      context.ingredientCount <= 8 &&
      index < context.ingredientCount
      ? { action: 'add-ingredient', index }
      : null;
  }

  const shortcut = GAME_SHORTCUTS.find(({ key }) => key === event.key.toLowerCase());
  return shortcut === undefined ? null : { action: shortcut.action };
}
