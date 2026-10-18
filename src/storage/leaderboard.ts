import { addLeaderboardEntry, validatePlayerName } from '../logic/leaderboard.ts';
import type { LeaderboardEntry } from '../logic/leaderboard.ts';

export const LEADERBOARD_STORAGE_KEY = 'alchemists-cauldron:leaderboard:v1';

type LeaderboardStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface LeaderboardLoadResult {
  readonly entries: readonly LeaderboardEntry[];
  readonly error: 'unavailable' | 'corrupt' | null;
}

export interface LeaderboardStore {
  load: () => LeaderboardLoadResult;
  save: (entries: readonly LeaderboardEntry[]) => boolean;
  clear: () => boolean;
}

function normalizeEntry(value: unknown): LeaderboardEntry | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.name !== 'string' ||
    typeof record.score !== 'number' ||
    !Number.isInteger(record.score) ||
    record.score < 0 ||
    typeof record.createdAt !== 'string'
  ) {
    return null;
  }

  const name = validatePlayerName(record.name);
  if (!name.valid) return null;
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u.test(
      record.createdAt,
    )
  ) {
    return null;
  }

  const timestamp = Date.parse(record.createdAt);
  if (!Number.isFinite(timestamp)) return null;
  const calendarDate = record.createdAt.slice(0, 10);
  // Date.parse rolls impossible dates such as February 30 into the next month.
  if (new Date(`${calendarDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== calendarDate) {
    return null;
  }

  return { name: name.name, score: record.score, createdAt: new Date(timestamp).toISOString() };
}

function normalizeEntries(value: unknown): LeaderboardLoadResult {
  if (!Array.isArray(value)) return { entries: [], error: 'corrupt' };

  let entries: readonly LeaderboardEntry[] = [];
  let corrupt = false;
  for (const candidate of value) {
    const entry = normalizeEntry(candidate);
    if (entry === null) corrupt = true;
    else entries = addLeaderboardEntry(entries, entry);
  }

  return { entries, error: corrupt ? 'corrupt' : null };
}

export function createLeaderboardStore(
  getStorage: () => LeaderboardStorage = () => window.localStorage,
): LeaderboardStore {
  return {
    load(): LeaderboardLoadResult {
      let raw: string | null;
      try {
        raw = getStorage().getItem(LEADERBOARD_STORAGE_KEY);
      } catch {
        return { entries: [], error: 'unavailable' };
      }

      if (raw === null) return { entries: [], error: null };
      try {
        const parsed: unknown = JSON.parse(raw);
        return normalizeEntries(parsed);
      } catch {
        return { entries: [], error: 'corrupt' };
      }
    },

    save(entries): boolean {
      try {
        const normalized = normalizeEntries(entries);
        if (normalized.error !== null) return false;
        getStorage().setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(normalized.entries));
        return true;
      } catch {
        return false;
      }
    },

    clear(): boolean {
      try {
        getStorage().removeItem(LEADERBOARD_STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    },
  };
}
