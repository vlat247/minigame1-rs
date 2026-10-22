import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_SHORTCUTS, resolveGameShortcut } from '../src/logic/game-shortcuts.ts';

function keyEvent(key, overrides = {}) {
  return {
    key,
    repeat: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    isComposing: false,
    defaultPrevented: false,
    ...overrides,
  };
}

function activeContext(overrides = {}) {
  return {
    playing: true,
    paused: false,
    dialogOpen: false,
    editable: false,
    ingredientCount: 6,
    ...overrides,
  };
}

const activeKeys = ['1', '2', '3', '4', '5', '6', 'b', 'o', 'p', 'v'];

test('the explicit action keys resolve without relying on button focus', () => {
  assert.deepEqual(GAME_SHORTCUTS, [
    { key: 'b', action: 'brew' },
    { key: 'o', action: 'pour-out' },
    { key: 'p', action: 'pause' },
    { key: 'v', action: 'toggle-preview' },
  ]);
  for (const [key, action] of [
    ['b', 'brew'],
    ['o', 'pour-out'],
    ['p', 'pause'],
    ['v', 'toggle-preview'],
  ]) {
    assert.deepEqual(resolveGameShortcut(keyEvent(key), activeContext()), { action });
    assert.deepEqual(resolveGameShortcut(keyEvent(key.toUpperCase()), activeContext()), {
      action,
    });
  }
});

test('number shortcuts follow shelf order and stop at each difficulty shelf boundary', () => {
  for (const ingredientCount of [4, 6, 8]) {
    const context = activeContext({ ingredientCount });
    for (let number = 1; number <= 8; number += 1) {
      const result = resolveGameShortcut(keyEvent(String(number)), context);
      assert.deepEqual(
        result,
        number <= ingredientCount ? { action: 'add-ingredient', index: number - 1 } : null,
      );
    }
  }
});

test('invalid or empty shelf counts never produce a stale ingredient index', () => {
  for (const ingredientCount of [0, -1, 0.5, 4.5, 9, NaN, Infinity, -Infinity]) {
    for (const key of ['1', '4', '8']) {
      assert.equal(resolveGameShortcut(keyEvent(key), activeContext({ ingredientCount })), null);
    }
  }
});

test('start, finished, paused and dialog screens leave every game key untouched', () => {
  for (const context of [
    activeContext({ playing: false }),
    activeContext({ paused: true }),
    activeContext({ dialogOpen: true }),
    activeContext({ playing: false, dialogOpen: true }),
    activeContext({ paused: true, dialogOpen: true }),
  ]) {
    for (const key of activeKeys) {
      assert.equal(resolveGameShortcut(keyEvent(key), context), null);
    }
  }
});

test('typing in text inputs or editable content never dispatches a game action', () => {
  for (const key of activeKeys) {
    assert.equal(resolveGameShortcut(keyEvent(key), activeContext({ editable: true })), null);
  }
});

test('held, composing, prevented and modified keys do not spend ingredients or dispatch actions', () => {
  for (const flag of [
    'repeat',
    'isComposing',
    'defaultPrevented',
    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',
  ]) {
    for (const key of activeKeys) {
      assert.equal(resolveGameShortcut(keyEvent(key, { [flag]: true }), activeContext()), null);
    }
  }
});

test('native button, navigation and unrelated browser keys remain available', () => {
  for (const key of [
    'Enter',
    ' ',
    'Space',
    'Spacebar',
    'Tab',
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'F5',
    'Backspace',
    'Delete',
    '0',
    '9',
    '10',
    '01',
    '-1',
    'Digit1',
    'Numpad1',
    'a',
    '',
  ]) {
    assert.equal(resolveGameShortcut(keyEvent(key), activeContext()), null, key);
  }
});

test('resolution is pure for both accepted and rejected keys', () => {
  const event = Object.freeze(keyEvent('3'));
  const context = Object.freeze(activeContext());
  const eventBefore = structuredClone(event);
  const contextBefore = structuredClone(context);
  const first = resolveGameShortcut(event, context);
  assert.deepEqual(first, { action: 'add-ingredient', index: 2 });
  assert.deepEqual(resolveGameShortcut(event, context), first);
  assert.deepEqual(event, eventBefore);
  assert.deepEqual(context, contextBefore);
  assert.equal(resolveGameShortcut(Object.freeze(keyEvent('b', { ctrlKey: true })), context), null);
});
