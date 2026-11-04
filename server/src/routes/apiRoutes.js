import express from "express";
import multer from "multer";
import path from "node:path";
import { ENV } from "../config/ai.js";
import { createMaterial } from "../controllers/materialController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: ENV.maxUploadBytes,
    files: 1,
    fields: 5,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const allowed = [".txt", ".md", ".csv", ".json", ".pdf"];
    if (!allowed.includes(extension)) {
      const error = new Error("Format file belum didukung. Gunakan .txt, .md, .csv, .json, atau .pdf.");
      error.code = "UNSUPPORTED_FILE";
      callback(error);
      return;
    }
    callback(null, true);
  },
});

router.post("/materials", upload.single("file"), createMaterial);

export default router;
