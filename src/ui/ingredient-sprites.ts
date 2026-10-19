import dragonTears from '../assets/ingredients/dragon-tears.svg';
import fairyDust from '../assets/ingredients/fairy-dust.svg';
import frostLotus from '../assets/ingredients/frost-lotus.svg';
import mandrakeRoot from '../assets/ingredients/mandrake-root.svg';
import causticAcid from '../assets/ingredients/caustic-acid.svg';
import essenceOfTheVoid from '../assets/ingredients/essence-of-the-void.svg';
import phoenixFeather from '../assets/ingredients/phoenix-feather.svg';
import toadSlime from '../assets/ingredients/toad-slime.svg';
import type { IngredientId } from '../data/ingredients';

const INGREDIENT_SPRITES: Readonly<Record<IngredientId, string>> = {
  'dragon-tears': dragonTears,
  'fairy-dust': fairyDust,
  'frost-lotus': frostLotus,
  'mandrake-root': mandrakeRoot,
  'caustic-acid': causticAcid,
  'essence-of-the-void': essenceOfTheVoid,
  'phoenix-feather': phoenixFeather,
  'toad-slime': toadSlime,
};

export function ingredientIllustration(id: IngredientId): string {
  return `<img class="ingredient-illustration ingredient-illustration--${id}" src="${INGREDIENT_SPRITES[id]}" width="64" height="64" alt="" draggable="false">`;
}
