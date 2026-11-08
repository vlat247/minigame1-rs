import assert from 'node:assert/strict';
import test from 'node:test';
import { INGREDIENT_IDS } from '../src/data/ingredients.ts';
import { RECIPES } from '../src/data/recipes.ts';
import { brewGame } from '../src/logic/brewing.ts';
import { createCollection } from '../src/logic/collections.ts';
import { addIngredient } from '../src/logic/ingredients.ts';
import { createGame } from '../src/state/game.ts';
import { COLLECTION_STORAGE_KEY, createCollectionStore } from '../src/storage/collection.ts';
import { createCollectionSession } from '../src/ui/collection-session.ts';

function recipeById(id) {
  const recipe = RECIPES.find((candidate) => candidate.id === id);
  assert.ok(recipe, `Recipe ${id} exists`);
  return recipe;
}

function feedbackFor(recipeId, success = true) {
  return {
    recipe: recipeById(recipeId),
    success,
    checks: { temperature: success, density: success, magicPower: success },
    totals: { temperature: 0, density: 0, magicPower: 0 },
    scoreDelta: success ? 200 : 0,
    timeDelta: success ? 10 : 0,
    livesDelta: success ? 0 : -1,
  };
}

function fakeStore({ progress = createCollection(), error = null, saves = [true] } = {}) {
  let loads = 0;
  const writes = [];
  return {
    get loads() {
      return loads;
    },
    writes,
    store: {
      load() {
        loads += 1;
        return { progress, error };
      },
      save(updated) {
        writes.push(structuredClone(updated));
        return saves[Math.min(writes.length - 1, saves.length - 1)];
      },
    },
  };
}

test('a session loads saved progress once without rewriting or announcing old discoveries', () => {
  const progress = Object.freeze({
    discoveredRecipeIds: Object.freeze(['moon-mist', 'phoenix-pulse']),
  });
  const fake = fakeStore({ progress });
  const session = createCollectionSession(fake.store);

  assert.equal(session.getSnapshot().progress, progress);
  assert.match(session.getSnapshot().notice, /saved in this browser on this device/i);
  assert.equal(session.recordBrew(feedbackFor('phoenix-pulse')), null);
  assert.deepEqual(fake.writes, []);
  assert.equal(fake.loads, 1);
});

test('failed brews and unknown recipes cannot change progress, unlock badges, or write storage', () => {
  const fake = fakeStore();
  const session = createCollectionSession(fake.store);
  const original = session.getSnapshot();
  const unknown = feedbackFor('moon-mist');
  unknown.recipe = { ...unknown.recipe, id: 'unknown' };

  assert.equal(session.recordBrew(feedbackFor('moon-mist', false)), null);
  assert.equal(session.recordBrew(unknown), null);
  assert.deepEqual(session.getSnapshot(), original);
  assert.equal(session.getSnapshot().progress, original.progress);
  assert.deepEqual(fake.writes, []);
});

test('a new discovery saves immediately and repeated successful brews stay silent', () => {
  const fake = fakeStore();
  const session = createCollectionSession(fake.store);

  assert.equal(
    session.recordBrew(feedbackFor('moon-mist')),
    'Recipe discovered: Moon Mist. Achievement unlocked: First Potion.',
  );
  assert.deepEqual(fake.writes, [{ discoveredRecipeIds: ['moon-mist'] }]);
  assert.equal(session.recordBrew(feedbackFor('moon-mist')), null);
  assert.deepEqual(fake.writes, [{ discoveredRecipeIds: ['moon-mist'] }]);

  assert.equal(session.recordBrew(feedbackFor('root-bloom')), 'Recipe discovered: Root Bloom.');
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist', 'root-bloom']);
  assert.equal(fake.loads, 5);
});

test('the first Hard discovery announces both earned achievements once', () => {
  const fake = fakeStore();
  const session = createCollectionSession(fake.store);

  assert.equal(
    session.recordBrew(feedbackFor('phoenix-pulse')),
    'Recipe discovered: Phoenix Pulse. Achievements unlocked: First Potion, Hard Alchemist.',
  );
  assert.equal(session.recordBrew(feedbackFor('phoenix-pulse')), null);
  assert.equal(fake.writes.length, 1);
});

test('a fifth distinct recipe can unlock Recipe Explorer and Hard Alchemist together', () => {
  const fake = fakeStore({
    progress: {
      discoveredRecipeIds: ['moon-mist', 'root-bloom', 'frost-steam', 'void-ember'],
    },
  });
  const session = createCollectionSession(fake.store);

  assert.equal(
    session.recordBrew(feedbackFor('phoenix-pulse')),
    'Recipe discovered: Phoenix Pulse. Achievements unlocked: Recipe Explorer, Hard Alchemist.',
  );
  assert.equal(fake.writes[0].discoveredRecipeIds.length, 5);
});

test('a successful final stocked brew discovers the checked recipe even after a new one is drawn', () => {
  let game = createGame(() => 0);
  for (const ingredient of ['dragon-tears', 'caustic-acid']) {
    const addition = addIngredient(game.mixing, ingredient, game.difficulty);
    assert.equal(addition.accepted, true);
    game = { ...game, mixing: addition.state };
  }
  game = {
    ...game,
    mixing: {
      ...game.mixing,
      inventory: Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0])),
    },
  };
  const result = brewGame(game, () => 1 - Number.EPSILON);
  assert.equal(result.accepted, true);
  assert.equal(result.feedback.success, true);
  assert.equal(result.state.status, 'game-over');
  assert.equal(result.state.endReason, 'out-of-ingredients');
  assert.notEqual(result.state.recipe.id, result.feedback.recipe.id);

  const fake = fakeStore();
  const session = createCollectionSession(fake.store);
  assert.match(session.recordBrew(result.feedback), /Recipe discovered: Acid Spark\./);
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['acid-spark']);
  assert.deepEqual(fake.writes, [{ discoveredRecipeIds: ['acid-spark'] }]);
});

test('each load error produces a truthful visible storage notice without writing on load', () => {
  const expected = {
    unavailable: /unavailable.*this visit unless saving becomes available/i,
    corrupt: /could not be read.*fresh collection.*replace the unreadable data/i,
    'unsupported-version': /unsupported version.*save is preserved.*this visit only/i,
  };
  for (const [error, pattern] of Object.entries(expected)) {
    const fake = fakeStore({ error });
    const session = createCollectionSession(fake.store);

    assert.match(session.getSnapshot().notice, pattern);
    assert.deepEqual(session.getSnapshot().progress, createCollection());
    assert.deepEqual(fake.writes, []);
  }
});

test('a failed save retains discoveries in memory and a later successful save includes them all', () => {
  const fake = fakeStore({ saves: [false, true] });
  const session = createCollectionSession(fake.store);
  const firstMessage = session.recordBrew(feedbackFor('moon-mist'));

  assert.match(firstMessage, /First Potion/);
  assert.match(firstMessage, /could not be saved.*this visit only/i);
  assert.match(session.getSnapshot().notice, /could not be saved.*this visit only/i);
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist']);
  assert.equal(session.recordBrew(feedbackFor('moon-mist')), null);
  assert.equal(fake.writes.length, 1);

  assert.equal(session.recordBrew(feedbackFor('root-bloom')), 'Recipe discovered: Root Bloom.');
  assert.deepEqual(fake.writes, [
    { discoveredRecipeIds: ['moon-mist'] },
    { discoveredRecipeIds: ['moon-mist', 'root-bloom'] },
  ]);
  assert.match(session.getSnapshot().notice, /saved in this browser on this device/i);
});

test('successful saving replaces an unavailable or corrupt initial storage notice', () => {
  for (const error of ['unavailable', 'corrupt']) {
    const fake = fakeStore({ error });
    const session = createCollectionSession(fake.store);

    assert.match(session.recordBrew(feedbackFor('moon-mist')), /Recipe discovered: Moon Mist/);
    assert.match(session.getSnapshot().notice, /saved in this browser on this device/i);
  }
});

test('an unsupported save remains explained when new discoveries cannot be persisted', () => {
  const fake = fakeStore({ error: 'unsupported-version', saves: [false] });
  const session = createCollectionSession(fake.store);
  const message = session.recordBrew(feedbackFor('moon-mist'));

  assert.match(message, /Recipe discovered: Moon Mist/);
  assert.match(message, /unsupported version.*save is preserved.*this visit only/i);
  assert.match(session.getSnapshot().notice, /unsupported version.*save is preserved/i);
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist']);
});

test('two stale sessions save distinct discoveries without erasing or reannouncing prior progress', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const first = createCollectionSession(createCollectionStore(() => storage));
  const second = createCollectionSession(createCollectionStore(() => storage));

  assert.match(first.recordBrew(feedbackFor('moon-mist')), /First Potion/);
  assert.equal(second.recordBrew(feedbackFor('root-bloom')), 'Recipe discovered: Root Bloom.');
  assert.deepEqual(second.getSnapshot().progress.discoveredRecipeIds, ['moon-mist', 'root-bloom']);
  assert.equal(
    first.recordBrew(feedbackFor('phoenix-pulse')),
    'Recipe discovered: Phoenix Pulse. Achievement unlocked: Hard Alchemist.',
  );
  const expected = ['moon-mist', 'root-bloom', 'phoenix-pulse'];
  assert.deepEqual(first.getSnapshot().progress.discoveredRecipeIds, expected);
  assert.deepEqual(JSON.parse(values.get(COLLECTION_STORAGE_KEY)).discoveredRecipeIds, expected);
});

test('read recovery keeps saved discoveries in the session and announces only a newly earned threshold', () => {
  const oldIds = ['moon-mist', 'root-bloom', 'frost-steam', 'phoenix-pulse'];
  let raw = JSON.stringify({ version: 1, discoveredRecipeIds: oldIds });
  let reads = 0;
  const storage = {
    getItem() {
      reads += 1;
      if (reads <= 2) throw new Error('Initial and pre-save reads temporarily failed');
      return raw;
    },
    setItem(_key, value) {
      raw = value;
    },
  };
  const session = createCollectionSession(createCollectionStore(() => storage));
  assert.match(session.getSnapshot().notice, /unavailable/i);
  assert.deepEqual(session.getSnapshot().progress, createCollection());

  assert.equal(
    session.recordBrew(feedbackFor('void-ember')),
    'Recipe discovered: Void Ember. Achievement unlocked: Recipe Explorer.',
  );
  const expected = [...oldIds, 'void-ember'];
  assert.deepEqual(JSON.parse(raw).discoveredRecipeIds, expected);
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, expected);
  assert.match(session.getSnapshot().notice, /saved in this browser/i);
});

test('a failed read after a successful save retains the just-recorded discovery in memory', () => {
  let reads = 0;
  const writes = [];
  const store = {
    load() {
      reads += 1;
      return { progress: createCollection(), error: reads === 3 ? 'unavailable' : null };
    },
    save(progress) {
      writes.push(structuredClone(progress));
      return true;
    },
  };
  const session = createCollectionSession(store);

  assert.equal(
    session.recordBrew(feedbackFor('moon-mist')),
    'Recipe discovered: Moon Mist. Achievement unlocked: First Potion.',
  );
  assert.deepEqual(writes, [{ discoveredRecipeIds: ['moon-mist'] }]);
  assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist']);
});

test('a recipe discovered in another session is synchronized silently without another write', () => {
  for (const initiallyBlocked of [false, true]) {
    let raw = null;
    let writes = 0;
    const session = createCollectionSession(
      createCollectionStore(() => ({
        getItem() {
          if (initiallyBlocked && raw === null) throw new Error('Read temporarily blocked');
          return raw;
        },
        setItem(_key, value) {
          writes += 1;
          raw = value;
        },
      })),
    );
    raw = JSON.stringify({ version: 1, discoveredRecipeIds: ['moon-mist'] });

    assert.equal(session.recordBrew(feedbackFor('moon-mist')), null);
    assert.equal(writes, 0);
    assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist']);
    assert.match(session.getSnapshot().notice, /saved in this browser/i);
  }
});

for (const flushSucceeds of [true, false]) {
  test(`synchronizing another tab's recipe ${flushSucceeds ? 'persists pending discoveries' : 'keeps a warning when pending discoveries cannot be saved'}`, () => {
    const values = new Map();
    let allowWrites = false;
    let writes = 0;
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem(key, value) {
        writes += 1;
        if (!allowWrites) throw new Error('Temporary write failure');
        values.set(key, value);
      },
    };
    const session = createCollectionSession(createCollectionStore(() => storage));

    assert.match(session.recordBrew(feedbackFor('moon-mist')), /could not be saved/i);
    assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, ['moon-mist']);

    const otherTab = createCollectionStore(() => ({
      getItem: storage.getItem,
      setItem: (key, value) => values.set(key, value),
    }));
    assert.equal(otherTab.save({ discoveredRecipeIds: ['root-bloom'] }), true);
    allowWrites = flushSucceeds;

    assert.equal(session.recordBrew(feedbackFor('root-bloom')), null);
    assert.equal(writes, 2);
    assert.deepEqual(session.getSnapshot().progress.discoveredRecipeIds, [
      'root-bloom',
      'moon-mist',
    ]);
    assert.match(
      session.getSnapshot().notice,
      flushSucceeds ? /saved in this browser/i : /could not be saved.*this visit only/i,
    );
    assert.deepEqual(
      createCollectionSession(otherTab).getSnapshot().progress.discoveredRecipeIds,
      flushSucceeds ? ['root-bloom', 'moon-mist'] : ['root-bloom'],
    );
  });
}
