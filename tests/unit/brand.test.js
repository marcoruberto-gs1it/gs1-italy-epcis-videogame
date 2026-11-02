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
    const pairs = [
      ["gs1-white", "gs1-blue-900"], ["gs1-white", "gs1-blue"], ["gs1-blue-200", "gs1-blue-900"], ["gs1-blue-200", "gs1-blue"],
      ["gs1-teal", "gs1-blue-900"], ["gs1-teal-300", "gs1-blue-900"], ["gs1-forest-300", "gs1-blue-900"],
      ["gs1-orange", "gs1-blue-900"], ["gs1-orange", "gs1-blue-950"], ["gs1-orange-300", "gs1-blue"],
      ["gs1-blue-950", "gs1-orange"], ["gs1-blue-950", "gs1-teal"], ["gs1-blue-950", "gs1-forest"],
      ["state-error", "gs1-blue-900"], ["gs1-blue-950", "state-error"]
    ];
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
    expect(sources.filter(f => /window\.claude/.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});
