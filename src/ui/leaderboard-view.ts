import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import type { Difficulty } from '../data/difficulty.ts';
import type { LeaderboardEntry } from '../logic/leaderboard';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value: string): string {
  const date = new Date(value);
  const pad = (part: number): string => String(part).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function leaderboardMarkup(
  entries: readonly LeaderboardEntry[],
  notice: string,
  difficulty: Difficulty = 'medium',
): string {
  const difficultyLabel = DIFFICULTY_SETTINGS[difficulty].label;

  return `
    <div class="difficulty-options" role="group" aria-label="Leaderboard difficulty">
      ${DIFFICULTIES.map((option) => `<button class="button button-secondary" type="button" data-action="leaderboard-difficulty" data-difficulty="${option}" aria-pressed="${option === difficulty}">${DIFFICULTY_SETTINGS[option].label}</button>`).join('')}
    </div>
    ${
      entries.length === 0
        ? '<div class="leaderboard-empty"><h3>No results yet</h3><p>Finish a game to record your score.</p></div>'
        : `
      <div class="leaderboard-table-wrap"><table class="leaderboard-table">
        <caption class="sr-only">Top 10 completed ${difficultyLabel} games</caption>
        <thead><tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Score</th><th scope="col">Difficulty</th><th scope="col">Date</th></tr></thead>
        <tbody>${entries.map((entry, index) => `<tr><td>${index + 1}</td><th scope="row">${escapeHtml(entry.name)}</th><td>${entry.score}</td><td>${difficultyLabel}</td><td><time datetime="${escapeHtml(entry.createdAt)}">${formatDate(entry.createdAt)}</time></td></tr>`).join('')}</tbody>
      </table></div>`
    }
    ${notice === '' ? '' : `<p class="dialog-note" role="status">${escapeHtml(notice)}</p>`}
    <div class="dialog-actions"><button class="button button-secondary" type="button" data-action="clear-leaderboard" ${entries.length === 0 ? 'disabled' : ''}>Clear Leaderboard</button><button class="button button-primary" type="button" data-action="dialog-close" data-dialog-focus>Back</button></div>`;
}
