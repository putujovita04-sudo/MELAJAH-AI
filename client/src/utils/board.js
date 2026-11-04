import { BOARD_COLS } from "../config/boardConfig";

export { BOARD_COLS };

export const tileToGrid = (tile, cols = BOARD_COLS) => {
  const index = Math.max(0, Number(tile) - 1);
  const row = Math.floor(index / cols);
  const offset = index % cols;
  const col = row % 2 === 0 ? offset : cols - 1 - offset;
  return { col, row, gridRow: cols - row };
};

export const tileCenter = (tile, cols = BOARD_COLS, canvas = 1000) => {
  const { col, row } = tileToGrid(tile, cols);
  return {
    x: ((col + 0.5) / cols) * canvas,
    y: ((cols - row - 0.5) / cols) * canvas,
  };
};

export const tilePercent = (tile, cols = BOARD_COLS) => {
  const { col, row } = tileToGrid(tile, cols);
  return {
    left: ((col + 0.5) / cols) * 100,
    top: ((cols - row - 0.5) / cols) * 100,
  };
};

/** Offset kecil agar beberapa bidak bisa berdiri di petak yang sama. */
export const pawnOffsets = (indexInTile, totalInTile, cols = BOARD_COLS) => {
  const unit = 100 / cols;
  if (totalInTile <= 1) return { x: 0, y: 0 };
  const layout = {
    1: [{ x: 0, y: 0 }],
    2: [
      { x: -unit * 0.27, y: 0 },
      { x: unit * 0.27, y: 0 },
    ],
    3: [
      { x: 0, y: -unit * 0.26 },
      { x: -unit * 0.27, y: unit * 0.2 },
      { x: unit * 0.27, y: unit * 0.2 },
    ],
    4: [
      { x: -unit * 0.26, y: -unit * 0.32 },
      { x: unit * 0.26, y: -unit * 0.32 },
      { x: -unit * 0.26, y: unit * 0.32 },
      { x: unit * 0.26, y: unit * 0.32 },
    ],
  };
  const slots = layout[Math.min(4, totalInTile)] ?? layout[4];
  return slots[indexInTile % slots.length];
};

export const ladderGeometry = (fromTile, toTile, cols = BOARD_COLS) => {
  const start = tileCenter(fromTile, cols);
  const end = tileCenter(toTile, cols);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const railOffset = 5.5;
  const rungs = [];
  const count = Math.max(4, Math.round(length / 42));
  for (let index = 1; index < count; index += 1) {
    const t = index / count;
    const cx = start.x + dx * t;
    const cy = start.y + dy * t;
    rungs.push({
      x1: cx + nx * railOffset,
      y1: cy + ny * railOffset,
      x2: cx - nx * railOffset,
      y2: cy - ny * railOffset,
    });
  }
  return {
    start,
    end,
    railOffset,
    rails: [
      {
        x1: start.x + nx * railOffset,
        y1: start.y + ny * railOffset,
        x2: end.x + nx * railOffset,
        y2: end.y + ny * railOffset,
      },
      {
        x1: start.x - nx * railOffset,
        y1: start.y - ny * railOffset,
        x2: end.x - nx * railOffset,
        y2: end.y - ny * railOffset,
      },
    ],
    rungs,
  };
};

export const snakeGeometry = (fromTile, toTile, cols = BOARD_COLS) => {
  const head = tileCenter(fromTile, cols);
  const tail = tileCenter(toTile, cols);
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const wobble = Math.min(32, length * 0.18);

  const p1 = {
    x: head.x + dx * 0.28 + nx * wobble,
    y: head.y + dy * 0.28 + ny * wobble,
  };
  const p2 = {
    x: head.x + dx * 0.66 - nx * wobble,
    y: head.y + dy * 0.66 - ny * wobble,
  };
  const p3 = {
    x: head.x + dx * 0.84 + nx * wobble * 0.45,
    y: head.y + dy * 0.84 + ny * wobble * 0.45,
  };

  return {
    head,
    tail,
    path: `M ${head.x} ${head.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${tail.x} ${tail.y}`,
    accentPath: `M ${head.x} ${head.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
  };
};

export const describeEffect = (effect) => {
  if (!effect) return "";
  return effect.type === "ladder"
    ? `Naik tangga dari petak ${effect.from} ke petak ${effect.to}!`
    : `Aduh, turun ular dari petak ${effect.from} ke petak ${effect.to}.`;
};
