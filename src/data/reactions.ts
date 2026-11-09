import type { Difficulty } from './difficulty.ts';
import type { Ingredient, IngredientId } from './ingredients.ts';
import type { MixtureTotals } from '../logic/ingredients.ts';

export type ReactionId =
  | 'bubbling'
  | 'volatile-mix'
  | 'solar-frost'
  | 'rooted-steam'
  | 'ashen-bloom'
  | 'annihilation'
  | 'pressure-spike'
  | 'magma-flux'
  | 'deep-freeze'
  | 'arcane-saturation'
  | 'steam-burst'
  | 'black-ice'
  | 'heavy-spark'
  | 'burning-root'
  | 'void-resonance';

export interface Reaction {
  readonly id: ReactionId;
  readonly name: string;
  readonly description: string;
  readonly isActive: (ingredients: readonly Ingredient[], rawTotals: MixtureTotals) => boolean;
  readonly apply: (totals: MixtureTotals) => MixtureTotals;
  readonly timePenalty: number;
  readonly lifePenalty: number;
  readonly clearsCauldron: boolean;
}

interface ReactionEffects {
  readonly timePenalty?: number;
  readonly lifePenalty?: number;
  readonly clearsCauldron?: boolean;
}

function defineReaction(
  id: ReactionId,
  name: string,
  description: string,
  isActive: Reaction['isActive'],
  apply: Reaction['apply'],
  effects: ReactionEffects = {},
): Reaction {
  return {
    id,
    name,
    description,
    isActive,
    apply,
    timePenalty: effects.timePenalty ?? 0,
    lifePenalty: effects.lifePenalty ?? 0,
    clearsCauldron: effects.clearsCauldron ?? false,
  };
}

function contains(ingredients: readonly Ingredient[], ...ids: readonly IngredientId[]): boolean {
  return ids.every((id) => ingredients.some((ingredient) => ingredient.id === id));
}

/** Official reaction catalogue, in the order used to apply simultaneous modifiers. */
export const REACTIONS: readonly Reaction[] = [
  defineReaction(
    'bubbling',
    'Bubbling',
    'Fairy Dust + Caustic Acid: Magic Power +50%; lose 10 seconds on activation.',
    (ingredients) => contains(ingredients, 'fairy-dust', 'caustic-acid'),
    (totals) => ({ ...totals, magicPower: totals.magicPower * 1.5 }),
    { timePenalty: 10 },
  ),
  defineReaction(
    'volatile-mix',
    'Volatile Mix',
    'Phoenix Feather + Essence of the Void: lose one life and clear the cauldron.',
    (ingredients) => contains(ingredients, 'phoenix-feather', 'essence-of-the-void'),
    (totals) => ({ ...totals }),
    { lifePenalty: 1, clearsCauldron: true },
  ),
  defineReaction(
    'solar-frost',
    'Solar Frost',
    'Dragon Tears + Frost Lotus: Temperature becomes 0; Density +20%.',
    (ingredients) => contains(ingredients, 'dragon-tears', 'frost-lotus'),
    (totals) => ({ ...totals, temperature: 0, density: totals.density * 1.2 }),
  ),
  defineReaction(
    'rooted-steam',
    'Rooted Steam',
    'Mandrake Root + Toad Slime: Density +25%; Magic Power -10%.',
    (ingredients) => contains(ingredients, 'mandrake-root', 'toad-slime'),
    (totals) => ({
      ...totals,
      density: totals.density * 1.25,
      magicPower: totals.magicPower * 0.9,
    }),
  ),
  defineReaction(
    'ashen-bloom',
    'Ashen Bloom',
    'Phoenix Feather + Fairy Dust: Temperature +10; Magic Power +25%.',
    (ingredients) => contains(ingredients, 'phoenix-feather', 'fairy-dust'),
    (totals) => ({
      ...totals,
      temperature: totals.temperature + 10,
      magicPower: totals.magicPower * 1.25,
    }),
  ),
  defineReaction(
    'annihilation',
    'Annihilation',
    'An ingredient above +15 Temperature and another below -15: Temperature becomes 0; Density doubles.',
    (ingredients) =>
      ingredients.some((ingredient) => ingredient.temperature > 15) &&
      ingredients.some((ingredient) => ingredient.temperature < -15),
    (totals) => ({ ...totals, temperature: 0, density: totals.density * 2 }),
  ),
  defineReaction(
    'pressure-spike',
    'Pressure Spike',
    'Raw Density of at least 70: Density becomes 70; Magic Power +10%.',
    (_ingredients, totals) => totals.density >= 70,
    (totals) => ({ ...totals, density: 70, magicPower: totals.magicPower * 1.1 }),
  ),
  defineReaction(
    'magma-flux',
    'Magma Flux',
    'Raw Temperature of at least 60: Magic Power +20%; Density -10%.',
    (_ingredients, totals) => totals.temperature >= 60,
    (totals) => ({ ...totals, magicPower: totals.magicPower * 1.2, density: totals.density * 0.9 }),
  ),
  defineReaction(
    'deep-freeze',
    'Deep Freeze',
    'Raw Temperature of -20 or less: Density +15%; Magic Power -15%.',
    (_ingredients, totals) => totals.temperature <= -20,
    (totals) => ({
      ...totals,
      density: totals.density * 1.15,
      magicPower: totals.magicPower * 0.85,
    }),
  ),
  defineReaction(
    'arcane-saturation',
    'Arcane Saturation',
    'Raw Magic Power of at least 80: Magic Power becomes 80; Temperature +5.',
    (_ingredients, totals) => totals.magicPower >= 80,
    (totals) => ({ ...totals, magicPower: 80, temperature: totals.temperature + 5 }),
  ),
  defineReaction(
    'steam-burst',
    'Steam Burst',
    'Dragon Tears + Caustic Acid with raw Temperature at least 35: Temperature +10; lose 5 seconds on activation.',
    (ingredients, totals) =>
      contains(ingredients, 'dragon-tears', 'caustic-acid') && totals.temperature >= 35,
    (totals) => ({ ...totals, temperature: totals.temperature + 10 }),
    { timePenalty: 5 },
  ),
  defineReaction(
    'black-ice',
    'Black Ice',
    'Frost Lotus + Essence of the Void with raw Density at most 0: Temperature -10; Magic Power +20%.',
    (ingredients, totals) =>
      contains(ingredients, 'frost-lotus', 'essence-of-the-void') && totals.density <= 0,
    (totals) => ({
      ...totals,
      temperature: totals.temperature - 10,
      magicPower: totals.magicPower * 1.2,
    }),
  ),
  defineReaction(
    'heavy-spark',
    'Heavy Spark',
    'Fairy Dust + Toad Slime with raw Density at least 40: Density +20%; Magic Power +10%.',
    (ingredients, totals) =>
      contains(ingredients, 'fairy-dust', 'toad-slime') && totals.density >= 40,
    (totals) => ({ ...totals, density: totals.density * 1.2, magicPower: totals.magicPower * 1.1 }),
  ),
  defineReaction(
    'burning-root',
    'Burning Root',
    'Mandrake Root + Phoenix Feather with raw Temperature at least 40: Temperature +15; Density -10%.',
    (ingredients, totals) =>
      contains(ingredients, 'mandrake-root', 'phoenix-feather') && totals.temperature >= 40,
    (totals) => ({
      ...totals,
      temperature: totals.temperature + 15,
      density: totals.density * 0.9,
    }),
  ),
  defineReaction(
    'void-resonance',
    'Void Resonance',
    'Essence of the Void + Dragon Tears with raw Magic Power at least 50: Magic Power +30%; Temperature -5.',
    (ingredients, totals) =>
      contains(ingredients, 'essence-of-the-void', 'dragon-tears') && totals.magicPower >= 50,
    (totals) => ({
      ...totals,
      magicPower: totals.magicPower * 1.3,
      temperature: totals.temperature - 5,
    }),
  ),
];

/** Medium's pair is reachable with its six shelf ingredients; Hard adds Volatile Mix. */
export const REACTION_IDS_BY_DIFFICULTY = {
  easy: [],
  medium: ['bubbling', 'solar-frost'],
  hard: ['bubbling', 'volatile-mix', 'solar-frost'],
} as const satisfies Readonly<Record<Difficulty, readonly ReactionId[]>>;

export function getReactions(difficulty: Difficulty): readonly Reaction[] {
  const enabledIds: readonly ReactionId[] = REACTION_IDS_BY_DIFFICULTY[difficulty];
  return REACTIONS.filter((reaction) => enabledIds.includes(reaction.id));
}
