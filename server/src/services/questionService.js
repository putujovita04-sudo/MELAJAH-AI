import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceDir = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.resolve(serviceDir, "../../../client/src/data/questions.json");

let bank = { questions: [], categories: [] };
try {
  bank = JSON.parse(readFileSync(bankPath, "utf8"));
} catch (error) {
  console.error("[MELAJAH] Gagal membaca bank soal:", error.message);
}

const questionMap = new Map(bank.questions.map((question) => [question.id, question]));

export const getBankQuestion = (id) => questionMap.get(id) ?? null;
export const getBankQuestions = () => bank.questions ?? [];
export const getBankSize = () => questionMap.size;
export const getCategories = () => bank.categories ?? [];
