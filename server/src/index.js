import app from "./app.js";
import { ENV, AI_CONFIG, isAiEnabled } from "./config/ai.js";

app.listen(ENV.port, () => {
  console.log("");
  console.log("  MELAJAH AI — server siap");
  console.log(`  http://localhost:${ENV.port}`);
  console.log(`  Juri AI : ${isAiEnabled() ? `aktif (${AI_CONFIG.model})` : "mode lokal / fallback"}`);
  console.log(`  Mode    : ${ENV.nodeEnv}`);
  console.log("");
});
