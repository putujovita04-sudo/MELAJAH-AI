import app from "../server/src/app.js";

/**
 * Entry point Vercel Functions.
 *
 * Semua request /api/* di-rewrite ke file ini (lihat vercel.json), sehingga
 * Express tetap menangani routing. State sesi disimpan di Upstash Redis lewat
 * middleware sharedSessionMiddleware di server/src/app.js.
 */
export default app;
