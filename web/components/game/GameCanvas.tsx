"use client";

import { useCallback, useEffect, useRef } from "react";
import { COLS, ROWS, type GameState } from "@/lib/game/types";
import { renderGame } from "@/lib/game/render";
import {
  createSwipeTracker,
  directionFromSwipe,
} from "@/lib/game/swipe";
import type { Direction } from "@/lib/game/types";

interface GameCanvasProps {
  state: GameState;
  phaseRef: React.MutableRefObject<number>;
  onMove: (dir: Direction) => void;
  onPump: () => void;
}

export function GameCanvas({
  state,
  phaseRef,
  onMove,
  onPump,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellRef = useRef(24);
  const trackerRef = useRef(createSwipeTracker());
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const onMoveRef = useRef(onMove);
  const onPumpRef = useRef(onPump);

  onMoveRef.current = onMove;
  onPumpRef.current = onPump;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const maxW = parent.clientWidth;
      const maxH = parent.clientHeight;
      const cell = Math.floor(
        Math.min(maxW / COLS, maxH / ROWS, 48),
      );
      cellRef.current = Math.max(16, cell);
      canvas.width = COLS * cellRef.current;
      canvas.height = ROWS * cellRef.current;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      renderGame(ctx, state, cellRef.current, phaseRef.current);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [state, phaseRef]);

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const finishGesture = useCallback((clientX: number, clientY: number) => {
    if (!trackerRef.current.active) return;
    const dx = clientX - trackerRef.current.startX;
    const dy = clientY - trackerRef.current.startY;
    trackerRef.current.active = false;

    const dir = directionFromSwipe(dx, dy);
    if (dir) {
      onMoveRef.current(dir);
    } else if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      onPumpRef.current();
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state.phase !== "playing") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    trackerRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      active: true,
    };
    longPressRef.current = setTimeout(() => {
      onPumpRef.current();
      trackerRef.current.active = false;
    }, 450);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    clearLongPress();
    finishGesture(e.clientX, e.clientY);
    pointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    clearLongPress();
    trackerRef.current.active = false;
    pointerIdRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    if (!trackerRef.current.active) return;
    const dx = e.clientX - trackerRef.current.startX;
    const dy = e.clientY - trackerRef.current.startY;
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
      clearLongPress();
    }
    const dir = directionFromSwipe(dx, dy, 28);
    if (dir) {
      onMoveRef.current(dir);
      trackerRef.current.startX = e.clientX;
      trackerRef.current.startY = e.clientY;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="touch-none mx-auto block cursor-grab rounded-lg border border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.15)] active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerMove={handlePointerMove}
      aria-label="Dig Dug playfield — swipe or drag to move, tap to pump"
    />
  );
}
