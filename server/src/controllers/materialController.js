import { extractTextFromFile } from "../services/textExtract.js";
import { generateQuestionsFromText } from "../services/questionGenerator.js";
import { saveMaterial } from "../services/materialStore.js";

export const createMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Pilih file materi terlebih dahulu." });
    }

    const text = await extractTextFromFile(req.file);
    const normalized = String(text ?? "")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (normalized.length < 100) {
      return res.status(422).json({
        error:
          "Materi terlalu pendek untuk dijadikan soal. Tambahkan minimal beberapa paragraf, lalu coba lagi.",
      });
    }

    const { questions, source, notice } = await generateQuestionsFromText(normalized);
    const materialId = saveMaterial(questions);

    return res.json({
      materialId,
      source,
      notice,
      count: questions.length,
      questions,
    });
  } catch (error) {
    if (error.code === "MATERIAL_TOO_SHORT" || error.code === "PDF_UNREADABLE") {
      return res.status(422).json({ error: error.message });
    }
    return next(error);
  }
};
