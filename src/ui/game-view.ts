import { DIFFICULTY_SETTINGS } from '../data/difficulty';
import type { Difficulty } from '../data/difficulty';
import { getShelfIngredients, getIngredient } from '../data/ingredients';
import type { Recipe } from '../data/recipes';
import type { BrewFeedback } from '../logic/brewing';
import type { MixingState } from '../logic/ingredients';
import type { GameState } from '../state/game';
import { PARAMETERS } from './parameters';
import { icon } from './icons';
import { cauldronIllustration, workshopScenery } from './illustrations';
import { ingredientIllustration } from './ingredient-sprites';

export interface GameViewState {
  readonly game: GameState | null;
  readonly paused: boolean;
  readonly lastBrew: BrewFeedback | null;
  readonly selectedDifficulty: Difficulty;
  readonly canContinue: boolean;
  readonly saveNotice: string;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function ingredientShelf(mixing: MixingState | null, difficulty: Difficulty): string {
  if (mixing === null) {
    return Array.from(
      { length: DIFFICULTY_SETTINGS[difficulty].ingredientCount },
      () => '<li class="shelf-slot" aria-hidden="true"><span></span><span></span></li>',
    ).join('');
  }

  return getShelfIngredients(difficulty)
    .map(
      (ingredient) => `
      <li>
        <button class="ingredient" type="button" data-action="add-ingredient" data-ingredient="${ingredient.id}" aria-describedby="ingredient-feedback">
          ${ingredientIllustration(ingredient.id)}
          <span class="ingredient-content">
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-values">
              <span class="ingredient-temperature" aria-label="Temperature ${signed(ingredient.temperature)}">T${signed(ingredient.temperature)}</span>
              <span class="ingredient-density" aria-label="Density ${signed(ingredient.density)}">D${signed(ingredient.density)}</span>
              <span class="ingredient-magic" aria-label="Magic Power ${signed(ingredient.magicPower)}">M${signed(ingredient.magicPower)}</span>
            </span>
          </span>
          <span class="stock-count"></span>
        </button>
      </li>`,
    )
    .join('');
}

function formatTime(seconds: number): string {
  const wholeSeconds = Math.ceil(Math.max(0, seconds));
  return `${Math.floor(wholeSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(wholeSeconds % 60).toString().padStart(2, '0')}`;
}

function recipePanel(recipe: Recipe | undefined, difficulty: Difficulty): string {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return `
    <aside class="recipe-panel" aria-labelledby="recipe-heading">
      <div class="section-heading"><h2 id="recipe-heading">Current recipe</h2></div>
      <div class="recipe-heading-block">
        <h3 data-recipe-name>${recipe?.name ?? 'No recipe yet'}</h3>
      </div>
      <dl class="recipe-ranges">
        ${PARAMETERS.map(
          (parameter) => `
            <div>
              <dt>${icon(parameter.icon)}<span class="recipe-parameter-name">${parameter.name}</span></dt>
              <dd data-recipe-range="${parameter.key}">${recipe !== undefined ? `${recipe[parameter.key].min}–${recipe[parameter.key].max}` : '—'}</dd>
            </div>`,
        ).join('')}
      </dl>
      <div class="recipe-capacity"><span>Ingredients</span><strong id="mixture-count">0 <span>/ ${settings.maxIngredients}</span></strong></div>
      <p class="recipe-tolerance">Tolerance ±${settings.tolerance}</p>
    </aside>`;
}

function parameterBars(recipe: Recipe | undefined): string {
  return PARAMETERS.map(
    (parameter) => `
      <section class="parameter ${parameter.className}" aria-labelledby="${parameter.className}-heading">
        <div class="parameter-heading">
          <h2 id="${parameter.className}-heading">${icon(parameter.icon)}${parameter.name}</h2>
          <span class="parameter-value"><span class="sr-only">Current ${parameter.name}: </span><span data-parameter-value>0</span></span>
        </div>
        <div class="parameter-track" role="meter" aria-label="${parameter.name}" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0">
          <span class="track-zero" aria-hidden="true"></span>
          ${recipe !== undefined ? '<span class="target-zone" aria-hidden="true"></span>' : ''}
          <span class="current-marker" aria-hidden="true"></span>
        </div>
        <div class="parameter-scale" aria-hidden="true"><span data-scale-min>−100</span><span>0</span><span data-scale-max>+100</span></div>
        <p class="parameter-target"><span class="parameter-target-label">Target </span><strong data-target-range>${recipe !== undefined ? `${recipe[parameter.key].min}–${recipe[parameter.key].max}` : '—'}</strong><span class="parameter-match" hidden> · In range</span></p>
      </section>`,
  ).join('');
}

export function renderGameView(container: HTMLElement, state: GameViewState): void {
  const started = state.game !== null;
  const recipe = state.game?.recipe;
  const difficulty = state.game?.difficulty ?? state.selectedDifficulty;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  container.dataset.paused = String(state.paused);
  container.dataset.started = String(started);
  container.dataset.difficulty = difficulty;
  container.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <h1><a href="#" data-action="home" aria-label="Alchemist’s Cauldron · Return to start screen">Alchemist’s Cauldron</a></h1>
      </div>
      <nav class="header-actions" aria-label="Game navigation">
        <button class="button button-quiet" type="button" data-action="leaderboard">${icon('trophy')}<span>Leaderboard</span></button>
      </nav>
    </header>
    <main class="game-main">
      <div class="game-toolbar" role="group" aria-label="Game status">
        <div class="stat"><span>Score</span><strong data-score>0</strong></div>
        <div class="stat stat-time" role="timer" aria-label="Time remaining"><strong data-time>00:00</strong></div>
        <div class="toolbar-actions">
          <div class="lives" role="group" aria-label="${started ? `${settings.lives} lives` : 'No lives before starting'}">
            ${started ? '<span class="life-icons" aria-hidden="true"></span>' : '<span class="lives-empty">—</span>'}
          </div>
          <button class="button button-quiet pause-button" type="button" data-action="pause" ${started ? '' : 'disabled'}>${icon('pause')}<span>Pause</span></button>
        </div>
      </div>
      <progress class="time-bar" max="${settings.startingTime}" value="0" aria-label="Time remaining"></progress>
      <div class="playfield">
        <div class="workshop-backdrop" aria-hidden="true">${workshopScenery()}</div>
        <div class="workbench-grid">
          <section class="shelf-panel" aria-labelledby="shelf-heading">
            <div class="section-heading"><h2 id="shelf-heading">Ingredients</h2><span class="shelf-count">${started ? `${settings.ingredientCount} types` : 'Empty shelf'}</span></div>
            <ul class="ingredient-list" aria-label="${started ? 'Ingredient shelf' : 'Empty ingredient shelf'}">${ingredientShelf(state.game?.mixing ?? null, difficulty)}</ul>
          </section>
          <section class="brew-station" aria-labelledby="cauldron-heading">
            <div class="station-heading"><h2 id="cauldron-heading">The cauldron</h2><span>${settings.label} mode</span></div>
            <div class="cauldron-scene">${cauldronIllustration()}</div>
            <section class="brew-feedback" aria-labelledby="last-brew-title" hidden></section>
            <ol class="mixture-slots" aria-label="Cauldron contents"></ol>
            <p class="cauldron-caption sr-only">The cauldron is empty.</p>
            <p class="ingredient-feedback" id="ingredient-feedback" role="status" aria-atomic="true"></p>
          </section>
          ${recipePanel(recipe, difficulty)}
        </div>
        <div class="parameter-grid" role="group" aria-label="Cauldron parameters">${parameterBars(recipe)}</div>
      </div>
      <div class="game-bottom-row">
        <button class="button button-quiet footer-button" type="button" data-action="help">${icon('help')}<span>Help</span></button>
        <div class="main-action-group">
          <button class="button button-primary main-action" type="button" data-action="${started ? 'brew' : 'start'}">
            ${started ? 'Brew potion' : 'Start Game'}
          </button>
          ${!started && state.canContinue ? '<button class="button button-secondary continue-action" type="button" data-action="continue">Continue Game</button>' : ''}
        </div>
        <button class="button button-quiet footer-button" type="button" data-action="menu">${icon('menu')}<span>Menu</span></button>
      </div>
      <p class="save-notice" data-save-notice role="status" ${state.saveNotice === '' ? 'hidden' : ''}></p>
    </main>`;
  updateGameView(container, state);
}

export function updateGameView(container: HTMLElement, state: GameViewState): void {
  const game = state.game;
  const mixing = game?.mixing ?? null;
  const recipe = game?.recipe;
  const settings = DIFFICULTY_SETTINGS[game?.difficulty ?? state.selectedDifficulty];
  const ended = game?.status === 'game-over';
  const count = mixing?.mixture.length ?? 0;
  const full = count >= settings.maxIngredients;

  for (const ingredient of getShelfIngredients(game?.difficulty ?? state.selectedDifficulty)) {
    const button = container.querySelector<HTMLButtonElement>(
      `[data-ingredient="${ingredient.id}"]`,
    );
    if (button === null || mixing === null) continue;
    const stock = mixing.inventory[ingredient.id];
    const exhausted = stock === 0;
    button.disabled = exhausted || state.paused || ended;
    button.setAttribute('aria-disabled', String(exhausted || full || state.paused || ended));
    button.classList.toggle('is-exhausted', exhausted);
    const illustration = button.querySelector('img.ingredient-illustration');
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
    counter.innerHTML = `${count} <span>/ ${settings.maxIngredients}</span>`;
    counter.classList.toggle('is-full', full);
  }

  const slots = container.querySelector('.mixture-slots');
  if (slots !== null) {
    slots.innerHTML = Array.from({ length: settings.maxIngredients }, (_, index) => {
      const id = mixing?.mixture[index];
      const ingredient = id === undefined ? undefined : getIngredient(id);
      return ingredient === undefined
        ? `<li class="mixture-slot"><span class="sr-only">Empty position </span>${index + 1}</li>`
        : `<li class="mixture-slot is-filled" title="${index + 1}. ${ingredient.name}"><span class="sr-only">${ingredient.name}</span>${ingredientIllustration(ingredient.id)}</li>`;
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
        : `${count} of ${settings.maxIngredients} portions added${full ? ' · Cauldron full' : ''}.`;
  }

  for (const parameter of PARAMETERS) {
    const panel = container.querySelector<HTMLElement>(`.parameter.${parameter.className}`);
    if (panel === null) continue;
    const value = mixing?.totals[parameter.key] ?? 0;
    const range = recipe?.[parameter.key];
    const min = range?.min ?? 0;
    const max = range?.max ?? 0;
    const limit = Math.max(
      100,
      Math.ceil(Math.max(Math.abs(value), Math.abs(min), Math.abs(max)) / 100) * 100,
    );
    const inRange = range !== undefined && value >= min && value <= max;
    const position = (number: number): string => `${50 + (number / (limit * 2)) * 100}%`;
    panel.classList.toggle('is-in-range', inRange);
    panel.style.setProperty('--current-position', position(value));
    panel.style.setProperty('--target-start', position(min));
    panel.style.setProperty('--target-width', `${((max - min) / (limit * 2)) * 100}%`);
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
        : `${signed(value)}; target ${min} to ${max}${inRange ? '; in range' : ''}`,
    );
    const low = panel.querySelector('[data-scale-min]');
    const high = panel.querySelector('[data-scale-max]');
    if (low !== null) low.textContent = `−${limit}`;
    if (high !== null) high.textContent = `+${limit}`;
    const match = panel.querySelector<HTMLElement>('.parameter-match');
    if (match !== null) match.hidden = !inRange;
    const target = panel.querySelector('[data-target-range]');
    if (target !== null) target.textContent = range === undefined ? '—' : `${min}–${max}`;
    const recipeRange = container.querySelector(`[data-recipe-range="${parameter.key}"]`);
    if (recipeRange !== null) recipeRange.textContent = range === undefined ? '—' : `${min}–${max}`;
  }

  const recipeName = container.querySelector('[data-recipe-name]');
  if (recipeName !== null) recipeName.textContent = recipe?.name ?? 'No recipe yet';
  const score = container.querySelector('[data-score]');
  if (score !== null) score.textContent = String(game?.score ?? 0);
  const lives = container.querySelector('.lives');
  lives?.setAttribute(
    'aria-label',
    game === null ? 'No lives before starting' : `${game.lives} lives`,
  );
  const hearts = container.querySelector('.life-icons');
  if (hearts !== null && game !== null) {
    hearts.innerHTML = Array.from(
      { length: settings.lives },
      (_, index) =>
        `<span${index >= game.lives ? ' class="life-lost"' : ''}>${icon('heart')}</span>`,
    ).join('');
  }
  const pause = container.querySelector<HTMLButtonElement>('[data-action="pause"]');
  if (pause !== null) pause.disabled = game === null || ended;
  const brew = container.querySelector<HTMLButtonElement>('[data-action="brew"]');
  if (brew !== null) brew.disabled = count === 0 || state.paused || ended;
  container.dataset.feedback = String(state.lastBrew !== null);
  const feedback = container.querySelector<HTMLElement>('.brew-feedback');
  if (feedback !== null) {
    feedback.hidden = state.lastBrew === null;
    feedback.innerHTML = state.lastBrew === null ? '' : brewFeedbackMarkup(state.lastBrew);
  }
  updateSessionView(container, state);
}

export function updateSessionView(container: HTMLElement, state: GameViewState): void {
  const remaining = state.game?.timeRemaining ?? 0;
  const formatted = formatTime(remaining);
  const time = container.querySelector('[data-time]');
  if (time !== null && time.textContent !== formatted) time.textContent = formatted;
  const lowTime = state.game !== null && remaining < 15;
  container.querySelector('.stat-time')?.classList.toggle('is-low-time', lowTime);
  const bar = container.querySelector<HTMLProgressElement>('.time-bar');
  if (bar !== null) {
    bar.value = remaining;
    bar.classList.toggle('is-low-time', lowTime);
    bar.setAttribute('aria-valuetext', `${formatted} remaining`);
  }
  container.dataset.ended = String(state.game?.status === 'game-over');
  const notice = container.querySelector<HTMLElement>('[data-save-notice]');
  if (notice !== null) {
    notice.textContent = state.saveNotice;
    notice.hidden = state.saveNotice === '';
  }
}

function brewFeedbackMarkup(result: BrewFeedback): string {
  const tolerance = DIFFICULTY_SETTINGS[result.recipe.difficulty].tolerance;
  return `
    <h2 id="last-brew-title">${result.recipe.name} · ${result.success ? 'Potion brewed!' : 'Brew failed'}</h2>
    <p>${result.success ? `+${result.scoreDelta} points · ${result.timeDelta > 0 ? `+${Number(result.timeDelta.toFixed(1))} seconds` : 'Clock already at maximum'}` : 'One life lost. The recipe stays the same.'}</p>
    <dl class="brew-checks">${PARAMETERS.map(
      (parameter) => `
      <div class="${result.checks[parameter.key] ? 'brew-check-passed' : 'brew-check-failed'}">
        <dt>${icon(parameter.icon)}<span class="sr-only">${parameter.name}: </span>${result.checks[parameter.key] ? 'Matched' : 'Outside'}</dt>
        <dd>${signed(result.totals[parameter.key])}<span><span class="sr-only">Accepted range </span>(${result.recipe[parameter.key].min - tolerance}–${result.recipe[parameter.key].max + tolerance})</span></dd>
      </div>`,
    ).join('')}</dl>`;
}
