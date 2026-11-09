export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export interface DifficultySettings {
  readonly label: string;
  readonly ingredientCount: number;
  readonly maxIngredients: number;
  readonly startingTime: number;
  readonly tolerance: number;
  readonly lives: number;
  readonly scorePerBrew: number;
  readonly timeBonus: number;
  readonly reactionCount: number;
}

export const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Easy',
    ingredientCount: 4,
    maxIngredients: 4,
    startingTime: 180,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonus: 15,
    reactionCount: 0,
  },
  medium: {
    label: 'Medium',
    ingredientCount: 6,
    maxIngredients: 4,
    startingTime: 150,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonus: 10,
    reactionCount: 2,
  },
  hard: {
    label: 'Hard',
    ingredientCount: 8,
    maxIngredients: 5,
    startingTime: 150,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonus: 5,
    reactionCount: 3,
  },
} as const satisfies Readonly<Record<Difficulty, DifficultySettings>>;

export function isDifficulty(value: string): value is Difficulty {
  return Object.hasOwn(DIFFICULTY_SETTINGS, value);
}
