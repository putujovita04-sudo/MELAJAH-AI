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
        ? "Server tidak merespons. Coba lagi sebentar."
        : "Tidak bisa menghubungi server. Pastikan backend berjalan.",
    );
    wrapped.cause = error;
    throw wrapped;
  }

  const data = await parseJson(response);
  if (!response.ok) {
    const error = new Error(data?.error ?? "Permintaan gagal. Coba lagi, ya.");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const createGameSession = (payload) =>
  request("/api/sessions", { method: "POST", body: payload });

export const fetchPublicState = (code) =>
  request(`/api/sessions/${encodeURIComponent(code)}`);

export const fetchHostState = (code, hostToken) =>
  request(`/api/sessions/${encodeURIComponent(code)}/host`, { hostToken });

export const fetchSessionState = (code, hostToken = null) =>
  hostToken ? fetchHostState(code, hostToken) : fetchPublicState(code);

export const joinGameSession = (code, name) =>
  request(`/api/sessions/${encodeURIComponent(code)}/join`, {
    method: "POST",
    body: { name },
  });

export const startGameSession = (code, hostToken) =>
  request(`/api/sessions/${encodeURIComponent(code)}/start`, {
    method: "POST",
    hostToken,
  });

export const sendDice = (code, hostToken, value = null) =>
  request(`/api/sessions/${encodeURIComponent(code)}/dice`, {
    method: "POST",
    body: { value },
    hostToken,
  });

export const answerQuestion = (code, { playerId, playerToken, answer }) =>
  request(`/api/sessions/${encodeURIComponent(code)}/answer`, {
    method: "POST",
    body: { playerId, playerToken, answer },
  });

export const overrideSessionVerdict = (code, hostToken, { score, comment }) =>
  request(`/api/sessions/${encodeURIComponent(code)}/override`, {
    method: "POST",
    body: { score, comment },
    hostToken,
  });

export const resolveSessionVerdict = (code, hostToken) =>
  request(`/api/sessions/${encodeURIComponent(code)}/resolve`, {
    method: "POST",
    hostToken,
  });

export const skipSessionQuestion = (code, hostToken) =>
  request(`/api/sessions/${encodeURIComponent(code)}/skip`, {
    method: "POST",
    hostToken,
  });

export const endGameSession = (code, hostToken) =>
  request(`/api/sessions/${encodeURIComponent(code)}/end`, {
    method: "POST",
    hostToken,
  });

export const removeSessionPlayer = (code, hostToken, playerId) =>
  request(`/api/sessions/${encodeURIComponent(code)}/players/remove`, {
    method: "POST",
    body: { playerId },
    hostToken,
  });

export const reorderSessionPlayers = (code, hostToken, order) =>
  request(`/api/sessions/${encodeURIComponent(code)}/order`, {
    method: "POST",
    body: { order },
    hostToken,
  });

export const buildJoinUrl = (code) => {
  if (typeof window === "undefined") return `/?join=${code}`;
  return `${window.location.origin}/?join=${encodeURIComponent(code)}`;
};
