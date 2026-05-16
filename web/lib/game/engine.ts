import { getLevel } from "./levels";
import {
  COLS,
  ROWS,
  Tile,
  type Direction,
  type Enemy,
  type GameState,
  type LevelDef,
  type Vec2,
} from "./types";

let enemyIdCounter = 0;

const DIR_DELTA: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function key(x: number, y: number) {
  return `${x},${y}`;
}

function parseTile(c: string): Tile {
  switch (c) {
    case "S":
      return Tile.Surface;
    case ".":
      return Tile.Empty;
    case "R":
      return Tile.Rock;
    default:
      return Tile.Dirt;
  }
}

function inBounds(x: number, y: number) {
  return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

function isWalkable(t: Tile) {
  return t === Tile.Empty || t === Tile.Surface;
}

function manhattan(a: Vec2, b: Vec2) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function parseLevel(level: LevelDef): GameState {
  const tiles: Tile[][] = level.map.map((row) =>
    row.split("").map(parseTile),
  );
  const player = { x: 8, y: 1, dir: "down" as Direction, alive: true };
  const enemies: Enemy[] = level.enemies.map((e) => ({
    id: enemyIdCounter++,
    type: e.type,
    x: e.x,
    y: e.y,
    dir: "left" as Direction,
    inflate: 0,
    mode: "normal" as const,
    alive: true,
    fireCooldown: 0,
  }));

  return {
    tiles,
    player,
    enemies,
    fallingRocks: [],
    unstableRocks: new Set(),
    score: 0,
    lives: 3,
    levelIndex: 0,
    phase: "playing",
    phaseTimer: 0,
    pumpTargetId: null,
    pumpProgress: 0,
    particles: [],
    message: "",
  };
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    tiles: state.tiles.map((row) => [...row]),
    player: { ...state.player },
    enemies: state.enemies.map((e) => ({ ...e })),
    fallingRocks: state.fallingRocks.map((r) => ({ ...r })),
    unstableRocks: new Set(state.unstableRocks),
    particles: state.particles.map((p) => ({ ...p })),
  };
}

export function createInitialState(levelIndex = 0): GameState {
  const state = parseLevel(getLevel(levelIndex));
  state.levelIndex = levelIndex;
  return state;
}

export function loadLevel(state: GameState, levelIndex: number): GameState {
  const next = parseLevel(getLevel(levelIndex));
  next.levelIndex = levelIndex;
  next.score = state.score;
  next.lives = state.lives;
  next.phase = "playing";
  next.message = "";
  return next;
}

function tileAt(state: GameState, x: number, y: number): Tile | null {
  if (!inBounds(x, y)) return null;
  return state.tiles[y][x];
}

function setTile(state: GameState, x: number, y: number, t: Tile) {
  if (inBounds(x, y)) state.tiles[y][x] = t;
}

function markRockSupport(state: GameState) {
  state.unstableRocks.clear();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (state.tiles[y][x] !== Tile.Rock) continue;
      const below = tileAt(state, x, y + 1);
      if (below === Tile.Empty || below === Tile.Dirt) {
        state.unstableRocks.add(key(x, y));
      }
    }
  }
}

function spawnParticles(
  state: GameState,
  x: number,
  y: number,
  color: string,
  n = 8,
) {
  for (let i = 0; i < n; i++) {
    state.particles.push({
      x: x + 0.5,
      y: y + 0.5,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 0.5 + Math.random() * 0.4,
      color,
    });
  }
}

function killEnemy(state: GameState, enemy: Enemy, points: number) {
  enemy.alive = false;
  state.score += points;
  spawnParticles(state, enemy.x, enemy.y, enemy.type === "fygar" ? "#ff00aa" : "#00f5ff");
}

function hurtPlayer(state: GameState) {
  if (!state.player.alive) return;
  state.player.alive = false;
  state.lives -= 1;
  spawnParticles(state, state.player.x, state.player.y, "#ffaa00", 12);
  if (state.lives <= 0) {
    state.phase = "gameOver";
    state.message = "GAME OVER";
  } else {
    state.phase = "paused";
    state.phaseTimer = 1.2;
    state.message = "HIT!";
  }
}

function enemyAt(state: GameState, x: number, y: number) {
  return state.enemies.find(
    (e) => e.alive && e.x === x && e.y === y && e.inflate < 3,
  );
}

function alignPumpTarget(state: GameState): Enemy | null {
  const { x: px, y: py } = state.player;
  for (const e of state.enemies) {
    if (!e.alive || e.inflate >= 4) continue;
    if (e.x === px || e.y === py) {
      const sameRow = e.y === py;
      const sameCol = e.x === px;
      if (sameRow || sameCol) {
        let blocked = false;
        if (sameRow) {
          const min = Math.min(px, e.x);
          const max = Math.max(px, e.x);
          for (let x = min + 1; x < max; x++) {
            const t = tileAt(state, x, py);
            if (t === Tile.Dirt || t === Tile.Rock) blocked = true;
          }
        } else {
          const min = Math.min(py, e.y);
          const max = Math.max(py, e.y);
          for (let y = min + 1; y < max; y++) {
            const t = tileAt(state, px, y);
            if (t === Tile.Dirt || t === Tile.Rock) blocked = true;
          }
        }
        if (!blocked) return e;
      }
    }
  }
  return null;
}

export function tryMovePlayer(state: GameState, dir: Direction): GameState {
  if (state.phase !== "playing" || !state.player.alive) return state;

  const d = DIR_DELTA[dir];
  const nx = state.player.x + d.x;
  const ny = state.player.y + d.y;
  if (!inBounds(nx, ny)) return state;

  const target = tileAt(state, nx, ny)!;
  state.player.dir = dir;

  if (target === Tile.Dirt) {
    setTile(state, nx, ny, Tile.Empty);
    state.score += 10;
    state.player.x = nx;
    state.player.y = ny;
    markRockSupport(state);
    return state;
  }

  if (isWalkable(target)) {
    const foe = enemyAt(state, nx, ny);
    if (foe && foe.inflate < 3) {
      hurtPlayer(state);
      return state;
    }
    state.player.x = nx;
    state.player.y = ny;
    return state;
  }

  return state;
}

export function pumpAction(state: GameState): GameState {
  if (state.phase !== "playing" || !state.player.alive) return state;

  const target = alignPumpTarget(state);
  if (!target) return state;

  target.inflate += 1;
  state.pumpTargetId = target.id;
  state.pumpProgress = target.inflate;

  if (target.inflate >= 4) {
    const pts = target.type === "fygar" ? 600 : 400;
    killEnemy(state, target, pts);
    state.pumpTargetId = null;
    state.pumpProgress = 0;
  }

  checkLevelComplete(state);
  return state;
}

function checkLevelComplete(state: GameState) {
  if (state.enemies.every((e) => !e.alive)) {
    state.phase = "levelComplete";
    state.phaseTimer = 1.8;
    state.message = `LEVEL ${state.levelIndex + 1} CLEARED`;
    spawnParticles(state, COLS / 2, ROWS / 2, "#b8ff00", 20);
  }
}

function bfsNextStep(
  state: GameState,
  from: Vec2,
  to: Vec2,
  throughDirt: boolean,
): Direction | null {
  const queue: { x: number; y: number; first: Direction | null }[] = [
    { x: from.x, y: from.y, first: null },
  ];
  const seen = new Set([key(from.x, from.y)]);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === to.x && cur.y === to.y && cur.first) return cur.first;

    for (const dir of ["up", "down", "left", "right"] as Direction[]) {
      const d = DIR_DELTA[dir];
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (!inBounds(nx, ny)) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      const t = tileAt(state, nx, ny)!;
      if (t === Tile.Rock) continue;
      const pass = isWalkable(t) || (throughDirt && t === Tile.Dirt);
      if (!pass) continue;
      seen.add(k);
      queue.push({
        x: nx,
        y: ny,
        first: cur.first ?? dir,
      });
    }
  }
  return null;
}

function moveEnemy(state: GameState, enemy: Enemy, dt: number, level: LevelDef) {
  if (!enemy.alive) return;

  const player = state.player;
  if (!player.alive) return;

  const dist = manhattan(enemy, player);
  if (dist <= 1 && enemy.inflate < 3) {
    hurtPlayer(state);
    return;
  }

  let step = bfsNextStep(
    state,
    { x: enemy.x, y: enemy.y },
    { x: player.x, y: player.y },
    false,
  );

  if (!step) {
    enemy.mode = "ghost";
    step = bfsNextStep(
      state,
      { x: enemy.x, y: enemy.y },
      { x: player.x, y: player.y },
      true,
    );
  } else {
    enemy.mode = "normal";
  }

  if (!step) return;

  const speed =
    enemy.mode === "ghost" ? level.ghostSpeed : level.enemySpeed;
  if (Math.random() > speed * dt * 60) return;

  const d = DIR_DELTA[step];
  const nx = enemy.x + d.x;
  const ny = enemy.y + d.y;
  const t = tileAt(state, nx, ny);
  if (!t) return;

  if (enemy.mode === "ghost" && t === Tile.Dirt) {
    setTile(state, nx, ny, Tile.Empty);
  }

  if (isWalkable(tileAt(state, nx, ny)!) || (enemy.mode === "ghost" && t === Tile.Dirt)) {
    if (nx === player.x && ny === player.y && enemy.inflate < 3) {
      hurtPlayer(state);
      return;
    }
    if (!enemyAt(state, nx, ny)) {
      enemy.x = nx;
      enemy.y = ny;
      enemy.dir = step;
    }
  }

  if (
    enemy.type === "fygar" &&
    enemy.fireCooldown <= 0 &&
    (enemy.x === player.x || enemy.y === player.y)
  ) {
    let clear = true;
    if (enemy.x === player.x) {
      const min = Math.min(enemy.y, player.y);
      const max = Math.max(enemy.y, player.y);
      for (let y = min + 1; y < max; y++) {
        const tt = tileAt(state, enemy.x, y);
        if (tt === Tile.Dirt || tt === Tile.Rock) clear = false;
      }
    } else {
      const min = Math.min(enemy.x, player.x);
      const max = Math.max(enemy.x, player.x);
      for (let x = min + 1; x < max; x++) {
        const tt = tileAt(state, x, enemy.y);
        if (tt === Tile.Dirt || tt === Tile.Rock) clear = false;
      }
    }
    if (clear && dist <= 4) {
      hurtPlayer(state);
      enemy.fireCooldown = 2;
      spawnParticles(state, player.x, player.y, "#ff4400", 6);
    }
  }
}

function updateRocks(state: GameState, dt: number) {
  for (const k of [...state.unstableRocks]) {
    const [xs, ys] = k.split(",");
    const x = Number(xs);
    const y = Number(ys);
    if (state.tiles[y]?.[x] !== Tile.Rock) {
      state.unstableRocks.delete(k);
      continue;
    }
    const below = tileAt(state, x, y + 1);
    if (below === Tile.Empty) {
      state.fallingRocks.push({ x, y, vy: 0, timer: 0.3 });
      state.unstableRocks.delete(k);
      setTile(state, x, y, Tile.Empty);
    }
  }

  const remaining: typeof state.fallingRocks = [];
  for (const rock of state.fallingRocks) {
    rock.timer -= dt;
    if (rock.timer > 0) {
      remaining.push(rock);
      continue;
    }
    const ny = rock.y + 1;
    if (!inBounds(rock.x, ny)) {
      continue;
    }
    const below = tileAt(state, rock.x, ny);
    if (below === Tile.Empty) {
      rock.y = ny;
      rock.timer = 0.15;
      remaining.push(rock);
      continue;
    }
    if (below === Tile.Dirt) {
      setTile(state, rock.x, ny, Tile.Rock);
      setTile(state, rock.x, ny - 1, Tile.Empty);
      const foe = enemyAt(state, rock.x, ny);
      if (foe) killEnemy(state, foe, 1000);
      if (state.player.x === rock.x && state.player.y === ny) hurtPlayer(state);
      spawnParticles(state, rock.x, ny, "#8888ff", 10);
      markRockSupport(state);
      continue;
    }
    if (below === Tile.Rock || below === Tile.Surface) {
      setTile(state, rock.x, rock.y, Tile.Rock);
      markRockSupport(state);
    }
  }
  state.fallingRocks = remaining;
}

function deflateEnemies(state: GameState, dt: number) {
  for (const e of state.enemies) {
    if (!e.alive || e.inflate <= 0) continue;
    if (state.pumpTargetId === e.id) continue;
    e.inflate = Math.max(0, e.inflate - dt * 0.5);
  }
}

export function tickGame(state: GameState, dt: number): GameState {
  const level = getLevel(state.levelIndex);

  state.particles = state.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);

  if (state.phase === "levelComplete") {
    state.phaseTimer -= dt;
    if (state.phaseTimer <= 0) {
      return loadLevel(state, state.levelIndex + 1);
    }
    return state;
  }

  if (state.phase === "gameOver") return state;

  if (state.phase === "paused") {
    state.phaseTimer -= dt;
    if (state.phaseTimer <= 0) {
      state.phase = "playing";
      state.player.alive = true;
      state.player.x = 8;
      state.player.y = 1;
      state.message = "";
    }
    return state;
  }

  for (const e of state.enemies) {
    if (e.fireCooldown > 0) e.fireCooldown -= dt;
    moveEnemy(state, e, dt, level);
  }

  deflateEnemies(state, dt);
  updateRocks(state, dt);
  checkLevelComplete(state);

  return state;
}

export function restartGame(): GameState {
  enemyIdCounter = 0;
  return createInitialState(0);
}
