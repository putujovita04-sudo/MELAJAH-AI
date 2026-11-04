import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ENV, isAiEnabled } from "./config/ai.js";
import apiRoutes from "./routes/apiRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { getBankSize } from "./services/questionService.js";

const app = express();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distDir = path.join(rootDir, "client/dist");

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

const allowedOrigins = ENV.clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ENV.nodeEnv !== "production" || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin tidak diizinkan"));
    },
  }),
);
app.use(express.json({ limit: "128kb" }));

const rateBuckets = new Map();
const apiLimiter = (req, res, next) => {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 600;
  const timestamps = (rateBuckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (timestamps.length >= limit) {
    res.status(429).json({ error: "Terlalu banyak permintaan. Tunggu sebentar, ya." });
    return;
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  next();
};

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiEnabled: isAiEnabled(),
    fallback: !isAiEnabled(),
    bankSize: getBankSize(),
    service: "melajah-ai",
  });
});

app.use("/api", apiLimiter);
app.use("/api", apiRoutes);
app.use("/api", sessionRoutes);

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Ukuran file terlalu besar. Maksimal 5 MB."
        : "Upload file gagal. Coba file lain.";
    res.status(413).json({ error: message });
    return;
  }

  if (error.code === "UNSUPPORTED_FILE") {
    res.status(415).json({ error: error.message });
    return;
  }

  if (error.message === "Origin tidak diizinkan") {
    res.status(403).json({ error: "Origin tidak diizinkan." });
    return;
  }

  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 600) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  console.error("[MELAJAH] Kesalahan server:", error.message);
  res.status(500).json({ error: "Terjadi kesalahan di server. Coba lagi sebentar, ya." });
});

export default app;
