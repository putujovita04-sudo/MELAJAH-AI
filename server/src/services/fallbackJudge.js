const STOP_WORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "itu", "ini", "adalah", "sebuah", "para",
  "dalam", "untuk", "dengan", "pada", "atau", "juga", "akan", "tidak", "bisa",
  "sebagai", "oleh", "karena", "agar", "sangat", "lebih", "sudah", "masih",
  "a", "an", "the", "of", "to", "is", "are",
]);

export const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokens = (value) =>
  normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const stem = (token) => token.replace(/(nya|kah|lah|pun)$/u, "");

export const sanitizeComment = (value, fallback = "Terima kasih sudah menjawab!") => {
  const clean = String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return clean || fallback;
};

export const isMcqCorrect = (question, answer) =>
  normalize(answer) === normalize(question.answer);

export const fallbackJudge = (question, answer) => {
  if (question.type === "pilihan") {
    const correct = isMcqCorrect(question, answer);
    return {
      skor: correct ? 100 : 0,
      komentar: correct
        ? "Tepat sekali! Kamu memilih jawaban yang benar."
        : `Belum tepat. Jawaban yang benar adalah ${question.answer}.`,
    };
  }

  const answerNorm = normalize(answer);
  if (!answerNorm) {
    return { skor: 0, komentar: "Jawabanmu masih kosong. Coba tulis lagi, ya!" };
  }

  const keyNorm = normalize(question.answer);
  const answerTokens = new Set(tokens(answerNorm));
  const keyTokens = tokens(keyNorm);

  if (answerNorm === keyNorm) {
    return { skor: 100, komentar: "Sempurna! Jawabanmu benar sekali." };
  }

  if (keyNorm.length >= 3 && answerNorm.includes(keyNorm)) {
    return { skor: 95, komentar: "Hebat! Jawaban kamu benar." };
  }

  const keywordList = Array.isArray(question.keywords) ? question.keywords : [];
  const keywordHit = keywordList.some((keyword) => {
    const normalized = normalize(keyword);
    if (!normalized) return false;
    if (normalized.length <= 3) {
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|\\s)${escaped}($|\\s)`, "u").test(answerNorm);
    }
    return answerNorm.includes(normalized);
  });

  const matched = keyTokens.filter(
    (token) => answerTokens.has(token) || answerTokens.has(stem(token)),
  );

  if (keyTokens.length > 0 && matched.length === keyTokens.length) {
    return { skor: 92, komentar: "Hebat! Jawaban kamu benar." };
  }

  if (keywordHit) {
    return { skor: 88, komentar: "Bagus! Jawabanmu sudah mengarah ke hal yang tepat." };
  }

  if (keyTokens.length > 0 && matched.length / keyTokens.length >= 0.5) {
    return { skor: 65, komentar: "Hampir benar! Ada bagian penting yang perlu dilengkapi." };
  }

  if (keyTokens.some((token) => answerTokens.has(token))) {
    return { skor: 45, komentar: "Sudah ada kata yang berkaitan, tetapi belum cukup tepat." };
  }

  return {
    skor: 15,
    komentar: `Belum tepat. Jawaban yang dicari adalah ${question.answer}.`,
  };
};
