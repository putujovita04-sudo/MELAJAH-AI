/**
 * Penyimpanan bersama (shared store) memakai REST API Upstash Redis.
 *
 * Dipakai saat aplikasi berjalan di platform serverless (Vercel), karena
 * setiap instance fungsi bisa berbeda. Tanpa shared store, sesi permainan
 * hanya hidup di memori satu proses dan pemain di HP tidak bisa bergabung.
 *
 * Kompatibel dengan env var Vercel Marketplace:
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   KV_REST_API_URL        / KV_REST_API_TOKEN
 *
 * Tidak menambah dependency: cukup fetch ke REST endpoint Upstash.
 */

const pickEnv = (...names) => {
  for (const name of names) {
    const value = String(process.env[name] ?? "").trim();
    if (value) return value;
  }
  return "";
};

const REST_URL = pickEnv("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL").replace(/\/+$/, "");
const REST_TOKEN = pickEnv("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");

export const isSharedStoreEnabled = () => Boolean(REST_URL && REST_TOKEN);

const command = async (args) => {
  if (!isSharedStoreEnabled()) {
    throw new Error("Shared store belum dikonfigurasi.");
  }

  let response;
  try {
    response = await fetch(REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout?.(5000),
    });
  } catch (error) {
    const wrapped = new Error("Tidak bisa menghubungi Redis (Upstash).");
    wrapped.code = "REDIS_NETWORK";
    wrapped.cause = error;
    throw wrapped;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.error) {
    const wrapped = new Error(payload?.error ?? "Perintah Redis gagal.");
    wrapped.code = "REDIS_ERROR";
    wrapped.status = response.status;
    throw wrapped;
  }

  return payload?.result ?? null;
};

export const kvGet = (key) => command(["GET", key]);

export const kvSet = (key, value, ttlSeconds) => {
  const ttl = Math.max(1, Math.ceil(Number(ttlSeconds) || 1));
  return command(["SET", key, value, "EX", ttl]);
};

export const kvDel = (key) => command(["DEL", key]);

export const kvExpire = (key, ttlSeconds) => {
  const ttl = Math.max(1, Math.ceil(Number(ttlSeconds) || 1));
  return command(["EXPIRE", key, ttl]);
};

/** SET NX PX: true kalau lock berhasil didapat. */
export const kvAcquireLock = async (key, ttlMs) => {
  const ttl = Math.max(1000, Math.ceil(Number(ttlMs) || 1000));
  const result = await command(["SET", key, "1", "NX", "PX", ttl]);
  return result === "OK";
};
