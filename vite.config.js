import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { writeTokens, TOKENS_CSS } from "./scripts/gen-tokens.js";
import { writeConsumerPage } from "./scripts/consumer-page.js";

// Rigenera src/tokens.js all'avvio e quando cambia tokens.css.
const gs1Tokens = {
  name: "gs1-tokens",
  buildStart() { writeTokens(); },
  configureServer(server) {
    server.watcher.add(TOKENS_CSS);
    server.watcher.on("change", file => { if (file.replace(/\\/g, "/") === TOKENS_CSS.replace(/\\/g, "/")) writeTokens(); });
  }
};

// Pagina del vasetto (QR code GS1 Digital Link): generata accanto al gioco, nel percorso /01/{GTIN}/10/{lotto}.
const consumerPage = {
  name: "consumer-page",
  apply: "build",
  closeBundle() { console.log("pagina del vasetto: " + writeConsumerPage("dist")); }
};

export default defineConfig({
  base: "./",
  plugins: [gs1Tokens, viteSingleFile({ removeViteModuleLoader: true }), consumerPage],
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
