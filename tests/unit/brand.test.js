// Regole di brand e di contenuto verificate su tutti i sorgenti.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseTokens } from "../../scripts/gen-tokens.js";
import { TOKENS } from "../../src/tokens.js";
import { contrast } from "../../scripts/oklch.js";

const SKIP = new Set(["node_modules", "dist", ".git", "test-results", "playwright-report", "docs"]);
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|css|html|json|md)$/.test(name) && name !== "package-lock.json") out.push(p.replace(/\\/g, "/"));
  }
  return out;
}
const files = walk(".");
const sources = files.filter(f => f.startsWith("src/") || f === "index.html");

describe("colori", () => {
  it("src/tokens.js è allineato a tokens.css", () => {
    expect(TOKENS).toEqual(parseTokens(readFileSync("src/styles/tokens.css", "utf8")));
  });

  it("nessun colore scritto a mano fuori dai token", () => {
    const allowed = new Set(["src/styles/tokens.css", "src/tokens.js"]);
    const offenders = [];
    for (const f of sources.filter(f => !allowed.has(f))) {
      const text = readFileSync(f, "utf8");
      const hex = text.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g) || [];
      const rgb = text.match(/rgba?\(\s*\d/g) || [];
      if (hex.length || rgb.length) offenders.push(`${f}: ${[...hex, ...rgb].join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("i testi principali rispettano il contrasto WCAG AA", () => {
    // Tema chiaro: testi su pagina, superfici bianche e pulsanti; blocco JSON scuro.
    const pairs = [
      ["gs1-dark-gray", "gs1-white"], ["gs1-dark-gray", "gs1-blue-50"], ["gs1-blue", "gs1-white"], ["gs1-blue", "gs1-blue-50"], ["gs1-blue", "gs1-blue-100"],
      ["gs1-white", "gs1-blue"], ["gs1-white", "gs1-forest-700"], ["gs1-white", "state-error"], ["gs1-white", "gs1-orange-700"],
      ["gs1-blue-950", "gs1-orange"], ["gs1-orange-700", "gs1-white"], ["gs1-teal-700", "gs1-white"], ["gs1-forest-700", "gs1-white"],
      ["state-error", "gs1-white"], ["gs1-blue-200", "gs1-blue-950"], ["gs1-teal-300", "gs1-blue-950"], ["gs1-forest-300", "gs1-blue-950"], ["gs1-orange-300", "gs1-blue-950"],
      ["ui-ink", "ui-bg"], ["ui-muted", "ui-bg"], ["ui-muted", "gs1-white"], ["ui-ok", "ui-ok-bg"], ["ui-ok", "gs1-white"], ["ui-bad", "ui-bad-bg"],
      ["ui-orange-2", "gs1-white"], ["ui-orange-2", "ui-peach"], ["ui-ink", "ui-sky"], ["ui-navy-2", "ui-sky"], ["gs1-white", "ui-navy-2"], ["gs1-blue", "ui-mist"]
    ];
    // Bianco su arancio solo per il testo grande in grassetto dei pulsanti principali (WCAG: almeno 3:1).
    expect(contrast(TOKENS["gs1-white"], TOKENS["gs1-orange"])).toBeGreaterThanOrEqual(3);
    for (const [fg, bg] of pairs) expect(contrast(TOKENS[fg], TOKENS[bg]), `${fg} su ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
});

describe("contenuti", () => {
  // La parola è composta per non comparire in questo file.
  const banned = new RegExp("b" + "oss", "i");
  it("la vecchia parola inglese per la sfida finale non compare da nessuna parte", () => {
    const hits = files.filter(f => banned.test(f) || banned.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });

  it("nessun residuo dell'anteprima artifact", () => {
    const preview = new RegExp("window\\.c" + "laude");
    expect(sources.filter(f => preview.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});
