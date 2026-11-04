/**
 * Aturan skor — SATU sumber untuk client dan server.
 */
export const SCORE_RULES = {
  correct: {
    id: "correct",
    label: "Benar",
    min: 80,
    max: 100,
    bonusSteps: 2,
    allowLadder: true,
    allowSnake: false,
    tone: "teal",
  },
  near: {
    id: "near",
    label: "Hampir benar",
    min: 50,
    max: 79,
    bonusSteps: 0,
    allowLadder: true,
    allowSnake: false,
    tone: "gold",
  },
  wrong: {
    id: "wrong",
    label: "Belum tepat",
    min: 0,
    max: 49,
    bonusSteps: -1,
    allowLadder: false,
    allowSnake: true,
    tone: "accent",
  },
};

export const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

export const getOutcome = (score) => {
  const safe = clampScore(score);
  if (safe >= SCORE_RULES.correct.min) return SCORE_RULES.correct;
  if (safe >= SCORE_RULES.near.min) return SCORE_RULES.near;
  return SCORE_RULES.wrong;
};

/**
 * Urutan: skor -> bonus/penalti -> tangga/ular -> posisi akhir.
 * Tangga dan ular tidak pernah aktif bersamaan.
 */
export const resolveBoardOutcome = ({ score, position, board, boardSize = 100 }) => {
  const rule = getOutcome(score);
  const start = Math.max(1, Math.min(boardSize, Number(position) || 1));
  const afterSteps = Math.max(1, Math.min(boardSize, start + rule.bonusSteps));

  let ladder = null;
  let snake = null;

  if (rule.allowLadder) {
    ladder = (board?.ladders ?? []).find((item) => item.from === afterSteps) ?? null;
  }
  if (ladder) {
    const next = ladder.to;
    if (rule.allowSnake) {
      snake = (board?.snakes ?? []).find((item) => item.from === next) ?? null;
    }
  } else if (rule.allowSnake) {
    snake = (board?.snakes ?? []).find((item) => item.from === afterSteps) ?? null;
  }

  const finalPosition = Math.max(
    1,
    Math.min(boardSize, snake ? snake.to : ladder ? ladder.to : afterSteps),
  );

  return {
    outcome: rule.id,
    rule,
    steps: rule.bonusSteps,
    from: start,
    afterSteps,
    ladder,
    snake,
    finalPosition,
    won: finalPosition === boardSize,
  };
};

export const SCORE_TABLE = [SCORE_RULES.correct, SCORE_RULES.near, SCORE_RULES.wrong];
