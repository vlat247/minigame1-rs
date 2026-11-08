import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { RECIPES } from '../data/recipes.ts';
import type { Recipe } from '../data/recipes.ts';
import { getAchievements } from '../logic/collections.ts';
import type { CollectionProgress } from '../logic/collections.ts';
import { icon } from './icons.ts';
import { escapeHtml } from './leaderboard-view.ts';

function rangeText(min: number, max: number): string {
  const signed = (value: number): string => (value < 0 ? `−${Math.abs(value)}` : String(value));
  return `${signed(min)} to ${signed(max)}`;
}

function recipeMarkup(recipe: Recipe, discovered: boolean): string {
  return `
    <li class="collection-recipe" data-recipe-id="${escapeHtml(recipe.id)}" data-discovered="${discovered}">
      <div class="collection-recipe-heading">
        <h4>${discovered ? escapeHtml(recipe.name) : 'Undiscovered recipe'}</h4>
        <span class="collection-recipe-state">${discovered ? 'Discovered' : 'Locked'}</span>
      </div>
      ${
        discovered
          ? `<dl class="collection-ranges">
        <div class="collection-range-temperature"><dt>${icon('temperature')}<span>Temperature</span></dt><dd>${rangeText(recipe.temperature.min, recipe.temperature.max)}</dd></div>
        <div class="collection-range-density"><dt>${icon('density')}<span>Density</span></dt><dd>${rangeText(recipe.density.min, recipe.density.max)}</dd></div>
        <div class="collection-range-magic"><dt>${icon('magic')}<span>Magic Power</span></dt><dd>${rangeText(recipe.magicPower.min, recipe.magicPower.max)}</dd></div>
      </dl>`
          : ''
      }
    </li>`;
}

export function collectionMarkup(progress: CollectionProgress, notice: string): string {
  const discoveredIds = new Set(progress.discoveredRecipeIds);
  const discoveredRecipes = RECIPES.filter((recipe) => discoveredIds.has(recipe.id));

  return `
    <div class="collection-content">
      <p class="collection-total"><strong>${discoveredRecipes.length} / ${RECIPES.length}</strong> recipes discovered</p>
      ${discoveredRecipes.length === 0 ? '<p class="collection-empty">Your first successful brew will reveal a recipe here.</p>' : ''}
      ${notice === '' ? '' : `<p class="collection-notice" role="status">${escapeHtml(notice)}</p>`}
      <section class="collection-achievements" aria-labelledby="collection-achievements-heading">
        <h3 id="collection-achievements-heading">Achievements</h3>
        <ul class="collection-achievement-list">
          ${getAchievements(progress)
            .map(
              (achievement) => `
            <li class="collection-achievement" data-achievement-id="${achievement.id}" data-unlocked="${achievement.unlocked}">
              <div class="collection-achievement-heading"><strong>${escapeHtml(achievement.name)}</strong><span class="collection-achievement-state">${achievement.unlocked ? 'Unlocked' : 'Locked'}</span></div>
              <p>${escapeHtml(achievement.description)}</p>
            </li>`,
            )
            .join('')}
        </ul>
      </section>
      <p class="collection-target-note">Discovered recipes show their target ranges. Brewing also allows the selected difficulty’s tolerance.</p>
      ${DIFFICULTIES.map((difficulty) => {
        const recipes = RECIPES.filter((recipe) => recipe.difficulty === difficulty);
        const count = recipes.filter((recipe) => discoveredIds.has(recipe.id)).length;
        return `
        <section class="collection-group" aria-labelledby="collection-${difficulty}-heading">
          <h3 id="collection-${difficulty}-heading">${DIFFICULTY_SETTINGS[difficulty].label}<span>${count} / ${recipes.length} discovered</span></h3>
          <ul class="collection-recipe-list">${recipes.map((recipe) => recipeMarkup(recipe, discoveredIds.has(recipe.id))).join('')}</ul>
        </section>`;
      }).join('')}
      <div class="dialog-actions"><button class="button button-primary" type="button" data-action="dialog-close">Back</button></div>
    </div>`;
}
