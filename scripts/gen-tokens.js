// Genera src/tokens.js da src/styles/tokens.css, così Three.js e i canvas usano gli stessi colori del CSS.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
export const TOKENS_CSS = root + "src/styles/tokens.css";
const TOKENS_JS = root + "src/tokens.js";

export function parseTokens(css) {
  const out = {};
  for (const [, name, hex] of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) out[name] = hex.toUpperCase();
  return out;
}

export function writeTokens() {
  const tokens = parseTokens(readFileSync(TOKENS_CSS, "utf8"));
  const body = `// File generato da scripts/gen-tokens.js a partire da src/styles/tokens.css. Non modificarlo a mano.
export const TOKENS = ${JSON.stringify(tokens, null, 2)};

/** Restituisce il colore esadecimale di un token, ad esempio color("gs1-blue"). */
export const color = name => {
  if (!(name in TOKENS)) throw new Error("Token di colore sconosciuto: " + name);
  return TOKENS[name];
};
`;
  let current = "";
  try { current = readFileSync(TOKENS_JS, "utf8"); } catch {}
  if (current.replace(/\r\n/g, "\n") !== body) writeFileSync(TOKENS_JS, body);
  return tokens;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) writeTokens();
