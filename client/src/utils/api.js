const API_BASE = import.meta.env.VITE_API_URL ?? "";

import { getLocalMode, setLocalMode } from "./runtime";

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const getServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      signal: AbortSignal.timeout?.(4000),
    });
    if (!response.ok) throw new Error("Server tidak merespons");
    const data = await response.json();
    const serverAvailable = Boolean(data?.ok && data?.service === "melajah-ai");
    setLocalMode(!serverAvailable);
    return { ...data, localMode: !serverAvailable };
  } catch {
    setLocalMode(true);
    return { ok: false, aiEnabled: false, localMode: true };
  }
};

/**
 * Mengunggah materi penyelenggara dan meminta pembuatan soal.
 * Kunci jawaban tetap disimpan server; frontend hanya menerima salinan
 * untuk pratinjau.
 */
export const generateMaterialQuestions = async (file) => {
  if (getLocalMode()) {
    throw new Error(
      "Mode demo Vercel hanya mendukung bank soal. Untuk materi sendiri, deploy backend Node terlebih dahulu.",
    );
  }
  const form = new FormData();
  form.append("file", file);

  try {
    const response = await fetch(`${API_BASE}/api/materials`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout?.(45000),
    });

    const data = await parseJson(response);
    if (data === null) {
      setLocalMode(true);
      throw new Error(
        "Deployment ini tidak memiliki backend. Mode demo hanya mendukung bank soal.",
      );
    }
    if (!response.ok || !Array.isArray(data?.questions)) {
      throw new Error(data?.error ?? "Gagal membuat soal dari materi. Coba file lain.");
    }
    return data;
  } catch (error) {
    if (
      error instanceof TypeError ||
      error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      /fetch|network|load|aborted|timeout/i.test(error.message ?? "")
    ) {
      setLocalMode(true);
      throw new Error(
        "Backend tidak tersedia. Di Vercel, gunakan bank soal (mode demo lokal).",
      );
    }
    throw error;
  }
};
