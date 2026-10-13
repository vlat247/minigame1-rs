import { PREVIEW_INGREDIENTS, PREVIEW_PARAMETERS } from './draft-fixtures';
import { cauldronIllustration, icon } from './icons';

export interface DraftViewState {
  readonly started: boolean;
  readonly paused: boolean;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function ingredientShelf(started: boolean): string {
  if (!started) {
    return Array.from(
      { length: 6 },
      () => '<li class="shelf-slot" aria-hidden="true"><span></span><span></span></li>',
    ).join('');
  }

  return PREVIEW_INGREDIENTS.map(
    (ingredient) => `
      <li>
        <button class="ingredient" type="button" disabled aria-describedby="draft-notice">
          ${icon(ingredient.icon, 'ingredient-icon')}
          <span class="ingredient-content">
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-values">
              <span aria-label="Temperature ${signed(ingredient.temperature)}">T ${signed(ingredient.temperature)}</span>
              <span aria-label="Density ${signed(ingredient.density)}">D ${signed(ingredient.density)}</span>
              <span aria-label="Magic Power ${signed(ingredient.magic)}">M ${signed(ingredient.magic)}</span>
            </span>
          </span>
          <span class="stock-count" aria-label="${ingredient.stock} portions">${ingredient.stock}</span>
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
      <div class="recipe-capacity"><span>Ingredients</span><strong>0 <span>/ 4</span></strong></div>
      <p class="recipe-tolerance">${started ? 'Brew tolerance: ±8 on each range' : 'Medium mode · Up to 4 ingredients'}</p>
    </aside>`;
}

function parameterBars(started: boolean): string {
  return PREVIEW_PARAMETERS.map(
    (parameter) => `
      <section class="parameter ${parameter.className}" aria-labelledby="${parameter.className}-heading">
        <div class="parameter-heading">
          <h2 id="${parameter.className}-heading">${icon(parameter.icon)}${parameter.name}</h2>
          <span class="parameter-value" aria-label="Current ${parameter.name}: zero">0</span>
        </div>
        <div class="parameter-track" aria-hidden="true">
          <span class="track-zero"></span>
          ${started ? `<span class="target-zone" style="--target-start: ${50 + parameter.min / 2}%; --target-width: ${(parameter.max - parameter.min) / 2}%"></span>` : ''}
          <span class="current-marker"></span>
        </div>
        <div class="parameter-scale" aria-hidden="true"><span>−100</span><span>0</span><span>+100</span></div>
        <p class="parameter-target">Target <strong>${started ? `${parameter.min}–${parameter.max}` : '—'}</strong></p>
      </section>`,
  ).join('');
}

export function renderGameDraft(container: HTMLElement, state: DraftViewState): void {
  container.dataset.paused = String(state.paused);
  container.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <a class="brand-symbol" href="#" data-action="home" aria-label="Return to start screen">${icon('spark')}</a>
        <h1>Alchemist’s Cauldron</h1>
      </div>
      <nav class="header-actions" aria-label="Game navigation">
        <button class="button button-quiet" type="button" data-action="help">${icon('help')}<span>Help</span></button>
        <button class="button button-quiet" type="button" data-action="menu">${icon('menu')}<span>Menu</span></button>
      </nav>
    </header>
    <main class="game-main">
      <div class="game-toolbar" aria-label="Game status">
        <div class="stat">${icon('spark')}<span>Score</span><strong>0</strong></div>
        <div class="stat stat-time">${icon('clock')}<span>Time</span><strong>${state.started ? '02:30' : '00:00'}</strong></div>
        <div class="lives" aria-label="${state.started ? '3 lives' : 'No lives before starting'}">
          <span>Lives</span>
          ${state.started ? `<span class="life-icons">${icon('heart')}${icon('heart')}${icon('heart')}</span>` : '<span class="lives-empty">—</span>'}
        </div>
        <button class="button button-quiet pause-button" type="button" data-action="pause" ${state.started ? '' : 'disabled'}>${icon('pause')}<span>Pause</span></button>
      </div>
      <div class="playfield">
        <div class="workbench-grid">
          <section class="shelf-panel" aria-labelledby="shelf-heading">
            <div class="section-heading"><h2 id="shelf-heading">Ingredients</h2><span class="shelf-count">${state.started ? '6 types' : 'Empty shelf'}</span></div>
            <p class="shelf-description">Every portion counts.</p>
            <ul class="ingredient-list" aria-label="${state.started ? 'Ingredient preview' : 'Empty ingredient shelf'}">${ingredientShelf(state.started)}</ul>
          </section>
          <section class="brew-station" aria-labelledby="cauldron-heading">
            <div class="station-heading"><h2 id="cauldron-heading">The cauldron</h2><span>Medium mode</span></div>
            <div class="cauldron-scene">${cauldronIllustration()}</div>
            <div class="mixture-slots" aria-label="Four empty ingredient positions">
              ${Array.from({ length: 4 }, (_, index) => `<span class="mixture-slot" aria-hidden="true">${index + 1}</span>`).join('')}
            </div>
            <p class="cauldron-caption">The cauldron is empty.</p>
            <button class="button button-primary main-action" type="button" ${state.started ? 'disabled aria-describedby="draft-notice"' : 'data-action="start"'}>
              ${icon(state.started ? 'spark' : 'play')} ${state.started ? 'Brew potion' : 'Start Game'}
            </button>
            <p class="station-instruction">${state.started ? 'Add at least one ingredient before brewing.' : 'Match three ranges. Make a little magic.'}</p>
          </section>
          ${recipePanel(state.started)}
        </div>
        <div class="parameter-grid" aria-label="Cauldron parameters">${parameterBars(state.started)}</div>
      </div>
      <div class="game-bottom-row">
        <div class="bar-legend" aria-label="Parameter bar legend"><span><i class="legend-target"></i>Recipe range</span><span><i class="legend-marker"></i>Current value</span></div>
        <button class="button button-quiet" type="button" data-action="leaderboard">${icon('trophy')}Leaderboard</button>
      </div>
      <p class="draft-notice" id="draft-notice">Visual draft${state.started ? ' · Mixing, brewing, and the timer are not active yet.' : ' · Open the workbench to preview a round.'}</p>
    </main>`;
}
