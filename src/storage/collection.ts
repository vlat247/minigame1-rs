import { createCollection, discoverRecipe } from '../logic/collections.ts';
import type { CollectionProgress } from '../logic/collections.ts';

export const COLLECTION_STORAGE_KEY = 'alchemists-cauldron:collection:v1';
const COLLECTION_VERSION = 1;

type CollectionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface CollectionLoadResult {
  readonly progress: CollectionProgress;
  readonly error: 'unavailable' | 'corrupt' | 'unsupported-version' | null;
}

export interface CollectionStore {
  load: () => CollectionLoadResult;
  save: (progress: CollectionProgress) => boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasUnsupportedVersion(value: unknown): boolean {
  return (
    isRecord(value) && typeof value.version === 'number' && value.version !== COLLECTION_VERSION
  );
}

function normalizeProgress(value: unknown): CollectionProgress | null {
  if (!isRecord(value) || !Array.isArray(value.discoveredRecipeIds)) return null;

  let progress = createCollection();
  for (const recipeId of value.discoveredRecipeIds) {
    if (typeof recipeId !== 'string') return null;
    progress = discoverRecipe(progress, recipeId);
  }
  return progress;
}

function parseCollection(raw: string | null): CollectionLoadResult {
  if (raw === null) return { progress: createCollection(), error: null };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (hasUnsupportedVersion(parsed)) {
      return { progress: createCollection(), error: 'unsupported-version' };
    }
    if (isRecord(parsed) && parsed.version === COLLECTION_VERSION) {
      const progress = normalizeProgress(parsed);
      if (progress !== null) return { progress, error: null };
    }
  } catch {
    // Unreadable data stays in storage; loading never changes saved progress.
  }
  return { progress: createCollection(), error: 'corrupt' };
}

export function createCollectionStore(
  getStorage: () => CollectionStorage = () => window.localStorage,
): CollectionStore {
  return {
    load(): CollectionLoadResult {
      let raw: string | null;
      try {
        raw = getStorage().getItem(COLLECTION_STORAGE_KEY);
      } catch {
        return { progress: createCollection(), error: 'unavailable' };
      }

      return parseCollection(raw);
    },

    save(progress): boolean {
      try {
        const normalized = normalizeProgress(progress);
        if (normalized === null) return false;

        const storage = getStorage();
        const existing = parseCollection(storage.getItem(COLLECTION_STORAGE_KEY));
        if (existing.error === 'unsupported-version') return false;

        // A stale tab or a recovered read must never remove earlier discoveries.
        const merged = normalized.discoveredRecipeIds.reduce(
          (current, recipeId) => discoverRecipe(current, recipeId),
          existing.progress,
        );

        storage.setItem(
          COLLECTION_STORAGE_KEY,
          JSON.stringify({
            version: COLLECTION_VERSION,
            discoveredRecipeIds: merged.discoveredRecipeIds,
          }),
        );
        return true;
      } catch {
        return false;
      }
    },
  };
}
