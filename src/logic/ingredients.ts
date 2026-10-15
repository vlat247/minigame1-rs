import {
  INGREDIENT_CATALOGUE,
  LEVEL_ONE_INGREDIENTS,
  isIngredientId,
} from '../data/ingredients.ts';
import type { IngredientId } from '../data/ingredients.ts';

export const MIXTURE_CAPACITY = 4;
export const MIN_STARTING_STOCK = 2;
export const MAX_STARTING_STOCK = 15;

export type IngredientInventory = Readonly<Record<IngredientId, number>>;

export interface MixtureTotals {
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

export interface MixingState {
  readonly inventory: IngredientInventory;
  readonly mixture: readonly IngredientId[];
  readonly totals: MixtureTotals;
}

export type IngredientRejectionReason =
  'unknown-ingredient' | 'unavailable-ingredient' | 'cauldron-full' | 'out-of-stock';

export type AddIngredientResult =
  | { readonly accepted: true; readonly state: MixingState }
  | {
      readonly accepted: false;
      readonly reason: IngredientRejectionReason;
      readonly state: MixingState;
    };

function randomStock(random: () => number): number {
  const sample = random();

  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('The random source must return a number from 0 inclusive to 1 exclusive.');
  }

  return MIN_STARTING_STOCK + Math.floor(sample * (MAX_STARTING_STOCK - MIN_STARTING_STOCK + 1));
}

export function calculateTotals(mixture: readonly IngredientId[]): MixtureTotals {
  return mixture.reduce<MixtureTotals>(
    (totals, id) => {
      const ingredient = INGREDIENT_CATALOGUE[id];

      return {
        temperature: totals.temperature + ingredient.temperature,
        density: totals.density + ingredient.density,
        magicPower: totals.magicPower + ingredient.magicPower,
      };
    },
    { temperature: 0, density: 0, magicPower: 0 },
  );
}

export function createMixingState(random: () => number = Math.random): MixingState {
  const inventory: Record<IngredientId, number> = {
    'dragon-tears': 0,
    'fairy-dust': 0,
    'frost-lotus': 0,
    'mandrake-root': 0,
    'caustic-acid': 0,
    'essence-of-the-void': 0,
    'phoenix-feather': 0,
    'toad-slime': 0,
  };

  for (const ingredient of LEVEL_ONE_INGREDIENTS) {
    inventory[ingredient.id] = randomStock(random);
  }

  return {
    inventory,
    mixture: [],
    totals: calculateTotals([]),
  };
}

export function addIngredient(state: MixingState, id: string): AddIngredientResult {
  if (!isIngredientId(id)) {
    return { accepted: false, reason: 'unknown-ingredient', state };
  }

  if (!LEVEL_ONE_INGREDIENTS.some((ingredient) => ingredient.id === id)) {
    return { accepted: false, reason: 'unavailable-ingredient', state };
  }

  if (state.mixture.length >= MIXTURE_CAPACITY) {
    return { accepted: false, reason: 'cauldron-full', state };
  }

  if (state.inventory[id] <= 0) {
    return { accepted: false, reason: 'out-of-stock', state };
  }

  const mixture = [...state.mixture, id];

  return {
    accepted: true,
    state: {
      inventory: { ...state.inventory, [id]: state.inventory[id] - 1 },
      mixture,
      totals: calculateTotals(mixture),
    },
  };
}
