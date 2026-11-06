import {
  BOARD_SIZE,
  QUESTION_TILES,
  createBoardLayout,
  findBoardEffect,
} from "../../../shared/board.js";
import {
  clampScore,
  getOutcome,
  resolveBoardOutcome,
} from "../../../shared/scoreRules.js";
import {
  NAME_MAX_LENGTH,
  PLAYER_PALETTE,
} from "../../../shared/players.js";
import { ALL_QUESTIONS } from "./questions";

const STORE_KEY = "melajah-local-sessions-v1";
const TTL_MS = 6 * 60 * 60 * 1000;
const AUTO_ADVANCE_MS = 10000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    let changed = false;
    for (const [code, session] of Object.entries(data)) {
      if (now - session.updatedAt > TTL_MS) {
        delete data[code];
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
};

const writeAll = (data) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
};

const saveSession = (session) => {
  const data = readAll();
  session.updatedAt = Date.now();
  data[session.code] = session;
  writeAll(data);
};

const getSession = (code) => {
  const data = readAll();
  return data[String(code ?? "").toUpperCase()] ?? null;
};

const generateCode = () => {
  const data = readAll();
  for (let attempt = 0; attempt < 300; attempt += 1) {
    let code = "";
    for (let index = 0; index < 5; index += 1) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!data[code]) return code;
  }
  throw new Error("Gagal membuat kode sesi demo.");
};

const addLog = (session, text, tone = "ink") => {
  session.logSeq = (session.logSeq ?? 0) + 1;
  session.log.push({ id: `${Date.now()}-${session.logSeq}`, text, tone, at: Date.now() });
  session.log = session.log.slice(-14);
};

const requireSession = (code) => {
  const session = getSession(code);
  if (!session) {
    throw new Error(
      "Room demo tidak ditemukan di browser ini. Buat sesi baru dari layar penyelenggara, atau pakai room server agar pemain di HP bisa bergabung.",
    );
  }
  return session;
};

const requireHost = (session, token) => {
  if (!token || token !== session.hostToken) {
    throw new Error("Token penyelenggara tidak valid.");
  }
};

const currentPlayer = (session) =>
  session.players.find((player) => player.id === session.order[session.currentIndex]) ?? null;

const playerById = (session, playerId) =>
  session.players.find((player) => player.id === playerId) ?? null;

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

const prepareQuestions = ({ categories, difficulty }) => {
  let pool = ALL_QUESTIONS;
  if (Array.isArray(categories) && categories.length > 0) {
    const filtered = pool.filter((question) => categories.includes(question.category));
    if (filtered.length >= 5) pool = filtered;
  }
  if (difficulty === "mudah") {
    const easy = pool.filter((question) => question.difficulty === "mudah");
    if (easy.length >= 8) pool = easy;
  }
  return shuffle(pool).map((question) => ({
    ...question,
    options: question.options ? shuffle([...question.options]) : undefined,
    keywords: Array.isArray(question.keywords) ? [...question.keywords] : [question.answer],
  }));
};

const prepareMaterialQuestions = (items) =>
  shuffle(
    items
      .filter((question) => question && question.question && question.answer)
      .map((question, index) => ({
        ...question,
        id: question.id || `mat-local-${index + 1}`,
        category: question.category || "materi",
        categoryLabel: question.categoryLabel || "Materi Sendiri",
        options:
          Array.isArray(question.options) && question.options.length > 0
            ? shuffle([...question.options])
            : undefined,
        keywords:
          Array.isArray(question.keywords) && question.keywords.length > 0
            ? [...question.keywords]
            : [question.answer],
        explanation:
          question.explanation || `Jawaban yang tepat adalah ${question.answer}.`,
      })),
  );

const evaluateLocal = (question, answer) => {
  const safe = String(answer ?? "").trim();
  if (question.type === "pilihan") {
    const correct = normalize(safe) === normalize(question.answer);
    return {
      skor: correct ? 100 : 0,
      source: "kunci",
      komentar: correct
        ? "Tepat sekali! Kamu memilih jawaban yang benar."
        : `Belum tepat. Jawaban yang benar adalah ${question.answer}.`,
    };
  }

  const answerNorm = normalize(safe);
  const keyNorm = normalize(question.answer);
  const keywords = question.keywords ?? [];
  const keywordHit = keywords.some((keyword) =>
    answerNorm.includes(normalize(keyword)),
  );

  if (!answerNorm) {
    return { skor: 0, source: "lokal", komentar: "Jawabanmu masih kosong. Coba tulis lagi, ya!" };
  }
  if (answerNorm === keyNorm) {
    return { skor: 100, source: "lokal", komentar: "Sempurna! Jawabanmu benar sekali." };
  }
  if (keyNorm.length >= 3 && answerNorm.includes(keyNorm)) {
    return { skor: 95, source: "lokal", komentar: "Hebat! Jawaban kamu benar." };
  }
  if (keywordHit) {
    return {
      skor: 88,
      source: "lokal",
      komentar: "Bagus! Jawabanmu sudah mengarah ke hal yang tepat.",
    };
  }
  const keyTokens = keyNorm.split(" ").filter((token) => token.length > 2);
  const answerTokens = new Set(answerNorm.split(" "));
  const matched = keyTokens.filter((token) => answerTokens.has(token)).length;
  if (keyTokens.length > 0 && matched / keyTokens.length >= 0.5) {
    return {
      skor: 65,
      source: "lokal",
      komentar: "Hampir benar! Ada bagian penting yang perlu dilengkapi.",
    };
  }
  if (matched > 0) {
    return {
      skor: 45,
      source: "lokal",
      komentar: "Sudah ada kata yang berkaitan, tetapi belum cukup tepat.",
    };
  }
  return {
    skor: 15,
    source: "lokal",
    komentar: `Belum tepat. Jawaban yang dicari adalah ${question.answer}.`,
  };
};

const publicQuestion = (question, tile) => {
  if (!question) return null;
  const { answer, keywords, explanation, ...rest } = question;
  return { ...rest, tile };
};

const serialize = (session, host = false) => {
  const question = session.currentQuestionId
    ? session.questions.find((item) => item.id === session.currentQuestionId) ?? null
    : null;
  const sanitize = ({ token, ...player }) => player;
  const current = currentPlayer(session);
  const ranking = [...session.players]
    .sort((a, b) => b.position - a.position || b.score - a.score || a.name.localeCompare(b.name))
    .map(sanitize);
  const winnerRaw = session.players.find((player) => player.id === session.winnerId) ?? null;
  const winner = winnerRaw ? sanitize(winnerRaw) : null;

  const state = {
    localMode: true,
    minPlayers: 1,
    code: session.code,
    phase: session.phase,
    dice: session.dice,
    players: session.players.map(sanitize),
    order: [...session.order],
    currentIndex: session.currentIndex,
    currentPlayerId: current?.id ?? null,
    currentPlayerName: current?.name ?? null,
    maxPlayers: session.maxPlayers,
    sourceLabel: session.sourceLabel,
    questionCount: session.questions.length,
    board: session.board,
    currentQuestion: host
      ? question
        ? { ...question, tile: session.currentTile }
        : null
      : publicQuestion(question, session.currentTile),
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
      localMode: true,
      canStart: session.phase === "lobby" && session.players.length >= 1,
      deckRemaining: Math.max(0, session.deck.length - session.deckIndex),
      verdictAutoMs: AUTO_ADVANCE_MS,
    };
  }
  return state;
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
  const next = currentPlayer(session);
  session.notice = next
    ? `Giliran ${next.name}. Menunggu angka dadu dari penyelenggara.`
    : "Menunggu pemain berikutnya.";
  addLog(session, session.notice, "ink");
};

const finalize = (session, winnerId, notice) => {
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

const resolveInternal = (session) => {
  if (session.phase !== "verdict" || !session.verdict) return;
  const verdict = session.verdict;
  const player = playerById(session, verdict.playerId);
  if (!player) {
    advanceTurn(session);
    return;
  }
  const resolution = resolveBoardOutcome({
    score: verdict.skor,
    position: player.position,
    board: session.board,
    boardSize: BOARD_SIZE,
  });
  player.score += verdict.skor;
  player.stats[resolution.outcome] = (player.stats[resolution.outcome] ?? 0) + 1;
  player.stats.answered += 1;
  player.position = resolution.finalPosition;

  const effect = resolution.ladder
    ? { type: "ladder", from: resolution.ladder.from, to: resolution.ladder.to }
    : resolution.snake
      ? { type: "snake", from: resolution.snake.from, to: resolution.snake.to }
      : null;

  const message = [
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
    outcome: resolution.outcome,
    message,
    at: Date.now(),
  };
  session.lastVerdict = {
    ...verdict,
    outcome: resolution.outcome,
    finalPosition: resolution.finalPosition,
    resolvedAt: Date.now(),
  };
  session.verdict = null;
  session.currentQuestionId = null;
  session.currentTile = null;
  session.currentAnswer = null;
  addLog(session, message, resolution.outcome === "correct" ? "teal" : resolution.outcome === "wrong" ? "accent" : "gold");

  if (resolution.finalPosition === BOARD_SIZE) {
    finalize(session, player.id, `${player.name} mencapai FINISH 100 dan menjadi juara!`);
    return;
  }
  advanceTurn(session);
};

const maybeFinalize = (session) => {
  let changed = false;
  if (session.phase === "judging" && session.judgingAt && Date.now() - session.judgingAt > 450) {
    const question = session.questions.find((item) => item.id === session.currentQuestionId);
    const player = currentPlayer(session);
    if (question && player) {
      const result = evaluateLocal(question, session.currentAnswer);
      const outcome = getOutcome(result.skor);
      session.verdict = {
        playerId: player.id,
        playerName: player.name,
        skor: clampScore(result.skor),
        komentar: result.komentar,
        source: result.source,
        answer: session.currentAnswer,
        kunci: question.answer,
        penjelasan: question.explanation ?? "",
        outcome: outcome.id,
        at: Date.now(),
      };
      session.phase = "verdict";
      session.autoAdvanceAt = Date.now() + AUTO_ADVANCE_MS;
      session.judgingAt = null;
      session.notice = `${player.name} mendapat skor ${session.verdict.skor}. Penyelenggara dapat meninjau hasil.`;
      addLog(session, session.notice, outcome.tone);
      changed = true;
    }
  }
  if (session.phase === "verdict" && session.autoAdvanceAt && Date.now() >= session.autoAdvanceAt) {
    resolveInternal(session);
    changed = true;
  }
  return changed;
};

const hostState = (session) => ({ state: serialize(session, true) });
const publicState = (session) => ({ state: serialize(session) });

export const createLocalSession = ({
  maxPlayers,
  materialId,
  materialQuestions,
  categories,
  difficulty,
}) => {
  const limit = Number(maxPlayers);
  if (![2, 3, 4].includes(limit)) {
    throw new Error("Jumlah pemain harus 2–4.");
  }

  const hasMaterial = Array.isArray(materialQuestions) && materialQuestions.length > 0;
  if (materialId && !hasMaterial) {
    throw new Error("Soal materi tidak ditemukan. Buat soal lagi, ya.");
  }

  const questions = hasMaterial
    ? prepareMaterialQuestions(materialQuestions)
    : prepareQuestions({ categories, difficulty });
  const minimum = hasMaterial ? 3 : 5;
  if (questions.length < minimum) {
    throw new Error(
      hasMaterial
        ? "Materi tidak memiliki cukup soal untuk sesi ini."
        : "Bank soal tidak cukup untuk sesi ini.",
    );
  }

  const session = {
    localMode: true,
    code: generateCode(),
    hostToken: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    maxPlayers: limit,
    sourceLabel: hasMaterial ? "Materi sendiri" : "Bank soal budaya Bali",
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
    autoAdvanceAt: null,
    judgingAt: null,
    winnerId: null,
    startedAt: null,
    endedAt: null,
    turnNumber: 0,
    logSeq: 0,
    log: [],
    notice: "Mode demo lokal: bagikan kode ke tab pemain di browser ini.",
  };
  addLog(
    session,
    `Sesi demo lokal dibuat dari ${hasMaterial ? "materi sendiri" : "bank soal"}.`,
    "teal",
  );
  saveSession(session);
  return {
    code: session.code,
    hostToken: session.hostToken,
    state: serialize(session, true),
  };
};

export const hasLocalSession = (code) => Boolean(getSession(code));

export const getLocalState = (code, hostToken = null) => {
  const session = requireSession(code);
  maybeFinalize(session);
  saveSession(session);
  if (hostToken) {
    requireHost(session, hostToken);
    return hostState(session);
  }
  return publicState(session);
};

export const joinLocalSession = (code, rawName) => {
  const session = requireSession(code);
  maybeFinalize(session);
  if (session.phase !== "lobby") {
    throw new Error("Sesi sudah dimulai. Minta penyelenggara membuat sesi baru.");
  }
  if (session.players.length >= session.maxPlayers) throw new Error("Sesi sudah penuh.");
  const name = cleanName(rawName);
  if (!name) throw new Error("Nama panggilan wajib diisi.");
  if (session.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Nama panggilan itu sudah dipakai. Coba nama lain.");
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
  session.notice = `${name} bergabung ke sesi demo.`;
  addLog(session, session.notice, "teal");
  saveSession(session);
  return {
    playerId: player.id,
    playerToken: player.token,
    state: serialize(session),
  };
};

export const addLocalPlayer = (code, hostToken, rawName) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "lobby") {
    throw new Error("Pemain hanya bisa ditambahkan sebelum permainan dimulai.");
  }
  if (session.players.length >= session.maxPlayers) throw new Error("Sesi sudah penuh.");
  const name = cleanName(rawName);
  if (!name) throw new Error("Nama panggilan wajib diisi.");
  if (session.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Nama panggilan itu sudah dipakai.");
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
  session.notice = `${name} ditambahkan ke sesi demo satu layar.`;
  addLog(session, session.notice, "teal");
  saveSession(session);
  return hostState(session);
};

export const startLocalSession = (code, hostToken) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "lobby") throw new Error("Sesi sudah dimulai.");
  if (!session.players.length) throw new Error("Minimal 1 pemain untuk mode demo.");
  session.phase = "ready";
  session.currentIndex = 0;
  session.startedAt = Date.now();
  session.turnNumber = 1;
  session.notice = `Permainan demo dimulai. Giliran ${currentPlayer(session).name}. Tunggu angka dadu dari penyelenggara.`;
  addLog(session, session.notice, "gold");
  saveSession(session);
  return hostState(session);
};

export const sendLocalDice = (code, hostToken, rawValue) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "ready") throw new Error("Dadu hanya bisa diberikan saat menunggu giliran.");
  const player = currentPlayer(session);
  if (!player) throw new Error("Tidak ada pemain aktif.");
  const value = rawValue === null || rawValue === undefined
    ? 1 + Math.floor(Math.random() * 6)
    : Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw new Error("Angka dadu harus 1–6.");
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
    finalize(session, player.id, `${player.name} mencapai FINISH 100 dan menjadi juara!`);
    saveSession(session);
    return hostState(session);
  }

  if (QUESTION_TILES.includes(to)) {
    const question = nextQuestion(session);
    if (question) {
      session.currentQuestionId = question.id;
      session.currentTile = to;
      session.phase = "question";
      session.notice = `Petak ${to}: ${player.name} harus menjawab soal budaya Bali.`;
      addLog(session, session.notice, "accent");
      saveSession(session);
      return hostState(session);
    }
  }

  const effect = findBoardEffect(session.board, to);
  if (effect) {
    player.position = effect.to;
    move.effect = effect;
    move.finalPosition = effect.to;
    move.message =
      effect.type === "ladder"
        ? `${player.name} naik tangga dari petak ${effect.from} ke ${effect.to}.`
        : `${player.name} turun ular dari petak ${effect.from} ke ${effect.to}.`;
    addLog(session, move.message, effect.type === "ladder" ? "teal" : "accent");
  }

  if (player.position === BOARD_SIZE) {
    finalize(session, player.id, `${player.name} mencapai FINISH 100 dan menjadi juara!`);
    saveSession(session);
    return hostState(session);
  }

  advanceTurn(session);
  session.notice = `${move.message} ${session.notice}`;
  saveSession(session);
  return hostState(session);
};

export const answerLocalQuestion = (code, { playerId, playerToken, answer }) => {
  const session = requireSession(code);
  maybeFinalize(session);
  if (session.phase !== "question") throw new Error("Tidak ada pertanyaan yang menunggu jawaban.");
  const player = playerById(session, playerId);
  if (!player || !playerToken || player.token !== playerToken) {
    throw new Error("Hanya pemain yang sedang mendapat giliran yang bisa menjawab.");
  }
  if (currentPlayer(session)?.id !== player.id) throw new Error("Ini bukan giliranmu.");
  const safeAnswer = String(answer ?? "").trim().slice(0, 500);
  if (!safeAnswer) throw new Error("Jawaban tidak boleh kosong.");
  session.currentAnswer = safeAnswer;
  session.phase = "judging";
  session.judgingAt = Date.now();
  session.notice = `Jawaban ${player.name} sedang dinilai...`;
  addLog(session, `${player.name} mengirim jawaban.`, "sky");
  saveSession(session);
  return publicState(session);
};

export const answerLocalAsHost = (code, hostToken, answer) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "question") {
    throw new Error("Tidak ada pertanyaan yang menunggu jawaban.");
  }
  const player = currentPlayer(session);
  if (!player) throw new Error("Tidak ada pemain aktif.");
  const safeAnswer = String(answer ?? "").trim().slice(0, 500);
  if (!safeAnswer) throw new Error("Jawaban tidak boleh kosong.");
  session.currentAnswer = safeAnswer;
  session.phase = "judging";
  session.judgingAt = Date.now();
  session.notice = `Jawaban ${player.name} sedang dinilai...`;
  addLog(session, `Penyelenggara mencatat jawaban ${player.name}.`, "sky");
  saveSession(session);
  return hostState(session);
};

export const skipLocalQuestion = (code, hostToken) => {  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "question") throw new Error("Tidak ada soal yang bisa dilewati.");
  const player = currentPlayer(session);
  const question = session.questions.find((item) => item.id === session.currentQuestionId);
  if (!player || !question) throw new Error("Soal tidak ditemukan.");
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
  session.autoAdvanceAt = Date.now() + AUTO_ADVANCE_MS;
  session.notice = `Soal ${player.name} dilewati dengan nilai 0.`;
  addLog(session, session.notice, "accent");
  saveSession(session);
  return hostState(session);
};

export const overrideLocalVerdict = (code, hostToken, { score, comment }) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "verdict" || !session.verdict) {
    throw new Error("Tidak ada hasil penilaian yang bisa diubah.");
  }
  const safeScore = clampScore(score);
  session.verdict.skor = safeScore;
  session.verdict.outcome = getOutcome(safeScore).id;
  session.verdict.source = "manual";
  session.verdict.komentar = String(comment ?? "").trim().slice(0, 200) || "Nilai diberikan oleh penyelenggara.";
  session.verdict.manual = true;
  session.autoAdvanceAt = Date.now() + AUTO_ADVANCE_MS;
  session.notice = `Nilai ${session.verdict.playerName} diubah menjadi ${safeScore}.`;
  addLog(session, session.notice, "gold");
  saveSession(session);
  return hostState(session);
};

export const resolveLocalVerdict = (code, hostToken) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "verdict") throw new Error("Belum ada hasil penilaian untuk dilanjutkan.");
  resolveInternal(session);
  saveSession(session);
  return hostState(session);
};

export const endLocalSession = (code, hostToken) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase === "finished") return hostState(session);
  if (!session.players.length) throw new Error("Belum ada pemain di sesi ini.");
  const leader = [...session.players].sort(
    (a, b) => b.position - a.position || b.score - a.score,
  )[0];
  finalize(
    session,
    leader.id,
    `Sesi demo diakhiri. ${leader.name} memimpin di petak ${leader.position}.`,
  );
  saveSession(session);
  return hostState(session);
};

export const removeLocalPlayer = (code, hostToken, playerId) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "lobby") throw new Error("Pemain hanya bisa dihapus sebelum mulai.");
  const player = playerById(session, playerId);
  if (!player) throw new Error("Pemain tidak ditemukan.");
  session.players = session.players.filter((item) => item.id !== playerId);
  session.order = session.order.filter((id) => id !== playerId);
  session.notice = `${player.name} dihapus dari sesi demo.`;
  addLog(session, session.notice, "accent");
  saveSession(session);
  return hostState(session);
};

export const reorderLocalPlayers = (code, hostToken, order) => {
  const session = requireSession(code);
  maybeFinalize(session);
  requireHost(session, hostToken);
  if (session.phase !== "lobby") throw new Error("Urutan hanya bisa diubah sebelum mulai.");
  const ids = Array.isArray(order) ? order.filter((id) => typeof id === "string") : [];
  const currentIds = new Set(session.players.map((player) => player.id));
  if (ids.length !== currentIds.size || ids.some((id) => !currentIds.has(id))) {
    throw new Error("Urutan pemain tidak valid.");
  }
  session.order = ids;
  session.notice = `Urutan giliran diperbarui: ${ids
    .map((id) => playerById(session, id)?.name)
    .filter(Boolean)
    .join(" → ")}.`;
  addLog(session, session.notice, "teal");
  saveSession(session);
  return hostState(session);
};
