import { DIFFICULTY_SETTINGS, isDifficulty } from '../data/difficulty.ts';
import { getShelfIngredients, INGREDIENT_IDS, isIngredientId } from '../data/ingredients.ts';
import type { IngredientId } from '../data/ingredients.ts';
import { RECIPES } from '../data/recipes.ts';
import type { Recipe, RecipeRange } from '../data/recipes.ts';
import { evaluateReactions } from '../logic/reactions.ts';
import type { IngredientInventory } from '../logic/ingredients.ts';
import type { GameState } from '../state/game.ts';

export const GAME_SAVE_STORAGE_KEY = 'alchemists-cauldron:game-save:v1';
const GAME_SAVE_VERSION = 1;

type GameSaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface SavedGame {
  readonly game: GameState;
  readonly paused: boolean;
}

export interface GameSaveLoadResult {
  readonly save: SavedGame | null;
  readonly error: 'unavailable' | 'corrupt' | null;
}

export interface GameSaveStore {
  load: () => GameSaveLoadResult;
  save: (game: GameState, paused: boolean) => boolean;
  clear: () => boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function matchesRange(value: unknown, range: RecipeRange): boolean {
  return isRecord(value) && value.min === range.min && value.max === range.max;
}

function findCanonicalRecipe(value: unknown): Recipe | null {
  if (!isRecord(value)) return null;
  const recipe = RECIPES.find((candidate) => candidate.id === value.id);
  if (
    recipe === undefined ||
    value.name !== recipe.name ||
    value.difficulty !== recipe.difficulty ||
    !matchesRange(value.temperature, recipe.temperature) ||
    !matchesRange(value.density, recipe.density) ||
    !matchesRange(value.magicPower, recipe.magicPower)
  ) {
    return null;
  }
  return recipe;
}

function normalizeSave(value: unknown): SavedGame | null {
  if (
    !isRecord(value) ||
    value.version !== GAME_SAVE_VERSION ||
    typeof value.difficulty !== 'string' ||
    !isDifficulty(value.difficulty)
  ) {
    return null;
  }

  const difficulty = value.difficulty;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const recipe = findCanonicalRecipe(value.activeRecipe);
  if (
    recipe === null ||
    recipe.difficulty !== difficulty ||
    typeof value.score !== 'number' ||
    !Number.isSafeInteger(value.score) ||
    value.score < 0 ||
    value.score % settings.scorePerBrew !== 0 ||
    typeof value.timeLeft !== 'number' ||
    !Number.isFinite(value.timeLeft) ||
    value.timeLeft <= 0 ||
    value.timeLeft > settings.startingTime ||
    typeof value.lives !== 'number' ||
    !Number.isInteger(value.lives) ||
    value.lives < 1 ||
    value.lives > settings.lives ||
    typeof value.elapsedTime !== 'number' ||
    !Number.isFinite(value.elapsedTime) ||
    value.elapsedTime < 0 ||
    (value.status !== 'playing' && value.status !== 'paused') ||
    !isRecord(value.shelfStock) ||
    Object.keys(value.shelfStock).length !== INGREDIENT_IDS.length ||
    !Array.isArray(value.cauldronIngredients) ||
    value.cauldronIngredients.length > settings.maxIngredients
  ) {
    return null;
  }

  const permittedIds = new Set(getShelfIngredients(difficulty).map(({ id }) => id));
  const inventory = {} as Record<IngredientId, number>;
  for (const id of INGREDIENT_IDS) {
    const stock = value.shelfStock[id];
    if (
      typeof stock !== 'number' ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 15 ||
      (!permittedIds.has(id) && stock !== 0)
    ) {
      return null;
    }
    inventory[id] = stock;
  }

  const mixture: IngredientId[] = [];
  for (const id of value.cauldronIngredients) {
    if (typeof id !== 'string' || !isIngredientId(id) || !permittedIds.has(id)) return null;
    mixture.push(id);
  }
  if (mixture.length === 0 && INGREDIENT_IDS.every((id) => inventory[id] === 0)) return null;
  const evaluation = evaluateReactions(mixture, difficulty);
  // An exploding mixture cannot remain in an unfinished run after its addition resolves.
  if (evaluation.activeReactions.some((reaction) => reaction.clearsCauldron)) return null;

  return {
    game: {
      difficulty,
      mixing: { inventory, mixture, totals: evaluation.totals },
      recipe,
      score: value.score,
      lives: value.lives,
      timeRemaining: value.timeLeft,
      elapsedTime: value.elapsedTime,
      status: 'playing',
      endReason: null,
    },
    paused: value.status === 'paused',
  };
}

function serializeSave(game: GameState, paused: boolean) {
  return {
    version: GAME_SAVE_VERSION,
    difficulty: game.difficulty,
    score: game.score,
    timeLeft: game.timeRemaining,
    lives: game.lives,
    activeRecipe: game.recipe,
    cauldronIngredients: [...game.mixing.mixture],
    shelfStock: { ...game.mixing.inventory } satisfies IngredientInventory,
    status: paused ? 'paused' : 'playing',
    elapsedTime: game.elapsedTime,
  };
}

export function createGameSaveStore(
  getStorage: () => GameSaveStorage = () => window.localStorage,
): GameSaveStore {
  function clear(): boolean {
    try {
      getStorage().removeItem(GAME_SAVE_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  return {
    load(): GameSaveLoadResult {
      let raw: string | null;
      try {
        raw = getStorage().getItem(GAME_SAVE_STORAGE_KEY);
      } catch {
        return { save: null, error: 'unavailable' };
      }

      if (raw === null) return { save: null, error: null };
      try {
        const parsed: unknown = JSON.parse(raw);
        const save = normalizeSave(parsed);
        if (save !== null) return { save, error: null };
      } catch {
        // Malformed saves cannot be resumed; removal remains best-effort.
      }
      clear();
      return { save: null, error: 'corrupt' };
    },

    save(game, paused): boolean {
      try {
        if (game.status === 'game-over') return clear();
        if (game.status !== 'playing' || game.endReason !== null || typeof paused !== 'boolean') {
          return false;
        }
        const normalized = normalizeSave(serializeSave(game, paused));
        if (normalized === null) return false;
        getStorage().setItem(
          GAME_SAVE_STORAGE_KEY,
          JSON.stringify(serializeSave(normalized.game, normalized.paused)),
        );
        return true;
      } catch {
        return false;
      }
    },

    clear,
  };
}
