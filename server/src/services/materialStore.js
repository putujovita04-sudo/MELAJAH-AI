import crypto from "node:crypto";
import { ENV } from "../config/ai.js";

const store = new Map();

const cleanup = () => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now - value.createdAt > ENV.materialTtlMs) store.delete(key);
  }
};

export const saveMaterial = (questions) => {
  cleanup();
  const materialId = crypto.randomUUID();
  store.set(materialId, { questions, createdAt: Date.now() });
  return materialId;
};

export const getMaterial = (materialId) => {
  if (!materialId || typeof materialId !== "string") return null;
  cleanup();
  return store.get(materialId) ?? null;
};

export const getMaterialQuestion = (materialId, questionId) => {
  const material = getMaterial(materialId);
  if (!material) return null;
  return material.questions.find((question) => question.id === questionId) ?? null;
};
