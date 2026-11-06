import { ENV } from "../config/ai.js";
import { getMaterial, putMaterial } from "./materialStore.js";
import {
  isSharedStoreEnabled,
  kvAcquireLock,
  kvDel,
  kvGet,
  kvSet,
} from "./redisStore.js";
import { resolveDueVerdict } from "./sessionService.js";
import {
  forgetSession,
  getSession,
  putSession,
  snapshotSession,
} from "./sessionStore.js";

const SESSION_PREFIX = "melajah:v1:session:";
const MATERIAL_PREFIX = "melajah:v1:material:";
const LOCK_PREFIX = "melajah:v1:lock:";

const SESSION_TTL_SECONDS = Math.ceil(ENV.sessionTtlMs / 1000);
const MATERIAL_TTL_SECONDS = Math.ceil(ENV.materialTtlMs / 1000);
const LOCK_TTL_MS = 25000;
const LOCK_RETRY_MS = 60;
const LOCK_ATTEMPTS = 60;

const sessionKey = (code) => `${SESSION_PREFIX}${code}`;
const materialKey = (materialId) => `${MATERIAL_PREFIX}${materialId}`;
const lockKey = (code) => `${LOCK_PREFIX}${code}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Kode sesi yang sedang diproses di instance ini (cegah GET menimpa state). */
const inFlight = new Set();

const readJson = (raw) => {
  if (!raw) return null;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistSession = async (code) => {
  const session = getSession(code);
  if (!session) return;
  const payload = JSON.stringify(snapshotSession(session));
  await kvSet(sessionKey(code), payload, SESSION_TTL_SECONDS);
};

const persistMaterial = async (materialId) => {
  const material = getMaterial(materialId);
  if (!material) return;
  await kvSet(materialKey(materialId), JSON.stringify(material), MATERIAL_TTL_SECONDS);
};

const loadSession = async (code, { force = false } = {}) => {
  const raw = await kvGet(sessionKey(code));
  const data = readJson(raw);
  if (!force && inFlight.has(code)) {
    // Ada request mutasi yang sedang berjalan di instance ini; jangan timpa
    // objek sesi yang sedang dipakainya.
    return getSession(code);
  }
  if (!data) {
    forgetSession(code);
    return null;
  }
  return putSession(data);
};

const loadMaterial = async (materialId) => {
  if (!materialId) return null;
  const cached = getMaterial(materialId);
  if (cached) return cached;
  const raw = await kvGet(materialKey(materialId));
  const data = readJson(raw);
  if (!data) return null;
  return putMaterial(materialId, data);
};

const acquireLock = async (code) => {
  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt += 1) {
    if (await kvAcquireLock(lockKey(code), LOCK_TTL_MS)) return true;
    await sleep(LOCK_RETRY_MS);
  }
  return false;
};

/** Resolusi otomatis hasil penilaian saat sudah lewat batas waktu. */
const resolveExpiredVerdict = async (code) => {
  const peek = getSession(code);
  if (!peek || peek.phase !== "verdict" || !peek.autoAdvanceAt) return;
  if (Date.now() < peek.autoAdvanceAt) return;

  const locked = await kvAcquireLock(lockKey(code), 15000);
  if (!locked) return;
  try {
    await loadSession(code, { force: true });
    if (resolveDueVerdict(code)) await persistSession(code);
  } finally {
    await kvDel(lockKey(code)).catch(() => {});
  }
};

const guardStore = (label) => (error) => {
  console.error(`[MELAJAH] Shared store (${label}) gagal:`, error.message);
};

/**
 * Middleware untuk deployment serverless / multi-instance.
 * Hanya aktif kalau env Upstash tersedia.
 */
export const sharedSessionMiddleware = async (req, res, next) => {
  if (!isSharedStoreEnabled()) {
    next();
    return;
  }

  if (req.method === "POST" && /^\/api\/materials\/?$/.test(req.path)) {
    const originalJson = res.json.bind(res);
    let done = false;
    res.json = (body) => {
      if (done) return res;
      done = true;
      persistMaterial(body?.materialId)
        .catch(guardStore("material"))
        .finally(() => originalJson(body));
      return res;
    };
    next();
    return;
  }

  const match = req.path.match(/^\/api\/sessions(?:\/([A-Za-z0-9]+))?(?:\/.*)?$/);
  if (!match) {
    next();
    return;
  }

  const code = match[1];

  try {
    // POST /api/sessions — sesi baru. Tidak perlu lock karena kodenya unik.
    if (!code) {
      if (req.method !== "POST") {
        next();
        return;
      }

      if (req.body?.materialId) {
        await loadMaterial(String(req.body.materialId)).catch(guardStore("material"));
      }

      const originalJson = res.json.bind(res);
      let done = false;
      res.json = (body) => {
        if (done) return res;
        done = true;
        (async () => {
          try {
            if (body?.code) await persistSession(String(body.code));
            if (req.body?.materialId) await persistMaterial(String(req.body.materialId));
          } catch (error) {
            guardStore("create")(error);
          } finally {
            originalJson(body);
          }
        })();
        return res;
      };
      next();
      return;
    }

    const mutating = !["GET", "HEAD", "OPTIONS"].includes(req.method);

    if (mutating) {
      const locked = await acquireLock(code);
      if (!locked) {
        res.status(409).json({
          error: "Sesi sedang memproses permintaan lain. Tunggu sebentar lalu coba lagi.",
        });
        return;
      }

      inFlight.add(code);
      let settled = false;
      let responded = false;
      let safetyTimer = null;

      const release = async () => {
        if (settled) return;
        settled = true;
        if (safetyTimer) clearTimeout(safetyTimer);
        inFlight.delete(code);
        await kvDel(lockKey(code)).catch(() => {});
      };

      // Jaring pengaman kalau handler tidak pernah mengirim response.
      safetyTimer = setTimeout(() => {
        release().catch(() => {});
      }, LOCK_TTL_MS + 5000);
      safetyTimer.unref?.();

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (responded) return res;
        responded = true;
        (async () => {
          try {
            await persistSession(code);
          } catch (error) {
            guardStore("save")(error);
          } finally {
            await release();
          }
          if (!res.writableEnded) originalJson(body);
        })().catch((error) => guardStore("response")(error));
        return res;
      };

      await loadSession(code, { force: true });
      next();
      return;
    }

    // GET: jangan menimpa sesi yang sedang diproses di instance ini.
    if (inFlight.has(code)) {
      next();
      return;
    }

    await loadSession(code);
    await resolveExpiredVerdict(code);
    next();
  } catch (error) {
    guardStore("middleware")(error);
    if (!res.headersSent) {
      res.status(503).json({
        error: "Penyimpanan sesi sedang tidak tersedia. Coba lagi sebentar, ya.",
      });
    }
  }
};
