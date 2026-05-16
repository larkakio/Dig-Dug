export const COLS = 16;
export const ROWS = 12;

export enum Tile {
  Surface = 0,
  Dirt = 1,
  Empty = 2,
  Rock = 3,
}

export type Direction = "up" | "down" | "left" | "right";

export type EnemyType = "pooka" | "fygar";

export type GamePhase =
  | "playing"
  | "levelComplete"
  | "gameOver"
  | "paused";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  dir: Direction;
  alive: boolean;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  dir: Direction;
  inflate: number;
  mode: "normal" | "ghost";
  alive: boolean;
  fireCooldown: number;
}

export interface FallingRock {
  x: number;
  y: number;
  vy: number;
  timer: number;
}

export interface GameState {
  tiles: Tile[][];
  player: Player;
  enemies: Enemy[];
  fallingRocks: FallingRock[];
  unstableRocks: Set<string>;
  score: number;
  lives: number;
  levelIndex: number;
  phase: GamePhase;
  phaseTimer: number;
  pumpTargetId: number | null;
  pumpProgress: number;
  particles: Particle[];
  message: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface LevelDef {
  name: string;
  map: string[];
  enemies: { type: EnemyType; x: number; y: number }[];
  ghostSpeed: number;
  enemySpeed: number;
}
