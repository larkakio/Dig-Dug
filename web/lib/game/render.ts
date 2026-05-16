import { COLS, ROWS, Tile, type GameState } from "./types";

const COLORS = {
  void: "#050508",
  dirt: "#1a0a2e",
  dirtGlow: "#3d1a6e",
  tunnel: "#0a0a14",
  tunnelEdge: "#00f5ff",
  surface: "#12121f",
  rock: "#6666cc",
  rockGlow: "#aaaaff",
  player: "#b8ff00",
  playerGlow: "#e8ff80",
  pooka: "#00f5ff",
  fygar: "#ff00aa",
  pump: "#ffaa00",
};

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cell: number,
  phase: number,
) {
  const w = COLS * cell;
  const h = ROWS * cell;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = state.tiles[y][x];
      const px = x * cell;
      const py = y * cell;

      if (t === Tile.Dirt) {
        const pulse = 0.5 + 0.5 * Math.sin(phase * 2 + x * 0.3 + y * 0.2);
        ctx.fillStyle = COLORS.dirt;
        ctx.fillRect(px, py, cell, cell);
        ctx.strokeStyle = `rgba(61, 26, 110, ${0.3 + pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 2, cell - 4, cell - 4);
        drawHex(ctx, px + cell / 2, py + cell / 2, cell * 0.35, COLORS.dirtGlow, 0.15 + pulse * 0.1);
      } else if (t === Tile.Empty || t === Tile.Surface) {
        ctx.fillStyle = t === Tile.Surface ? COLORS.surface : COLORS.tunnel;
        ctx.fillRect(px, py, cell, cell);
        const edgePulse = 0.4 + 0.6 * Math.sin(phase * 3 + x + y);
        ctx.strokeStyle = `rgba(0, 245, 255, ${t === Tile.Surface ? 0.5 : 0.12 * edgePulse})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
      } else if (t === Tile.Rock) {
        drawRock(ctx, px, py, cell, phase);
      }
    }
  }

  for (const rock of state.fallingRocks) {
    drawRock(ctx, rock.x * cell, rock.y * cell, cell, phase + 1);
  }

  for (const e of state.enemies) {
    if (!e.alive) continue;
    drawEnemy(ctx, e.x * cell, e.y * cell, cell, e.type, e.inflate, e.mode, phase);
  }

  if (state.player.alive) {
    drawPlayer(ctx, state.player.x * cell, state.player.y * cell, cell, state.player.dir, phase);
  }

  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x * cell, p.y * cell, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  alpha: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRock(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: number,
  phase: number,
) {
  const cx = px + cell / 2;
  const cy = py + cell / 2;
  const pulse = 0.7 + 0.3 * Math.sin(phase * 4);
  ctx.shadowBlur = 12 * pulse;
  ctx.shadowColor = COLORS.rockGlow;
  ctx.fillStyle = COLORS.rock;
  ctx.beginPath();
  ctx.moveTo(cx, py + 4);
  ctx.lineTo(px + cell - 4, cy + 4);
  ctx.lineTo(cx + 4, py + cell - 4);
  ctx.lineTo(px + 6, cy);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: number,
  dir: string,
  phase: number,
) {
  const cx = px + cell / 2;
  const cy = py + cell / 2;
  ctx.shadowBlur = 16;
  ctx.shadowColor = COLORS.playerGlow;
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.32, 0, Math.PI * 2);
  ctx.fill();
  const deltas: Record<string, [number, number]> = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };
  const d = deltas[dir] ?? [0, 1];
  ctx.strokeStyle = COLORS.playerGlow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + d[0] * cell * 0.35, cy + d[1] * cell * 0.35);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: number,
  type: "pooka" | "fygar",
  inflate: number,
  mode: string,
  phase: number,
) {
  const cx = px + cell / 2;
  const cy = py + cell / 2;
  const color = type === "fygar" ? COLORS.fygar : COLORS.pooka;
  const scale = 0.28 + inflate * 0.06;
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.globalAlpha = mode === "ghost" ? 0.55 : 1;
  ctx.fillStyle = color;
  if (type === "pooka") {
    ctx.beginPath();
    ctx.arc(cx, cy, cell * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 4, cy - 2, 3, 3);
    ctx.fillRect(cx + 1, cy - 2, 3, 3);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - cell * scale, cy);
    ctx.lineTo(cx, cy - cell * scale * 0.8);
    ctx.lineTo(cx + cell * scale, cy);
    ctx.lineTo(cx, cy + cell * scale * 0.5);
    ctx.closePath();
    ctx.fill();
    const flicker = Math.sin(phase * 8) > 0 ? 1 : 0.6;
    ctx.strokeStyle = `rgba(255, 100, 0, ${flicker})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}
