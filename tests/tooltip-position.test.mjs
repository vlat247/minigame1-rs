import assert from 'node:assert/strict';
import test from 'node:test';
import { positionIngredientTooltip } from '../src/logic/tooltip-position.ts';

test('a card with room to its right keeps its tooltip alongside the card', () => {
  assert.deepEqual(
    positionIngredientTooltip(
      { left: 20, right: 200, top: 100, bottom: 180 },
      { width: 180, height: 96 },
      { width: 1024, height: 768 },
    ),
    { left: 208, top: 100, opensLeft: false, opensUp: false },
  );
});

test('a right-edge card opens its tooltip on the left without crossing the viewport', () => {
  const position = positionIngredientTooltip(
    { left: 800, right: 1008, top: 100, bottom: 180 },
    { width: 180, height: 96 },
    { width: 1024, height: 768 },
  );
  assert.deepEqual(position, { left: 612, top: 100, opensLeft: true, opensUp: false });
  assert.ok(position.left + 180 < 800);
});

test('a bottom-edge card opens upward and can flip both axes at the same time', () => {
  assert.deepEqual(
    positionIngredientTooltip(
      { left: 800, right: 1008, top: 700, bottom: 756 },
      { width: 180, height: 96 },
      { width: 1024, height: 768 },
    ),
    { left: 612, top: 596, opensLeft: true, opensUp: true },
  );
});

test('the two shelf columns fit tooltips inside a 375px phone viewport', () => {
  const size = { width: 160, height: 96 };
  const viewport = { width: 375, height: 667 };
  const left = positionIngredientTooltip(
    { left: 12, right: 180, top: 420, bottom: 500 },
    size,
    viewport,
  );
  const right = positionIngredientTooltip(
    { left: 190, right: 363, top: 420, bottom: 500 },
    size,
    viewport,
  );
  assert.equal(left.opensLeft, false);
  assert.equal(right.opensLeft, true);
  for (const position of [left, right]) {
    assert.ok(position.left >= 8);
    assert.ok(position.left + size.width <= viewport.width - 8);
    assert.ok(position.top >= 8);
    assert.ok(position.top + size.height <= viewport.height - 8);
  }
});

test('a 200px tooltip falls below narrow phone cards without covering the hovered card', () => {
  const size = { width: 200, height: 96 };
  const viewport = { width: 375, height: 667 };
  for (const anchor of [
    { left: 12, right: 180, top: 400, bottom: 480 },
    { left: 190, right: 363, top: 400, bottom: 480 },
  ]) {
    const position = positionIngredientTooltip(anchor, size, viewport);
    assert.equal(position.opensUp, false);
    assert.ok(position.top >= anchor.bottom + 8);
    assert.ok(position.left >= 8);
    assert.ok(position.left + size.width <= viewport.width - 8);
    assert.ok(position.top + size.height <= viewport.height - 8);
  }
});

test('a phone tooltip uses the space above a bottom-row card when neither side fits', () => {
  const size = { width: 220, height: 96 };
  const anchor = { left: 190, right: 363, top: 550, bottom: 640 };
  const position = positionIngredientTooltip(anchor, size, { width: 375, height: 667 });
  assert.equal(position.opensUp, true);
  assert.ok(position.top + size.height <= anchor.top - 8);
  assert.ok(position.left >= 8);
  assert.ok(position.left + size.width <= 367);
});

test('wide cards and cards partly outside the viewport clamp the tooltip to visible space', () => {
  const viewport = { width: 375, height: 300 };
  const size = { width: 220, height: 96 };
  for (const anchor of [
    { left: 8, right: 367, top: 100, bottom: 160 },
    { left: -100, right: -20, top: -50, bottom: 20 },
    { left: 360, right: 500, top: 290, bottom: 350 },
  ]) {
    const position = positionIngredientTooltip(anchor, size, viewport);
    assert.ok(position.left >= 8);
    assert.ok(position.left + size.width <= viewport.width - 8);
    assert.ok(position.top >= 8);
    assert.ok(position.top + size.height <= viewport.height - 8);
  }
});

test('positioning respects the available viewport exactly at the right and bottom boundaries', () => {
  const size = { width: 160, height: 96 };
  const viewport = { width: 375, height: 667 };
  const atBoundary = positionIngredientTooltip(
    { left: 0, right: 199, top: 563, bottom: 640 },
    size,
    viewport,
  );
  assert.equal(atBoundary.opensLeft, false);
  assert.equal(atBoundary.opensUp, false);
  const pastBoundary = positionIngredientTooltip(
    { left: 0, right: 199.5, top: 563.5, bottom: 640 },
    size,
    viewport,
  );
  assert.equal(pastBoundary.opensLeft, true);
  assert.equal(pastBoundary.opensUp, true);
});

test('a resized viewport recalculates placement without changing its input rectangles', () => {
  const anchor = Object.freeze({ left: 180, right: 360, top: 400, bottom: 480 });
  const size = Object.freeze({ width: 180, height: 96 });
  const desktop = positionIngredientTooltip(anchor, size, { width: 1024, height: 768 });
  const phone = positionIngredientTooltip(anchor, size, { width: 375, height: 460 });
  assert.deepEqual(desktop, { left: 368, top: 400, opensLeft: false, opensUp: false });
  assert.deepEqual(phone, { left: 180, top: 296, opensLeft: true, opensUp: true });
  assert.deepEqual(anchor, { left: 180, right: 360, top: 400, bottom: 480 });
});
