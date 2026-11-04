import path from "node:path";
import { simplePdfText } from "../utils/pdfText.js";

const PDF_MAGIC = Buffer.from("%PDF");

export const extractTextFromFile = async (file) => {
  if (!file?.buffer) throw new Error("File tidak ditemukan");
  const extension = path.extname(file.originalname || "").toLowerCase();
  const looksPdf = extension === ".pdf" || file.buffer.subarray(0, 4).equals(PDF_MAGIC);

  if (looksPdf) {
    let text = "";
    try {
      const pdfModule = await import("pdf-parse");
      const pdfParse = pdfModule.default ?? pdfModule;
      const result = await pdfParse(file.buffer);
      text = result.text ?? "";
    } catch {
      // pdf-parse gagal pada sebagian PDF; coba ekstraktor cadangan
    }

    if (text.replace(/\s+/g, " ").trim().length < 80) {
      text = simplePdfText(file.buffer);
    }

    if (text.replace(/\s+/g, " ").trim().length < 80) {
      const error = new Error(
        "PDF tidak bisa dibaca. Coba simpan ulang sebagai .txt atau .md, lalu unggah lagi.",
      );
      error.code = "PDF_UNREADABLE";
      throw error;
    }

    return text;
  }

  return file.buffer.toString("utf8").replace(/^\uFEFF/, "");
};
