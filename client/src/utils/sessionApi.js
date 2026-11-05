import { getLocalMode, setLocalMode } from "./runtime";
import {
  answerLocalQuestion,
  createLocalSession,
  endLocalSession,
  getLocalState,
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

const request = async (path, { method = "GET", body, hostToken } = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(hostToken ? { "x-session-token": hostToken } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout?.(15000),
    });
  } catch (error) {
    const wrapped = new Error(
      error?.name === "TimeoutError"
        ? "Server tidak merespons. Beralih ke mode demo lokal."
        : "Backend tidak tersedia. Beralih ke mode demo lokal.",
    );
    wrapped.code = "NETWORK";
    wrapped.cause = error;
    throw wrapped;
  }

  const data = await parseJson(response);
  if (data === null) {
    const error = new Error(
      "Deployment ini tidak memiliki backend API. Beralih ke mode demo lokal.",
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

const run = async (serverCall, localCall) => {
  if (getLocalMode()) return localCall();
  try {
    return await serverCall();
  } catch (error) {
    if (error?.code === "NON_JSON" || error?.code === "NETWORK") {
      setLocalMode(true);
      return localCall();
    }
    throw error;
  }
};

export const createGameSession = (payload) =>
  run(
    () => request("/api/sessions", { method: "POST", body: payload }),
    () => createLocalSession(payload),
  );

export const fetchPublicState = (code) =>
  run(
    () => request(`/api/sessions/${encodeURIComponent(code)}`),
    () => getLocalState(code),
  );

export const fetchHostState = (code, hostToken) =>
  run(
    () => request(`/api/sessions/${encodeURIComponent(code)}/host`, { hostToken }),
    () => getLocalState(code, hostToken),
  );

export const fetchSessionState = (code, hostToken = null) =>
  run(
    () =>
      hostToken
        ? request(`/api/sessions/${encodeURIComponent(code)}/host`, { hostToken })
        : request(`/api/sessions/${encodeURIComponent(code)}`),
    () => getLocalState(code, hostToken),
  );

export const joinGameSession = (code, name) =>
  run(
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/join`, {
        method: "POST",
        body: { name },
      }),
    () => joinLocalSession(code, name),
  );

export const startGameSession = (code, hostToken) =>
  run(
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/start`, {
        method: "POST",
        hostToken,
      }),
    () => startLocalSession(code, hostToken),
  );

export const sendDice = (code, hostToken, value = null) =>
  run(
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
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/answer`, {
        method: "POST",
        body: { playerId, playerToken, answer },
      }),
    () => answerLocalQuestion(code, { playerId, playerToken, answer }),
  );

export const overrideSessionVerdict = (code, hostToken, { score, comment }) =>
  run(
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
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/resolve`, {
        method: "POST",
        hostToken,
      }),
    () => resolveLocalVerdict(code, hostToken),
  );

export const skipSessionQuestion = (code, hostToken) =>
  run(
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/skip`, {
        method: "POST",
        hostToken,
      }),
    () => skipLocalQuestion(code, hostToken),
  );

export const endGameSession = (code, hostToken) =>
  run(
    () =>
      request(`/api/sessions/${encodeURIComponent(code)}/end`, {
        method: "POST",
        hostToken,
      }),
    () => endLocalSession(code, hostToken),
  );

export const removeSessionPlayer = (code, hostToken, playerId) =>
  run(
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
