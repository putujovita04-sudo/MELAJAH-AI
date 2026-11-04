import crypto from "node:crypto";
import { ENV } from "../config/ai.js";

const sessions = new Map();
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const clearTimers = (session) => {
  if (session?.verdictTimer) {
    clearTimeout(session.verdictTimer);
    session.verdictTimer = null;
  }
};

const cleanup = () => {
  const now = Date.now();
  for (const [code, session] of sessions.entries()) {
    if (now - session.updatedAt > ENV.sessionTtlMs) {
      clearTimers(session);
      sessions.delete(code);
    }
  }
};

export const normalizeCode = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

export const generateCode = () => {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    let code = "";
    for (let index = 0; index < 5; index += 1) {
      code += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
    }
    if (!sessions.has(code)) return code;
  }
  throw new Error("Tidak bisa membuat kode sesi unik");
};

export const saveSession = (session) => {
  cleanup();
  sessions.set(session.code, session);
  return session;
};

export const getSession = (code) => {
  cleanup();
  const normalized = normalizeCode(code);
  const session = sessions.get(normalized) ?? null;
  if (session) session.updatedAt = Date.now();
  return session;
};

export const touchSession = (session) => {
  if (session) session.updatedAt = Date.now();
  return session;
};

export const removeSession = (code) => {
  const normalized = normalizeCode(code);
  const session = sessions.get(normalized);
  if (session) {
    clearTimers(session);
    sessions.delete(normalized);
  }
};

export const getSessionCount = () => sessions.size;
export { clearTimers };
