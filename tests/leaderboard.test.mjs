import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEADERBOARD_LIMIT,
  addLeaderboardEntry,
  isQualifyingScore,
  validatePlayerName,
} from '../src/logic/leaderboard.ts';
import { LEADERBOARD_STORAGE_KEY, createLeaderboardStore } from '../src/storage/leaderboard.ts';

function entry(name = 'Alchemist', score = 200, createdAt = '2026-10-19T10:00:00.000Z') {
  return { name, score, createdAt };
}

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
      removeItem(key) {
        calls.push(['remove', key]);
        values.delete(key);
      },
    },
  };
}

test('names are trimmed, NFC-normalized and accept letters, decimal digits, spaces, _ and -', () => {
  for (const name of ['Al', 'A'.repeat(15), 'Жанар 27', 'Алиса', 'A_b-9', '玩家 １２']) {
    assert.deepEqual(validatePlayerName(name), { valid: true, name });
  }
  assert.deepEqual(validatePlayerName('  E\u0301va  '), { valid: true, name: 'Éva' });
  assert.deepEqual(validatePlayerName('  Ada Lovelace  '), { valid: true, name: 'Ada Lovelace' });
});

test('name length counts Unicode code points and rejects empty, short and overlong names', () => {
  const astralLetter = '\u{10400}';
  const fifteenLetters = astralLetter.repeat(15);
  assert.deepEqual(validatePlayerName(fifteenLetters), { valid: true, name: fifteenLetters });
  for (const name of ['', ' ', 'A', ' A ', 'A'.repeat(16), astralLetter.repeat(16)]) {
    const result = validatePlayerName(name);
    assert.equal(result.valid, false, JSON.stringify(name));
    assert.ok(result.error);
  }
});

test('names reject HTML, punctuation, internal control whitespace, emoji and non-digit numbers', () => {
  for (const name of ['<b>Ada</b>', 'A.B', 'A/B', "O'Neil", 'A\tB', 'A\nB', 'A\rB', 'A😀', 'A½']) {
    assert.equal(validatePlayerName(name).valid, false, JSON.stringify(name));
  }
});

test('ranking sorts descending, uses the earlier timestamp for ties and preserves stable exact ties', () => {
  const newest = entry('Newest', 400, '2026-10-19T10:02:00.000Z');
  const earlier = entry('Earlier', 400, '2026-10-19T10:00:00.000Z');
  const sameTime = entry('Same time', 400, earlier.createdAt);
  const highest = entry('Highest', 800);
  const original = Object.freeze([
    Object.freeze(newest),
    Object.freeze(highest),
    Object.freeze(earlier),
  ]);
  const result = addLeaderboardEntry(original, sameTime);
  assert.deepEqual(result, [highest, earlier, sameTime, newest]);
  assert.deepEqual(original, [newest, highest, earlier]);
  assert.notEqual(result, original);
});

test('ranking retains only ten results and does not displace earlier equal scores at the cutoff', () => {
  const original = Array.from({ length: 10 }, (_, index) => entry(`Player${index}`, 200));
  const tied = entry('New result', 200);
  assert.equal(LEADERBOARD_LIMIT, 10);
  assert.deepEqual(addLeaderboardEntry(original, tied), original);
  const highest = entry('Winner', 400);
  assert.deepEqual(addLeaderboardEntry(original, highest), [highest, ...original.slice(0, 9)]);
});

test('qualification accepts vacancies including zero, sorts unsorted input and requires a strictly higher cutoff score', () => {
  assert.equal(isQualifyingScore(0, []), true);
  assert.equal(
    isQualifyingScore(
      0,
      Array.from({ length: 9 }, () => entry()),
    ),
    true,
  );
  const full = Array.from({ length: 12 }, (_, index) => entry(`Player${index}`, index * 200));
  assert.equal(isQualifyingScore(400, full), false);
  assert.equal(isQualifyingScore(600, full), true);
  for (const score of [-1, 0.5, NaN, Infinity, -Infinity]) {
    assert.equal(isQualifyingScore(score, []), false);
  }
});

test('missing storage data loads an empty board without writing or removing anything', () => {
  const fake = fakeStorage();
  const store = createLeaderboardStore(() => fake.storage);
  assert.deepEqual(store.load(), { entries: [], error: null });
  assert.deepEqual(fake.calls, [['get', LEADERBOARD_STORAGE_KEY]]);
});

test('loading normalizes valid records and dates, sorts, limits, and leaves stored data untouched', () => {
  const input = [
    entry('  E\u0301va  ', 600, '2026-10-19T15:00:00+05:00'),
    ...Array.from({ length: 12 }, (_, index) => entry(`Player${index}`, index * 200)),
    entry('Leap year', 800, '2024-02-29T12:00:00Z'),
  ];
  const raw = JSON.stringify(input);
  const fake = fakeStorage({ [LEADERBOARD_STORAGE_KEY]: raw });
  const result = createLeaderboardStore(() => fake.storage).load();
  assert.equal(result.error, null);
  assert.equal(result.entries.length, 10);
  assert.equal(result.entries[0].score, 2200);
  assert.deepEqual(
    result.entries.find(({ name }) => name === 'Éva'),
    entry('Éva', 600),
  );
  assert.ok(result.entries.some(({ name }) => name === 'Leap year'));
  assert.equal(fake.values.get(LEADERBOARD_STORAGE_KEY), raw);
  assert.deepEqual(fake.calls, [['get', LEADERBOARD_STORAGE_KEY]]);
});

test('malformed JSON and non-array data return corrupt errors without destructive repair', () => {
  for (const raw of ['{broken', '', 'null', '{}', '5', '"board"']) {
    const fake = fakeStorage({ [LEADERBOARD_STORAGE_KEY]: raw });
    const store = createLeaderboardStore(() => fake.storage);
    assert.deepEqual(store.load(), { entries: [], error: 'corrupt' });
    assert.equal(fake.values.get(LEADERBOARD_STORAGE_KEY), raw);
    assert.deepEqual(fake.calls, [['get', LEADERBOARD_STORAGE_KEY]]);
  }
});

test('invalid stored records are rejected while valid rows survive with a corrupt warning', () => {
  const valid = entry('Valid');
  const bad = [
    null,
    [],
    {},
    entry('A'),
    entry('<script>'),
    { ...valid, name: 42 },
    { ...valid, score: '200' },
    { ...valid, score: -1 },
    { ...valid, score: 1.5 },
    { ...valid, score: null },
    { ...valid, createdAt: 42 },
    { ...valid, createdAt: '2026-10-19' },
    { ...valid, createdAt: 'not a date' },
    { ...valid, createdAt: '2026-02-30T12:00:00.000Z' },
    { ...valid, createdAt: '2026-13-01T12:00:00.000Z' },
    { ...valid, createdAt: '2026-10-19T25:00:00.000Z' },
  ];
  const raw = JSON.stringify([valid, ...bad]);
  const fake = fakeStorage({ [LEADERBOARD_STORAGE_KEY]: raw });
  assert.deepEqual(createLeaderboardStore(() => fake.storage).load(), {
    entries: [valid],
    error: 'corrupt',
  });
  assert.equal(fake.values.get(LEADERBOARD_STORAGE_KEY), raw);
});

test('saving validates and normalizes records and writes a sorted Top-10 array', () => {
  const fake = fakeStorage();
  const store = createLeaderboardStore(() => fake.storage);
  const entries = Object.freeze(
    Array.from({ length: 12 }, (_, index) => Object.freeze(entry(` Player${index} `, index * 200))),
  );
  assert.equal(store.save(entries), true);
  const saved = JSON.parse(fake.values.get(LEADERBOARD_STORAGE_KEY));
  assert.equal(saved.length, 10);
  assert.deepEqual(
    saved.map(({ score }) => score),
    [2200, 2000, 1800, 1600, 1400, 1200, 1000, 800, 600, 400],
  );
  assert.equal(saved[0].name, 'Player11');
  assert.equal(entries[0].name, ' Player0 ');
  assert.deepEqual(store.load(), { entries: saved, error: null });
});

test('invalid save input never overwrites existing results or throws', () => {
  const original = JSON.stringify([entry()]);
  const fake = fakeStorage({ [LEADERBOARD_STORAGE_KEY]: original });
  const store = createLeaderboardStore(() => fake.storage);
  for (const entries of [
    null,
    {},
    [entry('A')],
    [entry('Valid', NaN)],
    [entry('Valid', Infinity)],
  ]) {
    assert.equal(store.save(entries), false);
    assert.equal(fake.values.get(LEADERBOARD_STORAGE_KEY), original);
  }
  const throwingEntry = {
    get name() {
      throw new Error('Bad getter');
    },
  };
  assert.equal(store.save([throwingEntry]), false);
  assert.deepEqual(fake.calls, []);
});

test('a throwing storage provider or blocked storage methods never escape the store', () => {
  const unavailable = createLeaderboardStore(() => {
    throw new Error('Storage unavailable');
  });
  assert.deepEqual(unavailable.load(), { entries: [], error: 'unavailable' });
  assert.equal(unavailable.save([entry()]), false);
  assert.equal(unavailable.clear(), false);

  const blocked = createLeaderboardStore(() => ({
    getItem() {
      throw new Error('Blocked read');
    },
    setItem() {
      throw new Error('Quota exceeded');
    },
    removeItem() {
      throw new Error('Blocked delete');
    },
  }));
  assert.deepEqual(blocked.load(), { entries: [], error: 'unavailable' });
  assert.equal(blocked.save([entry()]), false);
  assert.equal(blocked.clear(), false);
});

test('clearing removes only the leaderboard key and succeeds when already empty', () => {
  const fake = fakeStorage({
    [LEADERBOARD_STORAGE_KEY]: JSON.stringify([entry()]),
    'unrelated-game-save': 'keep this',
  });
  const store = createLeaderboardStore(() => fake.storage);
  assert.equal(store.clear(), true);
  assert.equal(fake.values.has(LEADERBOARD_STORAGE_KEY), false);
  assert.equal(fake.values.get('unrelated-game-save'), 'keep this');
  assert.equal(store.clear(), true);
  assert.deepEqual(fake.calls, [
    ['remove', LEADERBOARD_STORAGE_KEY],
    ['remove', LEADERBOARD_STORAGE_KEY],
  ]);
});
