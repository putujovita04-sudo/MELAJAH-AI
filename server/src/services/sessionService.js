import crypto from "node:crypto";
import { ENV } from "../config/ai.js";
import {
  BOARD_SIZE,
  QUESTION_TILES,
  createBoardLayout,
  findBoardEffect,
  getTileRole,
} from "../../../shared/board.js";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  NAME_MAX_LENGTH,
  PLAYER_PALETTE,
} from "../../../shared/players.js";
import {
  clampScore,
  getOutcome,
  resolveBoardOutcome,
} from "../../../shared/scoreRules.js";
import { getBankQuestions } from "./questionService.js";
import { getMaterial } from "./materialStore.js";
import { judgeQuestion } from "./judgeService.js";
import { sanitizeComment } from "./fallbackJudge.js";
import {
  clearTimers,
  generateCode,
  getSession,
  normalizeCode,
  saveSession,
  touchSession,
} from "./sessionStore.js";
import { isSharedStoreEnabled } from "./redisStore.js";

const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};

const cleanName = (value) =>
  String(value ?? "")
    .replace(/[<>{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX_LENGTH);

const cloneQuestions = (questions) =>
  questions.map((question) => {
    const options = Array.isArray(question.options)
      ? shuffle([...new Set(question.options)])
      : undefined;
    return {
      ...question,
      options,
      keywords: Array.isArray(question.keywords) ? [...question.keywords] : [question.answer],
    };
  });

const addLog = (session, text, tone = "ink") => {
  session.logSeq = (session.logSeq ?? 0) + 1;
  session.log.push({
    id: `${Date.now()}-${session.logSeq}`,
    text,
    tone,
    at: Date.now(),
  });
  session.log = session.log.slice(-14);
};

const playerById = (session, playerId) =>
  session.players.find((player) => player.id === playerId) ?? null;

const currentPlayer = (session) =>
  playerById(session, session.order[session.currentIndex]) ?? null;

const nextPlayer = (session) => {
  if (!session.order.length) return null;
  const nextIndex = (session.currentIndex + 1) % session.order.length;
  return playerById(session, session.order[nextIndex]) ?? null;
};

const requireHost = (session, token) => {
  if (!token || token !== session.hostToken) {
    throw fail(403, "Token penyelenggara tidak valid.");
  }
};

const requireSession = (code) => {
  const session = getSession(code);
  if (!session) {
    throw fail(404, "Sesi tidak ditemukan. Periksa kode atau minta kode baru.");
  }
  return session;
};

const nextQuestion = (session) => {
  if (!session.questions.length) return null;
  if (session.deckIndex >= session.deck.length) {
    session.deck = shuffle(session.questions.map((question) => question.id));
    session.deckIndex = 0;
  }
  const questionId = session.deck[session.deckIndex];
  session.deckIndex += 1;
  return session.questions.find((question) => question.id === questionId) ?? null;
};

const prepareQuestions = ({ materialId, categories, difficulty }) => {
  if (materialId) {
    const material = getMaterial(materialId);
    if (!material) {
      throw fail(
        404,
        "Materi tidak ditemukan atau sudah kedaluwarsa. Buat soal materi lagi.",
      );
    }
    if (!Array.isArray(material.questions) || material.questions.length < 3) {
      throw fail(400, "Materi tidak memiliki cukup soal untuk sesi baru.");
    }
    return {
      questions: cloneQuestions(material.questions),
      sourceLabel: "Materi sendiri",
    };
  }

  let questions = getBankQuestions();
  const validCategories = Array.isArray(categories)
    ? categories.filter((category) => typeof category === "string")
    : [];
  if (validCategories.length > 0) {
    const filtered = questions.filter((question) =>
      validCategories.includes(question.category),
    );
    if (filtered.length < 5) {
      throw fail(400, "Pilih kategori lain — soal untuk kategori itu terlalu sedikit.");
    }
    questions = filtered;
  }

  if (difficulty === "mudah") {
    const easy = questions.filter((question) => question.difficulty === "mudah");
    if (easy.length >= 8) questions = easy;
  }

  if (questions.length < 5) {
    throw fail(400, "Bank soal tidak cukup untuk sesi ini.");
  }

  return {
    questions: cloneQuestions(questions),
    sourceLabel: "Bank soal budaya Bali",
  };
};

const publicQuestion = (question, tile) => {
  if (!question) return null;
  const { answer, keywords, explanation, ...rest } = question;
  return { ...rest, tile };
};

const hostQuestion = (question, tile) => (question ? { ...question, tile } : null);

const serialize = (session, { host = false } = {}) => {
  const current = currentPlayer(session);
  const question = session.currentQuestionId
    ? session.questions.find((item) => item.id === session.currentQuestionId) ?? null
    : null;
  const sanitizePlayer = ({ token, ...player }) => player;
  const winnerRaw = session.players.find((player) => player.id === session.winnerId) ?? null;
  const winner = winnerRaw ? sanitizePlayer(winnerRaw) : null;
  const ranking = [...session.players]
    .sort(
      (a, b) => b.position - a.position || b.score - a.score || a.name.localeCompare(b.name),
    )
    .map(sanitizePlayer);

  const state = {
    code: session.code,
    phase: session.phase,
    dice: session.dice,
    players: session.players.map(sanitizePlayer),
    order: [...session.order],
    currentIndex: session.currentIndex,
    currentPlayerId: current?.id ?? null,
    currentPlayerName: current?.name ?? null,
    maxPlayers: session.maxPlayers,
    minPlayers: MIN_PLAYERS,
    sourceLabel: session.sourceLabel,
    questionCount: session.questions.length,
    board: session.board,
    currentQuestion: host ? hostQuestion(question, session.currentTile) : publicQuestion(question, session.currentTile),
    currentAnswer: session.currentAnswer,
    verdict: session.verdict ? { ...session.verdict } : null,
    lastVerdict: session.lastVerdict ? { ...session.lastVerdict } : null,
    lastMove: session.lastMove ? { ...session.lastMove } : null,
    notice: session.notice,
    log: session.log.slice(-10),
    ranking,
    winnerId: session.winnerId,
    winner,
    turnNumber: session.turnNumber,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    autoAdvanceAt: session.autoAdvanceAt ?? null,
    serverTime: Date.now(),
  };

  if (host) {
    state.host = {
      canStart: session.phase === "lobby" && session.players.length >= MIN_PLAYERS,
      deckRemaining: Math.max(0, session.deck.length - session.deckIndex),
      verdictAutoMs: ENV.verdictAutoMs,
    };
  }

  return state;
};

const scheduleVerdict = (session) => {
  clearTimers(session);
  session.autoAdvanceAt = Date.now() + ENV.verdictAutoMs;

  // Di serverless, timer proses tidak bisa diandalkan: instance bisa mati
  // setelah request. Resolusi otomatis dilakukan lazy saat state dibaca.
  if (isSharedStoreEnabled()) return;

  const timer = setTimeout(() => {
    const live = getSession(session.code);
    if (live && live.phase === "verdict") {
      resolveVerdictInternal(live);
    }
  }, ENV.verdictAutoMs);
  timer.unref?.();
  session.verdictTimer = timer;
};

const advanceTurn = (session) => {
  if (!session.order.length) return;
  session.currentIndex = (session.currentIndex + 1) % session.order.length;
  session.phase = "ready";
  session.currentQuestionId = null;
  session.currentTile = null;
  session.currentAnswer = null;
  session.verdict = null;
  session.autoAdvanceAt = null;
  session.dice = null;
  session.turnNumber = (session.turnNumber ?? 0) + 1;
  clearTimers(session);
  const next = currentPlayer(session);
  session.notice = next
    ? `Giliran ${next.name}. Menunggu angka dadu dari penyelenggara.`
    : "Menunggu pemain berikutnya.";
  addLog(session, session.notice, "ink");
};

const finalizeSession = (session, winnerId, notice) => {
  clearTimers(session);
  session.phase = "finished";
  session.winnerId = winnerId;
  session.endedAt = Date.now();
  session.currentQuestionId = null;
  session.currentTile = null;
  session.currentAnswer = null;
  session.verdict = null;
  session.autoAdvanceAt = null;
  session.notice = notice;
  addLog(session, notice, "gold");
};

const resolveVerdictInternal = (session) => {
  if (session.phase !== "verdict" || !session.verdict) return session;
  clearTimers(session);

  const verdict = session.verdict;
  const player = playerById(session, verdict.playerId);
  if (!player) {
    advanceTurn(session);
    return session;
  }

  const resolution = resolveBoardOutcome({
    score: verdict.skor,
    position: player.position,
    board: session.board,
    boardSize: BOARD_SIZE,
  });

  const outcome = resolution.outcome;
  player.score += verdict.skor;
  player.stats[outcome] = (player.stats[outcome] ?? 0) + 1;
  player.stats.answered += 1;
  player.position = resolution.finalPosition;

  const effect = resolution.ladder
    ? { type: "ladder", from: resolution.ladder.from, to: resolution.ladder.to }
    : resolution.snake
      ? { type: "snake", from: resolution.snake.from, to: resolution.snake.to }
      : null;

  const scoreMessage = [
    `${player.name} mendapat skor ${verdict.skor}.`,
    resolution.steps > 0 ? `Bonus maju ${resolution.steps} petak.` : "",
    resolution.steps < 0 ? "Mundur 1 petak." : "",
    effect?.type === "ladder" ? `Naik tangga ke petak ${effect.to}.` : "",
    effect?.type === "snake" ? `Turun ular ke petak ${effect.to}.` : "",
    `Posisi akhir petak ${resolution.finalPosition}.`,
  ]
    .filter(Boolean)
    .join(" ");

  session.lastMove = {
    id: `score-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    dice: null,
    from: resolution.from,
    to: resolution.afterSteps,
    finalPosition: resolution.finalPosition,
    effect,
    kind: "score",
    outcome,
    message: scoreMessage,
    at: Date.now(),
  };
  session.lastVerdict = {
    ...verdict,
    outcome,
    finalPosition: resolution.finalPosition,
    resolvedAt: Date.now(),
  };
  session.verdict = null;
  session.currentQuestionId = null;
  session.currentTile = null;
  session.currentAnswer = null;

  addLog(session, scoreMessage, outcome === "correct" ? "teal" : outcome === "wrong" ? "accent" : "gold");

  if (resolution.finalPosition === BOARD_SIZE) {
    finalizeSession(
      session,
      player.id,
      `${player.name} mencapai petak FINISH 100 dan menjadi pemenang!`,
    );
    return session;
  }

  advanceTurn(session);
  session.notice = `Giliran ${currentPlayer(session)?.name ?? "pemain"}. Menunggu angka dadu dari penyelenggara.`;
  return session;
};

export const createSession = ({ maxPlayers, materialId, categories, difficulty }) => {
  const limit = Number(maxPlayers);
  if (!Number.isInteger(limit) || limit < MIN_PLAYERS || limit > MAX_PLAYERS) {
    throw fail(400, `Jumlah pemain harus ${MIN_PLAYERS}–${MAX_PLAYERS}.`);
  }

  const { questions, sourceLabel } = prepareQuestions({
    materialId,
    categories,
    difficulty,
  });

  const session = {
    code: generateCode(),
    hostToken: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    maxPlayers: limit,
    sourceLabel,
    board: createBoardLayout(),
    questions,
    deck: shuffle(questions.map((question) => question.id)),
    deckIndex: 0,
    players: [],
    order: [],
    currentIndex: 0,
    phase: "lobby",
    dice: null,
    currentQuestionId: null,
    currentTile: null,
    currentAnswer: null,
    verdict: null,
    lastVerdict: null,
    lastMove: null,
    verdictTimer: null,
    autoAdvanceAt: null,
    winnerId: null,
    startedAt: null,
    endedAt: null,
    turnNumber: 0,
    logSeq: 0,
    log: [],
    notice: "Bagikan kode atau QR kepada pemain untuk bergabung.",
  };

  addLog(session, "Sesi dibuat. Menunggu pemain bergabung.", "teal");
  saveSession(session);

  return {
    code: session.code,
    hostToken: session.hostToken,
    state: serialize(session, { host: true }),
  };
};

export const getPublicState = (code) => {
  const session = requireSession(code);
  return serialize(session);
};

export const getHostState = (code, token) => {
  const session = requireSession(code);
  requireHost(session, token);
  return serialize(session, { host: true });
};

export const joinSession = (code, rawName) => {
  const session = requireSession(code);
  if (session.phase !== "lobby") {
    throw fail(409, "Sesi sudah dimulai. Minta penyelenggara membuat sesi baru.");
  }
  if (session.players.length >= session.maxPlayers) {
    throw fail(409, "Sesi sudah penuh.");
  }

  const name = cleanName(rawName);
  if (name.length < 1) throw fail(400, "Nama panggilan wajib diisi.");
  if (session.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    throw fail(409, "Nama panggilan itu sudah dipakai. Coba nama lain.");
  }

  const usedColors = new Set(session.players.map((player) => player.color));
  const palette =
    PLAYER_PALETTE.find((item) => !usedColors.has(item.color)) ??
    PLAYER_PALETTE[session.players.length % PLAYER_PALETTE.length];

  const player = {
    id: `player-${crypto.randomUUID().slice(0, 8)}`,
    token: crypto.randomUUID(),
    name,
    color: palette.color,
    soft: palette.soft,
    gender: palette.gender,
    position: 1,
    score: 0,
    stats: { correct: 0, near: 0, wrong: 0, answered: 0 },
    joinedAt: Date.now(),
  };

  session.players.push(player);
  session.order.push(player.id);
  addLog(session, `${name} bergabung ke sesi.`, "teal");
  session.notice =
    session.players.length < session.maxPlayers
      ? `${name} bergabung. Menunggu ${session.maxPlayers - session.players.length} pemain lagi.`
      : "Semua pemain sudah bergabung. Penyelenggara dapat memulai permainan.";

  return {
    playerId: player.id,
    playerToken: player.token,
    state: serialize(session),
  };
};

export const startSession = (code, token) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "lobby") throw fail(409, "Sesi sudah dimulai.");
  if (session.players.length < MIN_PLAYERS) {
    throw fail(409, `Minimal ${MIN_PLAYERS} pemain untuk memulai.`);
  }

  session.phase = "ready";
  session.currentIndex = 0;
  session.startedAt = Date.now();
  session.turnNumber = 1;
  const first = currentPlayer(session);
  session.notice = `Permainan dimulai. Giliran ${first.name}. Menunggu angka dadu dari penyelenggara.`;
  addLog(session, session.notice, "gold");
  return serialize(session, { host: true });
};

export const giveDice = (code, token, rawValue) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "ready") {
    throw fail(409, "Dadu hanya bisa diberikan saat menunggu giliran.");
  }

  const player = currentPlayer(session);
  if (!player) throw fail(409, "Tidak ada pemain aktif.");

  const value = rawValue === null || rawValue === undefined ? 1 + Math.floor(Math.random() * 6) : Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw fail(400, "Angka dadu harus bilangan bulat 1–6.");
  }

  session.dice = value;
  session.lastVerdict = null;
  session.verdict = null;
  session.currentQuestionId = null;
  session.currentTile = null;
  session.currentAnswer = null;

  const from = player.position;
  const to = Math.min(BOARD_SIZE, from + value);
  player.position = to;
  const move = {
    id: `dice-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    dice: value,
    from,
    to,
    finalPosition: to,
    effect: null,
    kind: "dice",
    message: `${player.name} mendapat dadu ${value} dan berjalan ke petak ${to}.`,
    at: Date.now(),
  };
  session.lastMove = move;
  addLog(session, `${player.name} mendapat angka dadu ${value}.`, "teal");

  if (to === BOARD_SIZE) {
    finalizeSession(
      session,
      player.id,
      `${player.name} mencapai petak FINISH 100 dan menjadi pemenang!`,
    );
    return serialize(session, { host: true });
  }

  if (QUESTION_TILES.includes(to)) {
    const question = nextQuestion(session);
    if (question) {
      session.currentQuestionId = question.id;
      session.currentTile = to;
      session.phase = "question";
      session.notice = `Petak ${to}: ${player.name} harus menjawab soal budaya Bali.`;
      addLog(session, session.notice, "accent");
      return serialize(session, { host: true });
    }
  }

  const effect = findBoardEffect(session.board, to);
  if (effect) {
    player.position = effect.to;
    move.effect = effect;
    move.finalPosition = effect.to;
    move.message =
      effect.type === "ladder"
        ? `${player.name} mendapat dadu ${value} dan naik tangga dari petak ${effect.from} ke ${effect.to}.`
        : `${player.name} mendapat dadu ${value} dan turun ular dari petak ${effect.from} ke ${effect.to}.`;
    addLog(session, move.message, effect.type === "ladder" ? "teal" : "accent");
  } else {
    move.message = `${player.name} mendapat dadu ${value} dan berhenti di petak ${to}.`;
  }

  if (player.position === BOARD_SIZE) {
    finalizeSession(
      session,
      player.id,
      `${player.name} mencapai petak FINISH 100 dan menjadi pemenang!`,
    );
    return serialize(session, { host: true });
  }

  const next = nextPlayer(session);
  advanceTurn(session);
  session.notice = `${move.message} Giliran ${next?.name ?? "pemain berikutnya"}.`;
  addLog(session, session.notice, "ink");
  return serialize(session, { host: true });
};

const applyJudgeSuccess = (live, { player, safeAnswer, question, result }) => {
  if (!live || live.phase !== "judging") return;
  const outcome = getOutcome(result.skor);
  live.verdict = {
    playerId: player.id,
    playerName: player.name,
    skor: clampScore(result.skor),
    komentar: sanitizeComment(result.komentar),
    source: result.source,
    answer: safeAnswer,
    kunci: result.kunci ?? question.answer,
    penjelasan: result.penjelasan ?? question.explanation ?? "",
    outcome: outcome.id,
    at: Date.now(),
  };
  live.phase = "verdict";
  live.notice = `${player.name} mendapat skor ${live.verdict.skor}. Penyelenggara dapat meninjau hasil.`;
  addLog(
    live,
    `${player.name} mendapat skor ${live.verdict.skor} (${outcome.label}).`,
    outcome.tone,
  );
  scheduleVerdict(live);
};

const applyJudgeFailure = (live, { player, safeAnswer, question, error }) => {
  if (!live || live.phase !== "judging") return;
  live.verdict = {
    playerId: player.id,
    playerName: player.name,
    skor: 0,
    komentar:
      "Penilaian otomatis sedang bermasalah. Penyelenggara dapat memberi nilai manual.",
    source: "manual",
    answer: safeAnswer,
    kunci: question.answer,
    penjelasan: question.explanation ?? "",
    outcome: "wrong",
    at: Date.now(),
  };
  live.phase = "verdict";
  live.notice = "Penilaian AI gagal. Penyelenggara dapat memberi nilai manual.";
  addLog(live, live.notice, "accent");
  scheduleVerdict(live);
  console.warn("[MELAJAH] Penilaian gagal:", error.code ?? error.message);
};

export const submitAnswer = async (code, { playerId, playerToken, answer }) => {
  const session = requireSession(code);
  if (session.phase !== "question") {
    throw fail(409, "Tidak ada pertanyaan yang menunggu jawaban.");
  }

  const player = playerById(session, playerId);
  if (!player || !playerToken || player.token !== playerToken) {
    throw fail(403, "Hanya pemain yang sedang mendapat giliran yang bisa menjawab.");
  }
  if (currentPlayer(session)?.id !== player.id) {
    throw fail(403, "Ini bukan giliranmu.");
  }

  const safeAnswer = String(answer ?? "").trim().slice(0, 500);
  if (!safeAnswer) throw fail(400, "Jawaban tidak boleh kosong.");

  const question = session.questions.find(
    (item) => item.id === session.currentQuestionId,
  );
  if (!question) throw fail(409, "Soal tidak ditemukan.");

  session.currentAnswer = safeAnswer;
  session.phase = "judging";
  session.notice = `Jawaban ${player.name} sedang dinilai Juri AI...`;
  addLog(session, `${player.name} mengirim jawaban.`, "sky");

  const sessionCode = session.code;
  const context = { player, safeAnswer, question };

  if (isSharedStoreEnabled()) {
    // Serverless: selesaikan penilaian sebelum response, supaya hasilnya
    // ikut tersimpan ke shared store dalam request yang sama.
    try {
      const result = await judgeQuestion(question, safeAnswer);
      applyJudgeSuccess(getSession(sessionCode), { ...context, result });
    } catch (error) {
      applyJudgeFailure(getSession(sessionCode), { ...context, error });
    }
  } else {
    judgeQuestion(question, safeAnswer)
      .then((result) => applyJudgeSuccess(getSession(sessionCode), { ...context, result }))
      .catch((error) => applyJudgeFailure(getSession(sessionCode), { ...context, error }));
  }

  return serialize(session);
};

export const skipQuestion = (code, token) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "question") {
    throw fail(409, "Tidak ada soal yang bisa dilewati.");
  }
  const player = currentPlayer(session);
  const question = session.questions.find((item) => item.id === session.currentQuestionId);
  if (!player || !question) throw fail(409, "Soal tidak ditemukan.");

  session.verdict = {
    playerId: player.id,
    playerName: player.name,
    skor: 0,
    komentar: "Soal dilewati. Jangan menyerah, coba soal berikutnya, ya!",
    source: "manual",
    answer: "(dilewati)",
    kunci: question.answer,
    penjelasan: question.explanation ?? "",
    outcome: "wrong",
    at: Date.now(),
  };
  session.phase = "verdict";
  session.notice = `Soal ${player.name} dilewati oleh penyelenggara dengan nilai 0.`;
  addLog(session, session.notice, "accent");
  scheduleVerdict(session);
  return serialize(session, { host: true });
};

export const overrideVerdict = (code, token, { score, comment }) => {  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "verdict" || !session.verdict) {
    throw fail(409, "Tidak ada hasil penilaian yang bisa diubah.");
  }

  const safeScore = clampScore(score);
  session.verdict.skor = safeScore;
  session.verdict.outcome = getOutcome(safeScore).id;
  session.verdict.source = "manual";
  session.verdict.komentar = sanitizeComment(
    comment,
    "Nilai diberikan oleh penyelenggara.",
  );
  session.verdict.manual = true;
  session.notice = `Nilai ${session.verdict.playerName} diubah penyelenggara menjadi ${safeScore}.`;
  addLog(session, session.notice, "gold");
  scheduleVerdict(session);
  return serialize(session, { host: true });
};

export const resolveVerdict = (code, token) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "verdict") {
    throw fail(409, "Belum ada hasil penilaian untuk dilanjutkan.");
  }
  resolveVerdictInternal(session);
  return serialize(session, { host: true });
};

/**
 * Dipakai serverless: menggantikan setTimeout yang tidak tahan antar-request.
 * Mengembalikan true kalau ada perubahan yang perlu disimpan.
 */
export const resolveDueVerdict = (code) => {
  const session = getSession(code);
  if (!session || session.phase !== "verdict" || !session.autoAdvanceAt) return false;
  if (Date.now() < session.autoAdvanceAt) return false;
  resolveVerdictInternal(session);
  return true;
};

export const endSession = (code, token) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase === "finished") return serialize(session, { host: true });
  if (!session.players.length) throw fail(409, "Belum ada pemain di sesi ini.");

  const leader = [...session.players].sort(
    (a, b) => b.position - a.position || b.score - a.score,
  )[0];
  finalizeSession(
    session,
    leader.id,
    `Sesi diakhiri penyelenggara. ${leader.name} memimpin dengan posisi petak ${leader.position}.`,
  );
  return serialize(session, { host: true });
};

export const removePlayer = (code, token, playerId) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "lobby") {
    throw fail(409, "Pemain hanya bisa dihapus sebelum permainan dimulai.");
  }
  const player = playerById(session, playerId);
  if (!player) throw fail(404, "Pemain tidak ditemukan.");

  session.players = session.players.filter((item) => item.id !== playerId);
  session.order = session.order.filter((id) => id !== playerId);
  addLog(session, `${player.name} dihapus dari sesi.`, "accent");
  session.notice = `${player.name} dihapus dari sesi.`;
  return serialize(session, { host: true });
};

export const reorderPlayers = (code, token, order) => {
  const session = requireSession(code);
  requireHost(session, token);
  if (session.phase !== "lobby") {
    throw fail(409, "Urutan giliran hanya bisa diubah sebelum permainan dimulai.");
  }
  const ids = Array.isArray(order) ? order.filter((id) => typeof id === "string") : [];
  const currentIds = new Set(session.players.map((player) => player.id));
  if (ids.length !== currentIds.size || ids.some((id) => !currentIds.has(id))) {
    throw fail(400, "Urutan pemain tidak valid.");
  }
  session.order = ids;
  session.notice = `Urutan giliran diperbarui: ${ids
    .map((id) => playerById(session, id)?.name)
    .filter(Boolean)
    .join(" → ")}.`;
  addLog(session, session.notice, "teal");
  return serialize(session, { host: true });
};
