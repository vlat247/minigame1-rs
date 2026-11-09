export interface LeaderboardEntry {
  readonly name: string;
  readonly score: number;
  readonly createdAt: string;
}

export const LEADERBOARD_LIMIT = 10;

export type PlayerNameValidation =
  | { readonly valid: true; readonly name: string }
  | { readonly valid: false; readonly error: string };

export function validatePlayerName(raw: string): PlayerNameValidation {
  const name = raw.trim().normalize('NFC');
  const length = [...name].length;

  if (length < 2 || length > 15) {
    return { valid: false, error: 'Use 2–15 characters for your name.' };
  }

  if (!/^[\p{L}\p{Nd} _-]+$/u.test(name)) {
    return { valid: false, error: 'Use letters, digits, spaces, _ or - only.' };
  }

  return { valid: true, name };
}

function rankEntries(entries: readonly LeaderboardEntry[]): readonly LeaderboardEntry[] {
  return [...entries]
    .sort(
      (first, second) =>
        second.score - first.score || Date.parse(first.createdAt) - Date.parse(second.createdAt),
    )
    .slice(0, LEADERBOARD_LIMIT);
}

export function isQualifyingScore(score: number, entries: readonly LeaderboardEntry[]): boolean {
  if (!Number.isInteger(score) || score < 0) return false;

  const lowest = rankEntries(entries)[LEADERBOARD_LIMIT - 1];
  return lowest === undefined || score > lowest.score;
}

export function addLeaderboardEntry(
  entries: readonly LeaderboardEntry[],
  entry: LeaderboardEntry,
): readonly LeaderboardEntry[] {
  return rankEntries([...entries, entry]);
}
