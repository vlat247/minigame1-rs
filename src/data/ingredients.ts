export const INGREDIENT_IDS = [
  'dragon-tears',
  'fairy-dust',
  'frost-lotus',
  'mandrake-root',
  'caustic-acid',
  'essence-of-the-void',
  'phoenix-feather',
  'toad-slime',
] as const;

export type IngredientId = (typeof INGREDIENT_IDS)[number];

export interface Ingredient {
  readonly id: IngredientId;
  readonly name: string;
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

export const INGREDIENT_CATALOGUE = {
  'dragon-tears': {
    id: 'dragon-tears',
    name: 'Dragon Tears',
    temperature: 25,
    density: 8,
    magicPower: 10,
  },
  'fairy-dust': {
    id: 'fairy-dust',
    name: 'Fairy Dust',
    temperature: 12,
    density: 9,
    magicPower: 12,
  },
  'frost-lotus': {
    id: 'frost-lotus',
    name: 'Frost Lotus',
    temperature: -18,
    density: 4,
    magicPower: 14,
  },
  'mandrake-root': {
    id: 'mandrake-root',
    name: 'Mandrake Root',
    temperature: -5,
    density: 20,
    magicPower: 8,
  },
  'caustic-acid': {
    id: 'caustic-acid',
    name: 'Caustic Acid',
    temperature: 10,
    density: 14,
    magicPower: 22,
  },
  'essence-of-the-void': {
    id: 'essence-of-the-void',
    name: 'Essence of the Void',
    temperature: -20,
    density: -10,
    magicPower: 40,
  },
  'phoenix-feather': {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    temperature: 50,
    density: -10,
    magicPower: 30,
  },
  'toad-slime': {
    id: 'toad-slime',
    name: 'Toad Slime',
    temperature: 5,
    density: 30,
    magicPower: 0,
  },
} as const satisfies Readonly<Record<IngredientId, Ingredient>>;

export const INGREDIENTS: readonly Ingredient[] = INGREDIENT_IDS.map(
  (id) => INGREDIENT_CATALOGUE[id],
);

export const LEVEL_ONE_INGREDIENTS: readonly Ingredient[] = INGREDIENTS.slice(0, 6);

export function isIngredientId(value: string): value is IngredientId {
  return Object.hasOwn(INGREDIENT_CATALOGUE, value);
}

export function getIngredient(value: string): Ingredient | undefined {
  return isIngredientId(value) ? INGREDIENT_CATALOGUE[value] : undefined;
}
