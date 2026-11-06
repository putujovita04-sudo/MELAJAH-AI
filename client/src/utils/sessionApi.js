import { getLocalMode, setLocalMode } from "./runtime";
import {
  answerLocalQuestion,
  createLocalSession,
  endLocalSession,
  getLocalState,
  hasLocalSession,
  joinLocalSession,
  overrideLocalVerdict,
  removeLocalPlayer,
  reorderLocalPlayers,
  resolveLocalVerdict,
  sendLocalDice,
  skipLocalQuestion,
  startLocalSession,
} from "./localSession";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const request = async (path, { method = "GET", body, hostToken, timeoutMs = 15000 } = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(hostToken ? { "x-session-token": hostToken } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout?.(timeoutMs),
    });
  } catch (error) {
    const wrapped = new Error(
      error?.name === "TimeoutError"
        ? "Server game tidak merespons. Periksa koneksi lalu coba lagi."
        : "Tidak bisa menghubungi server game. Periksa koneksi internet lalu coba lagi.",
    );
    wrapped.code = "NETWORK";
    wrapped.cause = error;
    throw wrapped;
  }

  const data = await parseJson(response);
  if (data === null) {
    const error = new Error(
      "Server game tidak aktif di alamat ini. Penyelenggara perlu mengaktifkan backend (Vercel + Upstash Redis).",
    );
    error.code = "NON_JSON";
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(data?.error ?? "Permintaan gagal. Coba lagi, ya.");
    error.status = response.status;
    throw error;
  }
  return data;
};

const run = async (code, serverCall, localCall) => {
  // Room demo yang dibuat/diikuti di browser ini selalu diprioritaskan,
  // termasuk setelah reload saat flag mode lokal belum tentu ter-set.
  if (getLocalMode() || hasLocalSession(code)) return localCall();
  return serverCall();
};

export const createGameSession = async (payload) => {
  // Mode demo (satu layar): tidak perlu menghubungi server.
  if (getLocalMode()) {
    return createLocalSession(payload);
  }

  // Selain itu, coba server dulu supaya room bisa diikuti pemain lain.
  try {
    const result = await request("/api/sessions", { method: "POST", body: payload });
    setLocalMode(false);
    return result;
  } catch (error) {
    if (
      error?.code === "NON_JSON" ||
      error?.code === "NETWORK" ||
      error?.status === 503
    ) {
      setLocalMode(true);
      return createLocalSession(payload);
    }
    throw error;
  }
};

export const fetchPublicState = (code) =>
  run(
    code,
    () => request(`/api/sessions/${encodeURIComponent(code)}`),
    () => getLocalState(code),
  );

export const fetchHostState = (code, hostToken) =>
  run(
    code,
    () => request(`/api/sessions/${encodeURIComponent(code)}/host`, { hostToken }),
    () => getLocalState(code, hostToken),
  );

export const fetchSessionState = (code, hostToken = null) =>
  run(
    code,
    () =>
      hostToken
        ? request(`/api/sessions/${encodeURIComponent(code)}/host`, { hostToken })
        : request(`/api/sessions/${encodeURIComponent(code)}`),
    () => getLocalState(code, hostToken),
  );

export const joinGameSession = (code, name) => {
  const normalized = String(code ?? "").trim().toUpperCase();

  // Room demo yang dibuat di browser ini tetap bisa dipakai (satu perangkat).
  if (hasLocalSession(normalized)) {
    setLocalMode(true);
    return Promise.resolve().then(() => joinLocalSession(normalized, name));
  }

  // Selain itu, room harus ada di server bersama. Jangan diam-diam jatuh ke
  // mode lokal: HP pemain tidak punya state room milik admin.
  return request(`/api/sessions/${encodeURIComponent(normalized)}/join`, {
    method: "POST",
    body: { name },
  }).then((result) => {
    setLocalMode(false);
    return result;
  });
};

export const startGameSession = (code, hostToken) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/start`, {
        method: "POST",
        hostToken,
      }),
    () => startLocalSession(code, hostToken),
  );

export const sendDice = (code, hostToken, value = null) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/dice`, {
        method: "POST",
        body: { value },
        hostToken,
      }),
    () => sendLocalDice(code, hostToken, value),
  );

export const answerQuestion = (code, { playerId, playerToken, answer }) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/answer`, {
        method: "POST",
        body: { playerId, playerToken, answer },
        // Juri AI bisa butuh waktu; beri ruang lebih dari batas AI (15 dtk).
        timeoutMs: 25000,
      }),
    () => answerLocalQuestion(code, { playerId, playerToken, answer }),
  );

export const overrideSessionVerdict = (code, hostToken, { score, comment }) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/override`, {
        method: "POST",
        body: { score, comment },
        hostToken,
      }),
    () => overrideLocalVerdict(code, hostToken, { score, comment }),
  );

export const resolveSessionVerdict = (code, hostToken) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/resolve`, {
        method: "POST",
        hostToken,
      }),
    () => resolveLocalVerdict(code, hostToken),
  );

export const skipSessionQuestion = (code, hostToken) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/skip`, {
        method: "POST",
        hostToken,
      }),
    () => skipLocalQuestion(code, hostToken),
  );

export const endGameSession = (code, hostToken) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/end`, {
        method: "POST",
        hostToken,
      }),
    () => endLocalSession(code, hostToken),
  );

export const removeSessionPlayer = (code, hostToken, playerId) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/players/remove`, {
        method: "POST",
        body: { playerId },
        hostToken,
      }),
    () => removeLocalPlayer(code, hostToken, playerId),
  );

export const reorderSessionPlayers = (code, hostToken, order) =>
  run(
    code,
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/order`, {
        method: "POST",
        body: { order },
        hostToken,
      }),
    () => reorderLocalPlayers(code, hostToken, order),
  );

export const buildJoinUrl = (code) => {
  if (typeof window === "undefined") return `/?join=${code}`;
  return `${window.location.origin}/?join=${encodeURIComponent(code)}`;
};
