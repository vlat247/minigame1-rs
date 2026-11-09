import { cauldronIllustration } from './illustrations';
import '../styles/brew-effects.css';

export interface BrewEffects {
  play(success: boolean, timeDelta: number): void;
  clear(): void;
  dispose(): void;
}

/** Decorative effects finish on CSS animation events; they never delay a game action. */
export function createBrewEffects(container: HTMLElement): BrewEffects {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let effect: HTMLElement | null = null;
  let alternateShake = false;
  let disposed = false;

  function clear(): void {
    effect?.removeEventListener('animationend', handleAnimationEnd);
    effect?.removeEventListener('animationcancel', handleAnimationEnd);
    effect?.remove();
    effect = null;
    container.classList.remove('is-brew-failure-a', 'is-brew-failure-b');
  }

  function handleAnimationEnd(event: AnimationEvent): void {
    // Bubbles, particles and the pot have their own shorter animations.
    if (event.target === effect && event.animationName === 'brew-effect-lifetime') clear();
  }

  function handleMotionChange(): void {
    if (reducedMotion.matches) clear();
  }

  function play(success: boolean, timeDelta: number): void {
    clear();
    if (disposed || reducedMotion.matches) return;
    const station = container.querySelector('.brew-station');
    if (station === null) return;

    effect = document.createElement('div');
    effect.className = `brew-effect ${success ? 'is-success' : 'is-failure'}`;
    effect.setAttribute('aria-hidden', 'true');
    const bonus = Number(Math.max(0, timeDelta).toFixed(1));
    effect.innerHTML = `
      <div class="brew-effect-pot">${cauldronIllustration(true)}</div>
      <span class="brew-burst"></span>
      ${Array.from({ length: 8 }, (_, index) => `<span class="brew-spark brew-spark-${index + 1}"></span>`).join('')}
      ${success && bonus > 0 ? `<span class="brew-time-bonus">+${bonus}s</span>` : ''}`;
    effect.addEventListener('animationend', handleAnimationEnd);
    effect.addEventListener('animationcancel', handleAnimationEnd);
    station.append(effect);

    if (!success) {
      alternateShake = !alternateShake;
      container.classList.add(alternateShake ? 'is-brew-failure-a' : 'is-brew-failure-b');
    }
  }

  function dispose(): void {
    clear();
    disposed = true;
    reducedMotion.removeEventListener('change', handleMotionChange);
  }

  reducedMotion.addEventListener('change', handleMotionChange);
  return { play, clear, dispose };
}
