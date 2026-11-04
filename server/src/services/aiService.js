import { AI_CONFIG, isAiEnabled } from "../config/ai.js";

const stripCodeFences = (text) =>
  String(text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

export const extractJson = (text, expect = "array") => {
  const clean = stripCodeFences(text);
  try {
    return JSON.parse(clean);
  } catch {
    const startChar = expect === "object" ? "{" : "[";
    const endChar = expect === "object" ? "}" : "]";
    const start = clean.indexOf(startChar);
    const end = clean.lastIndexOf(endChar);
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Respons AI bukan JSON yang valid");
    }
    return JSON.parse(clean.slice(start, end + 1));
  }
};

/**
 * Memanggil endpoint gaya OpenAI (OpenAI, DeepSeek, Groq, dsb).
 * API key hanya hidup di server.
 */
export const chatJson = async ({ system, user, maxTokens = 700, temperature = 0.2 }) => {
  if (!isAiEnabled()) {
    const error = new Error("AI tidak dikonfigurasi");
    error.code = "AI_DISABLED";
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const error = new Error(`AI HTTP ${response.status}`);
      error.code = "AI_HTTP";
      error.status = response.status;
      error.detail = body.slice(0, 300);
      throw error;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      const error = new Error("AI tidak mengembalikan isi");
      error.code = "AI_EMPTY";
      throw error;
    }
    return content;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeout = new Error("AI melewati batas waktu");
      timeout.code = "AI_TIMEOUT";
      throw timeout;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};
