import { COLS, ROWS, type LevelDef } from "./types";

const BASE: string[] = [
  "SSSSSSSSSSSSSSSS",
  "#..............#",
  "#..####..####..#",
  "#..............#",
  "#....####......#",
  "#..............#",
  "#..####..####..#",
  "#..............#",
  "#....####......#",
  "#..............#",
  "#..............#",
  "#..............#",
];

function mapWithRocks(rocks: [number, number][]): string[] {
  const rows = BASE.map((r) => r.split(""));
  for (const [x, y] of rocks) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) rows[y][x] = "R";
  }
  return rows.map((r) => r.join(""));
}

export const LEVELS: LevelDef[] = [
  {
    name: "Neon Depths I",
    map: mapWithRocks([[8, 4]]),
    enemies: [
      { type: "pooka", x: 3, y: 5 },
      { type: "pooka", x: 12, y: 7 },
    ],
    ghostSpeed: 0.015,
    enemySpeed: 0.04,
  },
  {
    name: "Neon Depths II",
    map: mapWithRocks([
      [6, 3],
      [10, 6],
    ]),
    enemies: [
      { type: "pooka", x: 2, y: 4 },
      { type: "pooka", x: 13, y: 5 },
      { type: "fygar", x: 8, y: 8 },
    ],
    ghostSpeed: 0.02,
    enemySpeed: 0.05,
  },
  {
    name: "Neon Depths III",
    map: mapWithRocks([
      [4, 4],
      [11, 4],
      [8, 7],
    ]),
    enemies: [
      { type: "pooka", x: 2, y: 6 },
      { type: "fygar", x: 14, y: 6 },
      { type: "pooka", x: 7, y: 9 },
      { type: "fygar", x: 5, y: 3 },
    ],
    ghostSpeed: 0.025,
    enemySpeed: 0.055,
  },
  {
    name: "Neon Depths IV",
    map: mapWithRocks([
      [5, 3],
      [10, 3],
      [7, 6],
      [9, 9],
    ]),
    enemies: [
      { type: "fygar", x: 3, y: 5 },
      { type: "pooka", x: 12, y: 4 },
      { type: "pooka", x: 8, y: 7 },
      { type: "fygar", x: 14, y: 8 },
    ],
    ghostSpeed: 0.03,
    enemySpeed: 0.06,
  },
  {
    name: "Neon Depths V",
    map: mapWithRocks([
      [4, 3],
      [12, 3],
      [6, 6],
      [10, 6],
      [8, 9],
    ]),
    enemies: [
      { type: "pooka", x: 2, y: 4 },
      { type: "pooka", x: 13, y: 5 },
      { type: "fygar", x: 7, y: 7 },
      { type: "fygar", x: 10, y: 4 },
      { type: "pooka", x: 5, y: 10 },
    ],
    ghostSpeed: 0.035,
    enemySpeed: 0.065,
  },
];

export function getLevel(index: number): LevelDef {
  const i = index % LEVELS.length;
  const base = LEVELS[i];
  const cycle = Math.floor(index / LEVELS.length);
  return {
    ...base,
    name: cycle > 0 ? `${base.name} +${cycle}` : base.name,
    ghostSpeed: base.ghostSpeed + cycle * 0.005,
    enemySpeed: base.enemySpeed + cycle * 0.005,
  };
}
