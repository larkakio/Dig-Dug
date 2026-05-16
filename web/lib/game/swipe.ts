import type { Direction } from "./types";

const MIN_SWIPE = 28;

export function directionFromSwipe(
  dx: number,
  dy: number,
  min = MIN_SWIPE,
): Direction | null {
  if (Math.abs(dx) < min && Math.abs(dy) < min) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

export interface SwipeTracker {
  startX: number;
  startY: number;
  active: boolean;
}

export function createSwipeTracker(): SwipeTracker {
  return { startX: 0, startY: 0, active: false };
}
