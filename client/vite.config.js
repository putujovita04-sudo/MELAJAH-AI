import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    fs: {
      // izinkan impor bank soal dari folder data di dalam src
      allow: [".."],
    },
    proxy: {
      "/api": {
        target: "http://localhost:4100",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
