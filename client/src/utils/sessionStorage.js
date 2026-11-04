const HOST_KEY = "melajah-host-session";
const PLAYER_KEY = "melajah-player-session";

const read = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage bisa diblokir; permainan tetap berjalan
  }
};

const clear = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // abaikan
  }
};

export const saveHostSession = (value) => write(HOST_KEY, value);
export const loadHostSession = () => read(HOST_KEY);
export const clearHostSession = () => clear(HOST_KEY);

export const savePlayerSession = (value) => write(PLAYER_KEY, value);
export const loadPlayerSession = () => read(PLAYER_KEY);
export const clearPlayerSession = () => clear(PLAYER_KEY);

export const clearAllSessions = () => {
  clearHostSession();
  clearPlayerSession();
};
