import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { writeTokens, TOKENS_CSS } from "./scripts/gen-tokens.js";

// Rigenera src/tokens.js all'avvio e quando cambia tokens.css.
const gs1Tokens = {
  name: "gs1-tokens",
  buildStart() { writeTokens(); },
  configureServer(server) {
    server.watcher.add(TOKENS_CSS);
    server.watcher.on("change", file => { if (file.replace(/\\/g, "/") === TOKENS_CSS.replace(/\\/g, "/")) writeTokens(); });
  }
};

export default defineConfig({
  base: "./",
  plugins: [gs1Tokens, viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: "es2020",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false
  },
  test: {
    include: ["tests/unit/**/*.test.js"]
  }
});
