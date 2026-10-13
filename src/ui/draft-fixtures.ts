import type { IconName } from './icons';

interface IngredientPreview {
  readonly name: string;
  readonly icon: IconName;
  readonly stock: number;
  readonly temperature: number;
  readonly density: number;
  readonly magic: number;
}

// These are visual fixtures, not a playable game's inventory or state.
export const PREVIEW_INGREDIENTS: readonly IngredientPreview[] = [
  { name: 'Dragon Tears', icon: 'dragon', stock: 10, temperature: 25, density: 8, magic: 10 },
  { name: 'Fairy Dust', icon: 'fairy', stock: 12, temperature: 12, density: 9, magic: 12 },
  { name: 'Frost Lotus', icon: 'lotus', stock: 8, temperature: -18, density: 4, magic: 14 },
  { name: 'Mandrake Root', icon: 'mandrake', stock: 11, temperature: -5, density: 20, magic: 8 },
  { name: 'Caustic Acid', icon: 'acid', stock: 6, temperature: 10, density: 14, magic: 22 },
  {
    name: 'Essence of the Void',
    icon: 'void',
    stock: 14,
    temperature: -20,
    density: -10,
    magic: 40,
  },
];

export const PREVIEW_PARAMETERS = [
  { name: 'Temperature', icon: 'temperature', className: 'temperature', min: 17, max: 27 },
  { name: 'Density', icon: 'density', className: 'density', min: 18, max: 28 },
  { name: 'Magic Power', icon: 'magic', className: 'magic', min: 29, max: 39 },
] as const;
