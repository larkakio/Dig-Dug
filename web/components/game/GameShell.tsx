"use client";

import { useEffect } from "react";
import { GameCanvas } from "./GameCanvas";
import { useGameLoop } from "@/hooks/useGameLoop";
import { getLevel } from "@/lib/game/levels";
import type { Direction, GameState } from "@/lib/game/types";

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export function GameShell() {
  const { state, phase, move, pump, restart } = useGameLoop();
  const level = getLevel(state.levelIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        pump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, pump]);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-2 pb-4">
      <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-[0.04]" aria-hidden />

      <div className="flex w-full max-w-lg items-center justify-between gap-2 font-mono text-xs uppercase tracking-widest">
        <HudChip label="Level" value={String(state.levelIndex + 1)} accent="cyan" />
        <HudChip label="Score" value={String(state.score)} accent="lime" />
        <HudChip label="Lives" value={"♥".repeat(Math.max(0, state.lives))} accent="magenta" />
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
        {level.name}
      </p>

      <div className="relative flex w-full max-w-lg flex-1 items-center justify-center min-h-[280px]">
        <GameCanvas state={state} phaseRef={phase} onMove={move} onPump={pump} />
        <Overlay state={state} onRestart={restart} />
      </div>

      <div className="flex w-full max-w-lg gap-2">
        <button
          type="button"
          onClick={pump}
          className="neon-btn flex-1 rounded-lg border border-amber-400/60 bg-amber-500/10 py-3 font-mono text-sm uppercase tracking-wider text-amber-300"
        >
          Pump
        </button>
      </div>

      <p className="max-w-xs text-center font-mono text-[10px] text-white/40">
        Swipe or drag on field · Arrow keys on desktop · Tap to pump
      </p>
    </div>
  );
}

function HudChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "lime" | "magenta";
}) {
  const border =
    accent === "cyan"
      ? "border-cyan-400/50 text-cyan-300"
      : accent === "lime"
        ? "border-lime-400/50 text-lime-300"
        : "border-fuchsia-400/50 text-fuchsia-300";
  return (
    <div className={`flex-1 rounded-md border bg-black/50 px-2 py-1.5 backdrop-blur ${border}`}>
      <span className="block text-[9px] opacity-60">{label}</span>
      <span className="block text-sm font-bold">{value}</span>
    </div>
  );
}

function Overlay({
  state,
  onRestart,
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const blocksInput =
    state.phase === "levelComplete" ||
    state.phase === "gameOver" ||
    state.phase === "paused";

  if (!blocksInput) return null;

  const glitch = state.phase === "levelComplete";

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-black/70 backdrop-blur-sm">
      <p
        className={`font-mono text-lg font-bold uppercase tracking-widest ${
          glitch ? "glitch-text text-lime-300" : "text-fuchsia-300"
        }`}
      >
        {state.message || state.phase}
      </p>
      {state.phase === "gameOver" && (
        <button
          type="button"
          onClick={onRestart}
          className="neon-btn mt-4 rounded-lg border border-cyan-400/60 px-6 py-2 font-mono text-sm uppercase text-cyan-300"
        >
          Restart
        </button>
      )}
    </div>
  );
}
