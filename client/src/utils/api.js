const API_BASE = import.meta.env.VITE_API_URL ?? "";

import { setLocalMode } from "./runtime";

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
    // Di Vercel tanpa Upstash, room lintas perangkat tidak aktif. Perlakukan
    // sebagai mode demo supaya penyelenggara tetap bisa mencoba permainan.
    const sharedStoreMissing = Boolean(data?.serverless && data?.sharedStore === false);
    const localMode = !serverAvailable || sharedStoreMissing;
    setLocalMode(localMode);
    return { ...data, localMode };
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
      throw new Error(
        "Server materi tidak aktif di alamat ini. Coba lagi nanti.",
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
      throw new Error(
        "Tidak bisa menghubungi server untuk membuat soal. Periksa koneksi lalu coba lagi.",
      );
    }
    throw error;
  }
};
