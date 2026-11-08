import assert from 'node:assert/strict';
import test from 'node:test';
import { RECIPES } from '../src/data/recipes.ts';
import { createCollection } from '../src/logic/collections.ts';
import { collectionMarkup } from '../src/ui/collection-view.ts';

test('the empty collection shows all locked slots, exactly three achievements, and discovery help', () => {
  const markup = collectionMarkup(createCollection(), '');

  assert.match(markup, /<strong>0 \/ 20<\/strong> recipes discovered/);
  assert.equal((markup.match(/data-recipe-id=/g) ?? []).length, 20);
  assert.equal((markup.match(/Undiscovered recipe/g) ?? []).length, 20);
  assert.equal((markup.match(/data-achievement-id=/g) ?? []).length, 3);
  assert.equal((markup.match(/data-unlocked="false"/g) ?? []).length, 3);
  assert.match(markup, /Your first successful brew will reveal a recipe here/);
  assert.match(markup, /0 \/ 6 discovered/);
  assert.equal((markup.match(/0 \/ 7 discovered/g) ?? []).length, 2);
  for (const recipe of RECIPES) {
    assert.equal(markup.includes(`<h4>${recipe.name}</h4>`), false);
  }
  assert.equal(markup.includes('data-dialog-focus'), false);
});

test('collection counts and recipe details use distinct canonical IDs across all difficulties', () => {
  const progress = Object.freeze({
    discoveredRecipeIds: Object.freeze([
      'moon-mist',
      'void-ember',
      'moon-mist',
      'phoenix-pulse',
      'unknown',
    ]),
  });
  const original = structuredClone(progress);
  const markup = collectionMarkup(progress, '');

  assert.match(markup, /<strong>3 \/ 20<\/strong> recipes discovered/);
  assert.equal((markup.match(/data-discovered="true"/g) ?? []).length, 3);
  assert.equal((markup.match(/Undiscovered recipe/g) ?? []).length, 17);
  assert.match(markup, /<h4>Moon Mist<\/h4>/);
  assert.match(markup, /<h4>Void Ember<\/h4>/);
  assert.match(markup, /<h4>Phoenix Pulse<\/h4>/);
  assert.match(markup, /<dd>32 to 42<\/dd>/);
  assert.match(markup, /<dd>12 to 22<\/dd>/);
  assert.match(markup, /<dd>17 to 27<\/dd>/);
  assert.match(markup, /1 \/ 6 discovered/);
  assert.equal((markup.match(/1 \/ 7 discovered/g) ?? []).length, 2);
  assert.equal((markup.match(/data-unlocked="true"/g) ?? []).length, 2);
  assert.deepEqual(progress, original);
});

test('a complete collection shows every recipe, all ranges, and all three unlocked achievements', () => {
  const markup = collectionMarkup({ discoveredRecipeIds: RECIPES.map(({ id }) => id) }, '');

  assert.match(markup, /<strong>20 \/ 20<\/strong> recipes discovered/);
  assert.equal((markup.match(/data-discovered="true"/g) ?? []).length, 20);
  assert.equal((markup.match(/class="collection-ranges"/g) ?? []).length, 20);
  assert.equal((markup.match(/data-unlocked="true"/g) ?? []).length, 3);
  assert.equal(markup.includes('Undiscovered recipe'), false);
  assert.match(markup, /<dd>−28 to −18<\/dd>/);
  assert.match(markup, /6 \/ 6 discovered/);
  assert.equal((markup.match(/7 \/ 7 discovered/g) ?? []).length, 2);
});

test('storage notices render as escaped text without adding interactive markup', () => {
  const notice = '<img src=x onerror="alert(1)"> & progress';
  const markup = collectionMarkup(createCollection(), notice);

  assert.match(markup, /class="collection-notice" role="status"/);
  assert.ok(markup.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; progress'));
  assert.equal(markup.includes('<img'), false);
  assert.equal((markup.match(/<button /g) ?? []).length, 1);
});
