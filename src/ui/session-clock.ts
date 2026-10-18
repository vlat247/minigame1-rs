export const SESSION_UPDATE_INTERVAL = 100;

export interface SessionClockDependencies {
  readonly now: () => number;
  readonly setInterval: (callback: () => void, milliseconds: number) => number;
  readonly clearInterval: (handle: number) => void;
}

export interface SessionClock {
  /** Start or restart from a fresh timestamp; pending time from an old run is discarded. */
  start(): void;
  /** Deliver all elapsed time synchronously before an action can change the game. */
  synchronize(): void;
  /** Deliver elapsed time, then stop sampling until start is called again. */
  pause(): void;
  /** Stop without delivering pending time, for restarting or leaving a run. */
  stop(): void;
  /** Permanently stop and invalidate every callback from this clock. */
  dispose(): void;
}

export function createSessionClock(
  onElapsed: (seconds: number) => void,
  dependencies: Partial<SessionClockDependencies> = {},
): SessionClock {
  const now = dependencies.now ?? (() => performance.now());
  const schedule =
    dependencies.setInterval ??
    ((callback: () => void, milliseconds: number) => window.setInterval(callback, milliseconds));
  const cancel = dependencies.clearInterval ?? ((handle: number) => window.clearInterval(handle));
  let lastTimestamp: number | null = null;
  let interval: number | undefined;
  let generation = 0;
  let disposed = false;

  function synchronize(): void {
    if (disposed || lastTimestamp === null) return;

    const timestamp = Math.max(lastTimestamp, now());
    const elapsed = (timestamp - lastTimestamp) / 1000;
    // Update before notifying: the callback may stop the clock when a run expires.
    lastTimestamp = timestamp;

    if (elapsed > 0) onElapsed(elapsed);
  }

  function stop(): void {
    generation += 1;
    lastTimestamp = null;
    if (interval !== undefined) {
      cancel(interval);
      interval = undefined;
    }
  }

  function start(): void {
    if (disposed) return;
    stop();
    lastTimestamp = now();
    const activeGeneration = generation;
    interval = schedule(() => {
      if (disposed || activeGeneration !== generation) return;
      synchronize();
    }, SESSION_UPDATE_INTERVAL);
  }

  function pause(): void {
    synchronize();
    stop();
  }

  function dispose(): void {
    stop();
    disposed = true;
  }

  return { start, synchronize, pause, stop, dispose };
}
