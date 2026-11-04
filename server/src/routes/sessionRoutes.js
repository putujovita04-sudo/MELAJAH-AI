import express from "express";
import {
  createSessionHandler,
  endSessionHandler,
  getHostStateHandler,
  getPublicStateHandler,
  giveDiceHandler,
  joinSessionHandler,
  overrideVerdictHandler,
  removePlayerHandler,
  reorderPlayersHandler,
  resolveVerdictHandler,
  skipQuestionHandler,
  startSessionHandler,
  submitAnswerHandler,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/sessions", createSessionHandler);
router.get("/sessions/:code", getPublicStateHandler);
router.get("/sessions/:code/host", getHostStateHandler);
router.post("/sessions/:code/join", joinSessionHandler);
router.post("/sessions/:code/start", startSessionHandler);
router.post("/sessions/:code/dice", giveDiceHandler);
router.post("/sessions/:code/answer", submitAnswerHandler);
router.post("/sessions/:code/skip", skipQuestionHandler);
router.post("/sessions/:code/override", overrideVerdictHandler);
router.post("/sessions/:code/resolve", resolveVerdictHandler);
router.post("/sessions/:code/end", endSessionHandler);
router.post("/sessions/:code/players/remove", removePlayerHandler);
router.post("/sessions/:code/order", reorderPlayersHandler);

export default router;
