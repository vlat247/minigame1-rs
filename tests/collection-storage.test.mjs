import assert from 'node:assert/strict';
import test from 'node:test';
import { createCollection, getAchievements } from '../src/logic/collections.ts';
import { COLLECTION_STORAGE_KEY, createCollectionStore } from '../src/storage/collection.ts';
import { LEADERBOARD_STORAGE_KEY } from '../src/storage/leaderboard.ts';
import { GAME_SAVE_STORAGE_KEY } from '../src/storage/save.ts';

function fakeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    values,
    calls,
    storage: {
      getItem(key) {
        calls.push(['get', key]);
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        calls.push(['set', key, value]);
        values.set(key, value);
      },
    },
  };
}

test('missing collection data loads empty progress without writing anything', () => {
  const fake = fakeStorage();

  assert.equal(COLLECTION_STORAGE_KEY, 'alchemists-cauldron:collection:v1');
  assert.deepEqual(createCollectionStore(() => fake.storage).load(), {
    progress: createCollection(),
    error: null,
  });
  assert.deepEqual(fake.calls, [['get', COLLECTION_STORAGE_KEY]]);
  assert.equal(fake.values.size, 0);
});

test('a fresh store restores saved discoveries and derives all three earned achievements', () => {
  const progress = Object.freeze({
    discoveredRecipeIds: Object.freeze([
      'moon-mist',
      'root-bloom',
      'frost-steam',
      'void-ember',
      'phoenix-pulse',
    ]),
  });
  const original = structuredClone(progress);
  const fake = fakeStorage();

  assert.equal(createCollectionStore(() => fake.storage).save(progress), true);
  assert.deepEqual(JSON.parse(fake.values.get(COLLECTION_STORAGE_KEY)), {
    version: 1,
    discoveredRecipeIds: original.discoveredRecipeIds,
  });

  const restored = createCollectionStore(() => fake.storage).load();
  assert.deepEqual(restored, { progress: original, error: null });
  assert.notStrictEqual(restored.progress, progress);
  assert.notStrictEqual(restored.progress.discoveredRecipeIds, progress.discoveredRecipeIds);
  assert.deepEqual(
    getAchievements(restored.progress).map(({ unlocked }) => unlocked),
    [true, true, true],
  );
  assert.deepEqual(progress, original);
});

test('loading ignores unknown strings and duplicate IDs while preserving discovery order and raw data', () => {
  const raw = JSON.stringify({
    version: 1,
    discoveredRecipeIds: [
      'void-ember',
      'unknown',
      'moon-mist',
      'void-ember',
      '__proto__',
      'phoenix-pulse',
      'constructor',
    ],
    achievements: ['recipe-explorer'],
  });
  const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: raw });

  assert.deepEqual(createCollectionStore(() => fake.storage).load(), {
    progress: { discoveredRecipeIds: ['void-ember', 'moon-mist', 'phoenix-pulse'] },
    error: null,
  });
  assert.equal(fake.values.get(COLLECTION_STORAGE_KEY), raw);
  assert.deepEqual(fake.calls, [['get', COLLECTION_STORAGE_KEY]]);
});

test('unknown-only saved IDs produce an empty valid collection without unlocking achievements', () => {
  const raw = JSON.stringify({ version: 1, discoveredRecipeIds: ['unknown', 'hard', ''] });
  const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: raw });
  const result = createCollectionStore(() => fake.storage).load();

  assert.deepEqual(result, { progress: createCollection(), error: null });
  assert.deepEqual(
    getAchievements(result.progress).map(({ unlocked }) => unlocked),
    [false, false, false],
  );
  assert.deepEqual(fake.calls, [['get', COLLECTION_STORAGE_KEY]]);
});

test('saving normalizes frozen progress and stores only the version and unique known IDs', () => {
  const progress = Object.freeze({
    discoveredRecipeIds: Object.freeze(['void-ember', 'unknown', 'moon-mist', 'void-ember']),
    achievements: Object.freeze(['hard-alchemist']),
  });
  const original = structuredClone(progress);
  const fake = fakeStorage();

  assert.equal(createCollectionStore(() => fake.storage).save(progress), true);
  assert.deepEqual(JSON.parse(fake.values.get(COLLECTION_STORAGE_KEY)), {
    version: 1,
    discoveredRecipeIds: ['void-ember', 'moon-mist'],
  });
  assert.deepEqual(progress, original);
});

test('malformed JSON and invalid schemas are reported as corrupt without modifying stored data', () => {
  for (const raw of [
    '{broken',
    '',
    'null',
    '[]',
    '{}',
    '5',
    '"collection"',
    JSON.stringify({ version: '1', discoveredRecipeIds: [] }),
    JSON.stringify({ discoveredRecipeIds: [] }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, discoveredRecipeIds: null }),
    JSON.stringify({ version: 1, discoveredRecipeIds: 'moon-mist' }),
    JSON.stringify({ version: 1, discoveredRecipeIds: {} }),
    JSON.stringify({ version: 1, discoveredRecipeIds: ['moon-mist', 4] }),
    JSON.stringify({ version: 1, discoveredRecipeIds: [null] }),
    JSON.stringify({ version: 1, discoveredRecipeIds: [{}] }),
  ]) {
    const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: raw });

    assert.deepEqual(
      createCollectionStore(() => fake.storage).load(),
      { progress: createCollection(), error: 'corrupt' },
      raw,
    );
    assert.equal(fake.values.get(COLLECTION_STORAGE_KEY), raw);
    assert.deepEqual(fake.calls, [['get', COLLECTION_STORAGE_KEY]]);
  }
});

test('unsupported numeric versions cannot be overwritten, including saving before any load', () => {
  for (const version of [0, 2, -1, 1.5]) {
    const raw = JSON.stringify({ version, discoveredRecipeIds: ['phoenix-pulse'] });
    const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: raw });
    const store = createCollectionStore(() => fake.storage);

    assert.deepEqual(store.load(), {
      progress: createCollection(),
      error: 'unsupported-version',
    });
    assert.equal(store.save({ discoveredRecipeIds: ['moon-mist'] }), false);
    assert.equal(
      createCollectionStore(() => fake.storage).save({ discoveredRecipeIds: ['root-bloom'] }),
      false,
    );
    assert.equal(fake.values.get(COLLECTION_STORAGE_KEY), raw);
    assert.ok(
      fake.calls.every(([action, key]) => action === 'get' && key === COLLECTION_STORAGE_KEY),
    );
  }
});

test('invalid progress cannot overwrite an existing valid collection', () => {
  const raw = JSON.stringify({ version: 1, discoveredRecipeIds: ['phoenix-pulse'] });
  for (const progress of [
    null,
    undefined,
    [],
    {},
    'moon-mist',
    { discoveredRecipeIds: null },
    { discoveredRecipeIds: 'moon-mist' },
    { discoveredRecipeIds: {} },
    { discoveredRecipeIds: ['moon-mist', 4] },
    { discoveredRecipeIds: [false] },
    { discoveredRecipeIds: [null] },
  ]) {
    const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: raw });

    assert.equal(createCollectionStore(() => fake.storage).save(progress), false);
    assert.equal(fake.values.get(COLLECTION_STORAGE_KEY), raw);
    assert.equal(
      fake.calls.some(([action]) => action === 'set'),
      false,
    );
  }
});

test('valid new progress can replace malformed stored JSON', () => {
  const fake = fakeStorage({ [COLLECTION_STORAGE_KEY]: '{broken' });
  const store = createCollectionStore(() => fake.storage);

  assert.equal(store.save({ discoveredRecipeIds: ['moon-mist'] }), true);
  assert.deepEqual(createCollectionStore(() => fake.storage).load(), {
    progress: { discoveredRecipeIds: ['moon-mist'] },
    error: null,
  });
});

test('stale stores merge their discoveries with existing saved IDs in the original order', () => {
  const fake = fakeStorage();
  const first = createCollectionStore(() => fake.storage);
  const second = createCollectionStore(() => fake.storage);
  const firstInitial = first.load().progress;
  const secondInitial = second.load().progress;
  assert.deepEqual(firstInitial, createCollection());
  assert.deepEqual(secondInitial, createCollection());

  assert.equal(first.save({ discoveredRecipeIds: ['moon-mist'] }), true);
  assert.equal(second.save({ discoveredRecipeIds: ['root-bloom', 'moon-mist'] }), true);
  assert.equal(first.save({ discoveredRecipeIds: ['moon-mist', 'phoenix-pulse'] }), true);

  assert.deepEqual(second.load(), {
    progress: { discoveredRecipeIds: ['moon-mist', 'root-bloom', 'phoenix-pulse'] },
    error: null,
  });
  assert.equal(first.save(createCollection()), true);
  assert.deepEqual(first.load().progress.discoveredRecipeIds, [
    'moon-mist',
    'root-bloom',
    'phoenix-pulse',
  ]);
});

test('saving after an initial read failure merges recovered valid progress instead of erasing it', () => {
  const fake = fakeStorage({
    [COLLECTION_STORAGE_KEY]: JSON.stringify({
      version: 1,
      discoveredRecipeIds: ['phoenix-pulse', 'moon-mist', 'unknown', 'moon-mist'],
    }),
  });
  let failRead = true;
  const store = createCollectionStore(() => ({
    ...fake.storage,
    getItem(key) {
      if (failRead) {
        failRead = false;
        throw new Error('A temporary read failure');
      }
      return fake.storage.getItem(key);
    },
  }));

  assert.deepEqual(store.load(), { progress: createCollection(), error: 'unavailable' });
  assert.equal(store.save({ discoveredRecipeIds: ['root-bloom'] }), true);
  assert.deepEqual(store.load(), {
    progress: { discoveredRecipeIds: ['phoenix-pulse', 'moon-mist', 'root-bloom'] },
    error: null,
  });
});

test('an inaccessible storage provider is nonfatal for loading and saving', () => {
  const store = createCollectionStore(() => {
    throw new Error('Storage is blocked');
  });

  assert.deepEqual(store.load(), { progress: createCollection(), error: 'unavailable' });
  assert.equal(store.save({ discoveredRecipeIds: ['moon-mist'] }), false);
});

test('a read failure reports unavailable and prevents a save from overwriting unreadable data', () => {
  let writes = 0;
  const store = createCollectionStore(() => ({
    getItem() {
      throw new Error('Read failed');
    },
    setItem() {
      writes += 1;
    },
  }));

  assert.deepEqual(store.load(), { progress: createCollection(), error: 'unavailable' });
  assert.equal(store.save({ discoveredRecipeIds: ['moon-mist'] }), false);
  assert.equal(writes, 0);
});

test('a failed write returns false and leaves previously saved progress readable', () => {
  const raw = JSON.stringify({ version: 1, discoveredRecipeIds: ['moon-mist'] });
  const store = createCollectionStore(() => ({
    getItem: () => raw,
    setItem() {
      throw new Error('Write failed');
    },
  }));

  assert.equal(store.save({ discoveredRecipeIds: ['root-bloom'] }), false);
  assert.deepEqual(store.load(), {
    progress: { discoveredRecipeIds: ['moon-mist'] },
    error: null,
  });
});

test('collection operations touch only their own key and preserve saves and all leaderboards', () => {
  const unrelated = {
    [GAME_SAVE_STORAGE_KEY]: 'unfinished game',
    [LEADERBOARD_STORAGE_KEY]: 'Medium leaderboard',
    'alchemists-cauldron:leaderboard:easy:v1': 'Easy leaderboard',
    'alchemists-cauldron:leaderboard:hard:v1': 'Hard leaderboard',
  };
  const fake = fakeStorage(unrelated);
  const store = createCollectionStore(() => fake.storage);

  assert.deepEqual(store.load(), { progress: createCollection(), error: null });
  assert.equal(store.save({ discoveredRecipeIds: ['moon-mist'] }), true);
  assert.deepEqual(store.load(), {
    progress: { discoveredRecipeIds: ['moon-mist'] },
    error: null,
  });
  for (const [key, value] of Object.entries(unrelated)) {
    assert.equal(fake.values.get(key), value);
  }
  assert.ok(fake.calls.every(([, key]) => key === COLLECTION_STORAGE_KEY));
});
