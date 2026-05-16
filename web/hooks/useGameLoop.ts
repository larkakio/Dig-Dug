"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cloneGameState,
  createInitialState,
  pumpAction,
  restartGame,
  tickGame,
  tryMovePlayer,
} from "@/lib/game/engine";
import type { Direction, GameState } from "@/lib/game/types";

export function useGameLoop() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const phaseRef = useRef(0);
  const moveQueueRef = useRef<Direction[]>([]);
  const pumpQueuedRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      phaseRef.current += dt;

      setState((prev) => {
        let next = cloneGameState(prev);

        while (moveQueueRef.current.length > 0) {
          const dir = moveQueueRef.current.shift()!;
          next = tryMovePlayer(next, dir);
        }

        if (pumpQueuedRef.current) {
          pumpQueuedRef.current = false;
          next = pumpAction(next);
        }

        return tickGame(next, dt);
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const move = useCallback((dir: Direction) => {
    moveQueueRef.current.push(dir);
  }, []);

  const pump = useCallback(() => {
    pumpQueuedRef.current = true;
  }, []);

  const restart = useCallback(() => {
    moveQueueRef.current = [];
    pumpQueuedRef.current = false;
    setState(restartGame());
  }, []);

  return {
    state,
    phase: phaseRef,
    move,
    pump,
    restart,
  };
}
