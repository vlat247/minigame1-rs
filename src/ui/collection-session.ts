import type { BrewFeedback } from '../logic/brewing.ts';
import { discoverRecipe, getAchievements } from '../logic/collections.ts';
import type { CollectionProgress } from '../logic/collections.ts';
import { createCollectionStore } from '../storage/collection.ts';
import type { CollectionLoadResult, CollectionStore } from '../storage/collection.ts';

export interface CollectionSnapshot {
  readonly progress: CollectionProgress;
  readonly notice: string;
}

export interface CollectionSession {
  getSnapshot: () => CollectionSnapshot;
  recordBrew: (feedback: BrewFeedback) => string | null;
}

const SAVED_NOTICE = 'Discoveries are saved in this browser on this device.';
const UNSAVED_NOTICE =
  'Progress could not be saved in this browser. New discoveries are kept for this visit only.';
const UNSUPPORTED_NOTICE =
  'This browser has collection data from an unsupported version. That save is preserved; new discoveries are kept for this visit only.';

function initialNotice(error: CollectionLoadResult['error']): string {
  switch (error) {
    case 'unavailable':
      return 'Saved collection progress is unavailable. New discoveries are kept for this visit unless saving becomes available.';
    case 'corrupt':
      return 'Saved collection data could not be read. New discoveries start a fresh collection; saving will replace the unreadable data.';
    case 'unsupported-version':
      return UNSUPPORTED_NOTICE;
    case null:
      return SAVED_NOTICE;
  }
}

function saveNotice(error: CollectionLoadResult['error'], saved: boolean): string {
  if (saved) {
    return error === 'unsupported-version'
      ? `${SAVED_NOTICE} Collection data found at startup used an unsupported version and could not be loaded.`
      : SAVED_NOTICE;
  }
  return error === 'unsupported-version' ? UNSUPPORTED_NOTICE : UNSAVED_NOTICE;
}

function mergeProgress(
  existing: CollectionProgress,
  incoming: CollectionProgress,
): CollectionProgress {
  return incoming.discoveredRecipeIds.reduce(
    (current, recipeId) => discoverRecipe(current, recipeId),
    existing,
  );
}

/** Keep collection progress separate from individual runs and announce only new discoveries. */
export function createCollectionSession(
  store: CollectionStore = createCollectionStore(),
): CollectionSession {
  const loaded = store.load();
  let progress = loaded.progress;
  let notice = initialNotice(loaded.error);

  return {
    getSnapshot: () => ({ progress, notice }),

    recordBrew(feedback): string | null {
      if (!feedback.success) return null;

      const recipeId = feedback.recipe.id;
      if (discoverRecipe(progress, recipeId) === progress) return null;

      // Recover discoveries saved before a failed read or by another browser tab.
      const latest = store.load();
      let previous = latest.error === null ? mergeProgress(latest.progress, progress) : progress;
      const updated = discoverRecipe(previous, recipeId);
      if (updated === previous) {
        progress = previous;
        if (latest.error === null) {
          const hasPendingDiscoveries = progress.discoveredRecipeIds.some(
            (id) => !latest.progress.discoveredRecipeIds.includes(id),
          );
          if (hasPendingDiscoveries) {
            const saved = store.save(progress);
            if (saved) {
              const restored = store.load();
              if (restored.error === null) {
                progress = mergeProgress(restored.progress, progress);
              }
            }
            notice = saveNotice(loaded.error, saved);
          } else {
            notice = SAVED_NOTICE;
          }
        }
        return null;
      }

      progress = updated;
      const saved = store.save(progress);
      if (saved) {
        const restored = store.load();
        if (restored.error === null) {
          progress = mergeProgress(restored.progress, progress);
          // Recovered recipes already earned their badges before this brew.
          previous = mergeProgress(previous, {
            discoveredRecipeIds: restored.progress.discoveredRecipeIds.filter(
              (id) => id !== recipeId,
            ),
          });
        }
      }
      notice = saveNotice(
        latest.error === 'unsupported-version' ? latest.error : loaded.error,
        saved,
      );

      const previousAchievements = getAchievements(previous);
      const newlyUnlocked = getAchievements(progress).filter(
        (achievement) =>
          achievement.unlocked &&
          !previousAchievements.some(
            (previousAchievement) =>
              previousAchievement.id === achievement.id && previousAchievement.unlocked,
          ),
      );

      const messages = [`Recipe discovered: ${feedback.recipe.name}.`];
      if (newlyUnlocked.length > 0) {
        const label = newlyUnlocked.length === 1 ? 'Achievement unlocked' : 'Achievements unlocked';
        messages.push(`${label}: ${newlyUnlocked.map(({ name }) => name).join(', ')}.`);
      }
      if (!saved) messages.push(notice);
      return messages.join(' ');
    },
  };
}
