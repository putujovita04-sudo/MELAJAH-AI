import { createRequire } from "node:module";

/**
 * Bank soal dibaca lewat require (bukan readFileSync + path dinamis) supaya
 * ikut ter-bundle saat server dijalankan sebagai Vercel Function.
 */
const require = createRequire(import.meta.url);

let bank = { questions: [], categories: [] };
try {
  bank = require("../../../client/src/data/questions.json");
} catch (error) {
  console.error("[MELAJAH] Gagal membaca bank soal:", error.message);
}

const questionMap = new Map(bank.questions.map((question) => [question.id, question]));

export const getBankQuestion = (id) => questionMap.get(id) ?? null;
export const getBankQuestions = () => bank.questions ?? [];
export const getBankSize = () => questionMap.size;
export const getCategories = () => bank.categories ?? [];
