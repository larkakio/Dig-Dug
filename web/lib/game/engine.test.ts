import { describe, expect, it } from "vitest";
import {
  createInitialState,
  pumpAction,
  tryMovePlayer,
  tickGame,
} from "./engine";

describe("level progression", () => {
  it("advances to level 2 when all enemies are eliminated", () => {
    let state = createInitialState(0);

    for (const enemy of state.enemies) {
      state.player.x = enemy.x - 1;
      state.player.y = enemy.y;
      for (let i = 0; i < 4; i++) {
        state = pumpAction(state);
      }
    }

    expect(state.enemies.every((e) => !e.alive)).toBe(true);

    state = tickGame(state, 0.05);
    expect(state.phase).toBe("levelComplete");

    for (let t = 0; t < 40; t++) {
      state = tickGame(state, 0.05);
    }

    expect(state.levelIndex).toBe(1);
    expect(state.phase).toBe("playing");
  });

  it("digs dirt when moving into a dirt tile", () => {
    let state = createInitialState(0);
    state.player.x = 5;
    state.player.y = 2;
    state = tryMovePlayer(state, "left");
    expect(state.player.x).toBe(4);
    expect(state.score).toBeGreaterThanOrEqual(10);
  });
});
