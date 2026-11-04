import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(configDir, "../../../.env");
const serverEnv = path.resolve(configDir, "../../.env");

dotenv.config({ path: rootEnv });
dotenv.config({ path: serverEnv, override: true });

const numberEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const ENV = {
  port: numberEnv("PORT", 4100),
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  maxUploadBytes: numberEnv("MAX_UPLOAD_BYTES", 5 * 1024 * 1024),
  materialTtlMs: numberEnv("MATERIAL_TTL_MS", 2 * 60 * 60 * 1000),
  sessionTtlMs: numberEnv("SESSION_TTL_MS", 6 * 60 * 60 * 1000),
  verdictAutoMs: numberEnv("VERDICT_AUTO_MS", 10000),
};

export const AI_CONFIG = {
  apiKey: process.env.AI_API_KEY?.trim() || "",
  baseUrl: (process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, ""),
  model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
  timeoutMs: numberEnv("AI_TIMEOUT_MS", 15000),
};

export const isAiEnabled = () =>
  Boolean(String(process.env.AI_API_KEY ?? AI_CONFIG.apiKey ?? "").trim());

