import { getIngredient } from '../data/ingredients';
import type { Ingredient } from '../data/ingredients';
import { positionIngredientTooltip } from '../logic/tooltip-position';
import '../styles/ingredient-tooltip.css';

export interface IngredientTooltipOptions {
  readonly isAvailable: () => boolean;
  readonly canInspectTouch: () => boolean;
}

export interface IngredientTooltip {
  readonly refresh: () => void;
  readonly hide: () => void;
  readonly dismiss: () => void;
  readonly dispose: () => void;
}

let nextTooltipId = 0;

function signedBaseValue(value: number): string {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0';
}

/** One transient tooltip survives view updates and escapes the clipped workbench via a popover. */
export function createIngredientTooltip(
  container: HTMLElement,
  options: IngredientTooltipOptions,
): IngredientTooltip {
  const tooltip = document.createElement('div');
  tooltip.id = `ingredient-tooltip-${++nextTooltipId}`;
  tooltip.className = 'ingredient-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.popover = 'manual';
  tooltip.hidden = true;
  container.append(tooltip);

  let activeAnchor: HTMLButtonElement | null = null;
  let pointerAnchor: HTMLButtonElement | null = null;
  let focusAnchor: HTMLButtonElement | null = null;
  let touchAnchor: HTMLButtonElement | null = null;
  let dismissedAnchor: HTMLButtonElement | null = null;
  let disposed = false;

  function buttonAt(target: EventTarget | null): HTMLButtonElement | null {
    if (!(target instanceof Element)) return null;
    const button = target.closest<HTMLButtonElement>('[data-action="add-ingredient"]');
    return button !== null && container.contains(button) ? button : null;
  }

  function canInspect(button: HTMLButtonElement | null): button is HTMLButtonElement {
    return (
      button !== null &&
      button.isConnected &&
      container.contains(button) &&
      !button.disabled &&
      getIngredient(button.dataset.ingredient ?? '') !== undefined
    );
  }

  function setDescription(button: HTMLButtonElement, show: boolean): void {
    const ids = (button.getAttribute('aria-describedby') ?? '')
      .split(/\s+/u)
      .filter((id) => id !== '' && id !== tooltip.id);
    if (show) ids.push(tooltip.id);
    if (ids.length === 0) button.removeAttribute('aria-describedby');
    else button.setAttribute('aria-describedby', ids.join(' '));
  }

  function hideBox(): void {
    if (activeAnchor !== null) setDescription(activeAnchor, false);
    activeAnchor = null;
    if (tooltip.matches(':popover-open')) tooltip.hidePopover();
    tooltip.hidden = true;
  }

  function hide(): void {
    pointerAnchor = null;
    focusAnchor = null;
    touchAnchor = null;
    dismissedAnchor = null;
    hideBox();
  }

  function populate(ingredient: Ingredient): void {
    const name = document.createElement('strong');
    name.className = 'ingredient-tooltip-name';
    name.textContent = ingredient.name;
    const values = document.createElement('dl');
    for (const [label, value] of [
      ['Temperature', ingredient.temperature],
      ['Density', ingredient.density],
      ['Magic Power', ingredient.magicPower],
    ] as const) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      term.textContent = label;
      const number = document.createElement('dd');
      number.textContent = signedBaseValue(value);
      row.append(term, number);
      values.append(row);
    }
    tooltip.replaceChildren(name, values);
  }

  function refresh(): void {
    if (disposed) return;
    if (!options.isAvailable()) {
      hide();
      return;
    }
    if (!options.canInspectTouch()) touchAnchor = null;
    const candidate = [pointerAnchor, focusAnchor, touchAnchor].find(canInspect);
    if (candidate === undefined) {
      dismissedAnchor = null;
      hideBox();
      return;
    }
    if (candidate === dismissedAnchor) {
      hideBox();
      return;
    }
    if (dismissedAnchor !== null) dismissedAnchor = null;
    const ingredient = getIngredient(candidate.dataset.ingredient ?? '');
    if (ingredient === undefined) {
      hide();
      return;
    }
    if (activeAnchor !== candidate) {
      hideBox();
      populate(ingredient);
      activeAnchor = candidate;
      setDescription(candidate, true);
    }
    tooltip.hidden = false;
    if (!tooltip.matches(':popover-open')) tooltip.showPopover();
    const position = positionIngredientTooltip(
      candidate.getBoundingClientRect(),
      tooltip.getBoundingClientRect(),
      { width: document.documentElement.clientWidth, height: window.innerHeight },
    );
    tooltip.style.left = `${position.left}px`;
    tooltip.style.top = `${position.top}px`;
    tooltip.classList.toggle('tooltip--left', position.opensLeft);
    tooltip.classList.toggle('tooltip--up', position.opensUp);
  }

  function dismiss(): void {
    dismissedAnchor = activeAnchor ?? dismissedAnchor;
    hideBox();
  }

  function handlePointerOver(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const button = buttonAt(event.target);
    if (button === null || button === buttonAt(event.relatedTarget)) return;
    touchAnchor = null;
    pointerAnchor = button;
    refresh();
  }

  function handlePointerOut(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const related = event.relatedTarget;
    if (related instanceof Node && tooltip.contains(related)) return;
    const button = buttonAt(event.target);
    if (button !== null && button === buttonAt(related)) return;
    if (button !== null && pointerAnchor === button) pointerAnchor = null;
    if (event.target instanceof Node && tooltip.contains(event.target)) {
      if (buttonAt(related) === pointerAnchor) return;
      pointerAnchor = null;
    }
    refresh();
  }

  function handlePointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      focusAnchor = null;
      return;
    }
    const button = buttonAt(event.target);
    if (button === null || !options.canInspectTouch()) {
      hide();
      return;
    }
    pointerAnchor = null;
    focusAnchor = null;
    touchAnchor = button;
    refresh();
  }

  function handleFocusIn(event: FocusEvent): void {
    const button = buttonAt(event.target);
    if (button === null || !button.matches(':focus-visible')) return;
    touchAnchor = null;
    focusAnchor = button;
    refresh();
  }

  function handleFocusOut(event: FocusEvent): void {
    const button = buttonAt(event.target);
    if (button === null || button === buttonAt(event.relatedTarget)) return;
    if (focusAnchor === button) focusAnchor = null;
    if (touchAnchor === button) touchAnchor = null;
    refresh();
  }

  container.addEventListener('pointerover', handlePointerOver);
  container.addEventListener('pointerout', handlePointerOut);
  container.addEventListener('pointerdown', handlePointerDown);
  container.addEventListener('focusin', handleFocusIn);
  container.addEventListener('focusout', handleFocusOut);
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, true);
  window.visualViewport?.addEventListener('resize', refresh);

  return {
    refresh,
    hide,
    dismiss,
    dispose(): void {
      hide();
      disposed = true;
      container.removeEventListener('pointerover', handlePointerOver);
      container.removeEventListener('pointerout', handlePointerOut);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      window.visualViewport?.removeEventListener('resize', refresh);
      tooltip.remove();
    },
  };
}
