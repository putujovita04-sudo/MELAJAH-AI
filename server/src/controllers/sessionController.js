import {
  createSession,
  endSession,
  getHostState,
  getPublicState,
  giveDice,
  joinSession,
  overrideVerdict,
  removePlayer,
  reorderPlayers,
  resolveVerdict,
  skipQuestion,
  startSession,
  submitAnswer,
} from "../services/sessionService.js";

const codeFrom = (req) => String(req.params.code ?? "");
const hostTokenFrom = (req) =>
  String(req.get("x-session-token") ?? req.body?.hostToken ?? "");

export const createSessionHandler = (req, res, next) => {
  try {
    const { maxPlayers, materialId, categories, difficulty } = req.body ?? {};
    const result = createSession({
      maxPlayers,
      materialId: materialId ? String(materialId) : null,
      categories: Array.isArray(categories) ? categories.slice(0, 10) : null,
      difficulty: difficulty === "sedang" ? "sedang" : "mudah",
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPublicStateHandler = (req, res, next) => {
  try {
    res.json({ state: getPublicState(codeFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const getHostStateHandler = (req, res, next) => {
  try {
    res.json({ state: getHostState(codeFrom(req), hostTokenFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const joinSessionHandler = (req, res, next) => {
  try {
    const result = joinSession(codeFrom(req), req.body?.name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const startSessionHandler = (req, res, next) => {
  try {
    res.json({ state: startSession(codeFrom(req), hostTokenFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const giveDiceHandler = (req, res, next) => {
  try {
    const { value } = req.body ?? {};
    res.json({ state: giveDice(codeFrom(req), hostTokenFrom(req), value) });
  } catch (error) {
    next(error);
  }
};

export const submitAnswerHandler = async (req, res, next) => {
  try {
    const { playerId, playerToken, answer } = req.body ?? {};
    res.json({
      state: await submitAnswer(codeFrom(req), { playerId, playerToken, answer }),
    });
  } catch (error) {
    next(error);
  }
};

export const overrideVerdictHandler = (req, res, next) => {
  try {
    const { score, comment } = req.body ?? {};
    res.json({
      state: overrideVerdict(codeFrom(req), hostTokenFrom(req), { score, comment }),
    });
  } catch (error) {
    next(error);
  }
};

export const resolveVerdictHandler = (req, res, next) => {
  try {
    res.json({ state: resolveVerdict(codeFrom(req), hostTokenFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const skipQuestionHandler = (req, res, next) => {
  try {
    res.json({ state: skipQuestion(codeFrom(req), hostTokenFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const endSessionHandler = (req, res, next) => {
  try {
    res.json({ state: endSession(codeFrom(req), hostTokenFrom(req)) });
  } catch (error) {
    next(error);
  }
};

export const removePlayerHandler = (req, res, next) => {
  try {
    const { playerId } = req.body ?? {};
    res.json({
      state: removePlayer(codeFrom(req), hostTokenFrom(req), playerId),
    });
  } catch (error) {
    next(error);
  }
};

export const reorderPlayersHandler = (req, res, next) => {
  try {
    const { order } = req.body ?? {};
    res.json({
      state: reorderPlayers(codeFrom(req), hostTokenFrom(req), order),
    });
  } catch (error) {
    next(error);
  }
};
