export const BOARD_COLS = 10;
export const BOARD_ROWS = 10;
export const BOARD_SIZE = 100;
export const START_TILE = 1;
export const FINISH_TILE = 100;
export const LADDER_COUNT = 15;
export const SNAKE_COUNT = 15;

/** 20 petak soal yang tersebar, bukan START/FINISH. */
export const QUESTION_TILES = [
  4, 8, 13, 17, 22, 27, 31, 36, 40, 45,
  50, 54, 59, 63, 68, 73, 77, 82, 87, 92,
];

const SPECIAL_TILES = new Set([START_TILE, FINISH_TILE, ...QUESTION_TILES]);

const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

const makeRng = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const pickLadder = (rng, used) => {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const from = randomInt(rng, 2, 89);
    const to = from + randomInt(rng, 6, 18);
    if (to > 99) continue;
    if (SPECIAL_TILES.has(from) || SPECIAL_TILES.has(to)) continue;
    if (used.has(from) || used.has(to)) continue;
    return { from, to };
  }
  return null;
};

const pickSnake = (rng, used) => {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const from = randomInt(rng, 12, 99);
    const to = from - randomInt(rng, 6, 18);
    if (to < 2) continue;
    if (SPECIAL_TILES.has(from) || SPECIAL_TILES.has(to)) continue;
    if (used.has(from) || used.has(to)) continue;
    return { from, to };
  }
  return null;
};

const buildLayout = (rng) => {
  const used = new Set();
  const ladders = [];
  const snakes = [];

  for (let index = 0; index < LADDER_COUNT; index += 1) {
    const ladder = pickLadder(rng, used);
    if (!ladder) return null;
    used.add(ladder.from);
    used.add(ladder.to);
    ladders.push(ladder);
  }

  for (let index = 0; index < SNAKE_COUNT; index += 1) {
    const snake = pickSnake(rng, used);
    if (!snake) return null;
    used.add(snake.from);
    used.add(snake.to);
    snakes.push(snake);
  }

  return {
    ladders: ladders.sort((a, b) => a.from - b.from),
    snakes: snakes.sort((a, b) => b.from - a.from),
  };
};

/** Layout cadangan deterministik, selalu valid. */
export const FALLBACK_BOARD = (() => {
  for (let seed = 1; seed < 200; seed += 1) {
    const layout = buildLayout(makeRng(seed));
    if (layout) return layout;
  }
  return { ladders: [], snakes: [] };
})();

/**
 * 15 tangga + 15 ular. Semua titik awal/akhir unik, tidak menyentuh
 * START, FINISH, atau petak soal. Posisi tetap selama satu sesi.
 */
export const createBoardLayout = (rng = Math.random) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const layout = buildLayout(rng);
    if (layout) return layout;
  }
  return {
    ladders: FALLBACK_BOARD.ladders.map((item) => ({ ...item })),
    snakes: FALLBACK_BOARD.snakes.map((item) => ({ ...item })),
  };
};

export const findBoardEffect = (board, tile) => {
  const ladder = (board?.ladders ?? []).find((item) => item.from === tile);
  if (ladder) return { type: "ladder", ...ladder };
  const snake = (board?.snakes ?? []).find((item) => item.from === tile);
  if (snake) return { type: "snake", ...snake };
  return null;
};

export const getTileRole = (tile) => {
  if (tile === START_TILE) return "start";
  if (tile === FINISH_TILE) return "finish";
  if (QUESTION_TILES.includes(tile)) return "question";
  return "normal";
};

export const getTileEndpointRole = (board, tile) => {
  if ((board?.ladders ?? []).some((item) => item.from === tile || item.to === tile)) {
    return "ladder";
  }
  if ((board?.snakes ?? []).some((item) => item.from === tile || item.to === tile)) {
    return "snake";
  }
  return null;
};

export const getBoardSize = () => BOARD_SIZE;
