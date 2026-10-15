import { LEVEL_ONE_INGREDIENTS, getIngredient } from '../data/ingredients';
import type { IngredientId } from '../data/ingredients';
import { MIXTURE_CAPACITY } from '../logic/ingredients';
import type { MixingState } from '../logic/ingredients';
import { PREVIEW_PARAMETERS } from './draft-fixtures';
import { icon } from './icons';
import type { IconName } from './icons';
import { cauldronIllustration, ingredientIllustration, workshopScenery } from './illustrations';

export interface GameViewState {
  readonly mixing: MixingState | null;
  readonly paused: boolean;
}

const INGREDIENT_ICONS: Record<IngredientId, IconName> = {
  'dragon-tears': 'dragon',
  'fairy-dust': 'fairy',
  'frost-lotus': 'lotus',
  'mandrake-root': 'mandrake',
  'caustic-acid': 'acid',
  'essence-of-the-void': 'void',
  'phoenix-feather': 'spark',
  'toad-slime': 'acid',
};

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function ingredientShelf(mixing: MixingState | null): string {
  if (mixing === null) {
    return Array.from(
      { length: 6 },
      () => '<li class="shelf-slot" aria-hidden="true"><span></span><span></span></li>',
    ).join('');
  }

  return LEVEL_ONE_INGREDIENTS.map(
    (ingredient) => `
      <li>
        <button class="ingredient" type="button" data-action="add-ingredient" data-ingredient="${ingredient.id}" aria-describedby="ingredient-feedback">
          ${ingredientIllustration(INGREDIENT_ICONS[ingredient.id])}
          <span class="ingredient-content">
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-values">
              <span class="ingredient-temperature" aria-label="Temperature ${signed(ingredient.temperature)}">T ${signed(ingredient.temperature)}</span>
              <span class="ingredient-density" aria-label="Density ${signed(ingredient.density)}">D ${signed(ingredient.density)}</span>
              <span class="ingredient-magic" aria-label="Magic Power ${signed(ingredient.magicPower)}">M ${signed(ingredient.magicPower)}</span>
            </span>
          </span>
          <span class="stock-count"></span>
        </button>
      </li>`,
  ).join('');
}

function recipePanel(started: boolean): string {
  return `
    <aside class="recipe-panel" aria-labelledby="recipe-heading">
      <div class="section-heading">${icon('magic')}<h2 id="recipe-heading">Current recipe</h2></div>
      <div class="recipe-heading-block">
        ${icon('acid', 'recipe-illustration')}
        <h3>${started ? 'Acid Spark' : 'No recipe yet'}</h3>
        <p>${started ? 'Bring all three values into balance.' : 'Start a game to reveal your first recipe.'}</p>
      </div>
      <dl class="recipe-ranges">
        ${PREVIEW_PARAMETERS.map(
          (parameter) => `
            <div>
              <dt>${icon(parameter.icon)}${parameter.name}</dt>
              <dd>${started ? `${parameter.min}–${parameter.max}` : '—'}</dd>
            </div>`,
        ).join('')}
      </dl>
      <div class="recipe-capacity"><span>Ingredients</span><strong id="mixture-count">0 <span>/ ${MIXTURE_CAPACITY}</span></strong></div>
      <p class="recipe-tolerance">${started ? 'Brew tolerance: ±8 on each range' : 'Medium mode · Up to 4 ingredients'}</p>
    </aside>`;
}

function parameterBars(started: boolean): string {
  return PREVIEW_PARAMETERS.map(
    (parameter) => `
      <section class="parameter ${parameter.className}" aria-labelledby="${parameter.className}-heading">
        <div class="parameter-heading">
          <h2 id="${parameter.className}-heading">${icon(parameter.icon)}${parameter.name}</h2>
          <span class="parameter-value"><span class="sr-only">Current ${parameter.name}: </span><span data-parameter-value>0</span></span>
        </div>
        <div class="parameter-track" role="meter" aria-label="${parameter.name}" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0">
          <span class="track-zero" aria-hidden="true"></span>
          ${started ? '<span class="target-zone" aria-hidden="true"></span>' : ''}
          <span class="current-marker" aria-hidden="true"></span>
        </div>
        <div class="parameter-scale" aria-hidden="true"><span data-scale-min>−100</span><span>0</span><span data-scale-max>+100</span></div>
        <p class="parameter-target">Target <strong>${started ? `${parameter.min}–${parameter.max}` : '—'}</strong><span class="parameter-match" hidden> · In range</span></p>
      </section>`,
  ).join('');
}

export function renderGameView(container: HTMLElement, state: GameViewState): void {
  const started = state.mixing !== null;
  container.dataset.paused = String(state.paused);
  container.dataset.started = String(started);
  container.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <a class="brand-symbol" href="#" data-action="home" aria-label="Return to start screen">${icon('spark')}</a>
        <h1>Alchemist’s Cauldron</h1>
      </div>
      <nav class="header-actions" aria-label="Game navigation">
        <button class="button button-quiet" type="button" data-action="leaderboard">${icon('trophy')}<span>Leaderboard</span></button>
      </nav>
    </header>
    <main class="game-main">
      <div class="game-toolbar" role="group" aria-label="Game status">
        <div class="stat">${icon('spark')}<span>Score</span><strong>0</strong></div>
        <div class="stat stat-time">${icon('clock')}<span>Time</span><strong>${started ? '02:30' : '00:00'}</strong></div>
        <div class="lives" role="group" aria-label="${started ? '3 lives' : 'No lives before starting'}">
          <span>Lives</span>
          ${started ? `<span class="life-icons">${icon('heart')}${icon('heart')}${icon('heart')}</span>` : '<span class="lives-empty">—</span>'}
        </div>
        <button class="button button-quiet pause-button" type="button" data-action="pause" ${started ? '' : 'disabled'}>${icon('pause')}<span>Pause</span></button>
      </div>
      <div class="playfield">
        <div class="workshop-backdrop" aria-hidden="true">${workshopScenery()}</div>
        <div class="workbench-grid">
          <section class="shelf-panel" aria-labelledby="shelf-heading">
            <div class="section-heading"><h2 id="shelf-heading">Ingredients</h2><span class="shelf-count">${started ? '6 types' : 'Empty shelf'}</span></div>
            <p class="shelf-description">${started ? 'Select an ingredient to add one portion.' : 'Stock appears when a game starts.'}</p>
            <ul class="ingredient-list" aria-label="${started ? 'Ingredient shelf' : 'Empty ingredient shelf'}">${ingredientShelf(state.mixing)}</ul>
          </section>
          <section class="brew-station" aria-labelledby="cauldron-heading">
            <div class="station-heading"><h2 id="cauldron-heading">The cauldron</h2><span>Medium mode</span></div>
            <div class="cauldron-scene">${cauldronIllustration()}</div>
            <ol class="mixture-slots" aria-label="Cauldron contents"></ol>
            <p class="cauldron-caption">The cauldron is empty.</p>
            <p class="ingredient-feedback" id="ingredient-feedback" role="status" aria-atomic="true"></p>
          </section>
          ${recipePanel(started)}
        </div>
        <div class="parameter-grid" role="group" aria-label="Cauldron parameters">${parameterBars(started)}</div>
      </div>
      <div class="game-bottom-row">
        <button class="button button-quiet footer-button" type="button" data-action="help">${icon('help')}<span>Help</span></button>
        <div class="main-action-group">
          <button class="button button-primary main-action" type="button" ${started ? 'disabled aria-describedby="feature-notice"' : 'data-action="start"'}>
            ${icon('spark')} ${started ? 'Brew potion' : 'Start Game'} ${icon('spark')}
          </button>
          <p class="station-instruction">${started ? 'Brewing is coming soon. Use Menu → Start new game to mix again.' : 'Match Temperature, Density, and Magic Power.'}</p>
        </div>
        <button class="button button-quiet footer-button" type="button" data-action="menu">${icon('menu')}<span>Menu</span></button>
      </div>
      <div class="game-footnote">
        <div class="bar-legend" role="group" aria-label="Parameter bar legend"><span><i class="legend-target"></i>Recipe range</span><span><i class="legend-marker"></i>Current value</span></div>
        <p class="feature-notice" id="feature-notice">${started ? 'Recipe and timer are previews; brewing is not active yet.' : 'Start a Medium game to mix ingredients.'}</p>
      </div>
    </main>`;
  updateMixingView(container, state);
}

export function updateMixingView(container: HTMLElement, state: GameViewState): void {
  const mixing = state.mixing;
  const count = mixing?.mixture.length ?? 0;
  const full = count === MIXTURE_CAPACITY;

  for (const ingredient of LEVEL_ONE_INGREDIENTS) {
    const button = container.querySelector<HTMLButtonElement>(
      `[data-ingredient="${ingredient.id}"]`,
    );
    if (button === null || mixing === null) continue;
    const stock = mixing.inventory[ingredient.id];
    const exhausted = stock === 0;
    button.disabled = exhausted || state.paused;
    button.setAttribute('aria-disabled', String(exhausted || full || state.paused));
    button.classList.toggle('is-exhausted', exhausted);
    const illustration = button.querySelector('svg.ingredient-illustration');
    if (exhausted && illustration !== null) {
      const placeholder = document.createElement('span');
      placeholder.className = 'ingredient-illustration';
      placeholder.setAttribute('aria-hidden', 'true');
      illustration.replaceWith(placeholder);
    }
    const badge = button.querySelector('.stock-count');
    if (badge !== null) {
      badge.textContent = String(stock);
      badge.setAttribute('aria-label', `${stock} portions remaining`);
    }
  }

  const counter = container.querySelector('#mixture-count');
  if (counter !== null) {
    counter.innerHTML = `${count} <span>/ ${MIXTURE_CAPACITY}</span>`;
    counter.classList.toggle('is-full', full);
  }

  const slots = container.querySelector('.mixture-slots');
  if (slots !== null) {
    slots.innerHTML = Array.from({ length: MIXTURE_CAPACITY }, (_, index) => {
      const id = mixing?.mixture[index];
      const ingredient = id === undefined ? undefined : getIngredient(id);
      return ingredient === undefined
        ? `<li class="mixture-slot"><span class="sr-only">Empty position </span>${index + 1}</li>`
        : `<li class="mixture-slot is-filled" title="${index + 1}. ${ingredient.name}"><span class="sr-only">${ingredient.name}</span>${ingredientIllustration(INGREDIENT_ICONS[ingredient.id])}</li>`;
    }).join('');
  }

  const scene = container.querySelector<HTMLElement>('.cauldron-scene');
  const filled = count > 0;
  if (scene !== null && scene.dataset.filled !== String(filled)) {
    scene.innerHTML = cauldronIllustration(filled);
    scene.dataset.filled = String(filled);
  }
  const caption = container.querySelector('.cauldron-caption');
  if (caption !== null) {
    caption.textContent =
      count === 0
        ? 'The cauldron is empty.'
        : `${count} of ${MIXTURE_CAPACITY} portions added${full ? ' · Cauldron full' : ''}.`;
  }

  for (const parameter of PREVIEW_PARAMETERS) {
    const panel = container.querySelector<HTMLElement>(`.parameter.${parameter.className}`);
    if (panel === null) continue;
    const value = mixing?.totals[parameter.key] ?? 0;
    const limit = Math.max(100, Math.ceil(Math.abs(value) / 100) * 100);
    const inRange = mixing !== null && value >= parameter.min && value <= parameter.max;
    const position = (number: number): string => `${50 + (number / (limit * 2)) * 100}%`;
    panel.classList.toggle('is-in-range', inRange);
    panel.style.setProperty('--current-position', position(value));
    panel.style.setProperty('--target-start', position(parameter.min));
    panel.style.setProperty(
      '--target-width',
      `${((parameter.max - parameter.min) / (limit * 2)) * 100}%`,
    );
    const current = panel.querySelector('[data-parameter-value]');
    if (current !== null) current.textContent = signed(value);
    const track = panel.querySelector('.parameter-track');
    track?.setAttribute('aria-valuemin', String(-limit));
    track?.setAttribute('aria-valuemax', String(limit));
    track?.setAttribute('aria-valuenow', String(value));
    track?.setAttribute(
      'aria-valuetext',
      mixing === null
        ? String(value)
        : `${signed(value)}; target ${parameter.min} to ${parameter.max}${inRange ? '; in range' : ''}`,
    );
    const low = panel.querySelector('[data-scale-min]');
    const high = panel.querySelector('[data-scale-max]');
    if (low !== null) low.textContent = `−${limit}`;
    if (high !== null) high.textContent = `+${limit}`;
    const match = panel.querySelector<HTMLElement>('.parameter-match');
    if (match !== null) match.hidden = !inRange;
  }
}
