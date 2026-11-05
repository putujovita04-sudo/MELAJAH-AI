const KEY = "melajah-local-mode";
let cached = null;

export const getLocalMode = () => {
  if (cached !== null) return cached;
  try {
    cached = localStorage.getItem(KEY) === "1";
  } catch {
    cached = false;
  }
  return cached;
};

export const setLocalMode = (value) => {
  cached = Boolean(value);
  try {
    localStorage.setItem(KEY, cached ? "1" : "0");
  } catch {
    // localStorage bisa diblokir; mode tetap berjalan di memori tab
  }
};
