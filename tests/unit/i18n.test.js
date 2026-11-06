// Italiano e inglese allineati: stessa struttura, stessi identificativi e risposte giuste,
// stessi segnaposto {x} e tag HTML in ogni testo. In inglese: niente italiano rimasto e frasi brevi.
import { describe, it, expect } from "vitest";
import IT from "../../src/content/it.json";
import EN from "../../src/content/en.json";
import { strings, KEEP } from "../../scripts/i18n-paths.js";

/** Tutte le foglie: [percorso, valore] (stringhe, numeri, booleani). */
function leaves(o, p = "", out = []) {
  if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) leaves(v, Array.isArray(o) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
  else out.push([p, o]);
  return out;
}

const itLeaves = new Map(leaves(IT));
const enLeaves = new Map(leaves(EN));
const holes = s => (s.match(/\{\w+\}/g) || []).sort().join(" ");
const tags = s => (s.match(/<\/?[a-z][^>]*>/g) || []).join(" ");

describe("inglese allineato all'italiano", () => {
  it("stessi percorsi", () => {
    expect([...enLeaves.keys()].filter(p => !itLeaves.has(p))).toEqual([]);
    expect([...itLeaves.keys()].filter(p => !enLeaves.has(p))).toEqual([]);
  });

  it("identificativi, numeri e risposte giuste invariati", () => {
    const bad = [];
    for (const [p, v] of itLeaves) {
      const fixed = typeof v !== "string" || KEEP.test(p);
      if (fixed && enLeaves.get(p) !== v) bad.push(`${p}: ${v} → ${enLeaves.get(p)}`);
    }
    expect(bad).toEqual([]);
  });

  it("stessi segnaposto e tag HTML", () => {
    const en = new Map(strings(EN));
    const bad = strings(IT).filter(([p, s]) => holes(s) !== holes(en.get(p)) || tags(s) !== tags(en.get(p))).map(([p]) => p);
    expect(bad).toEqual([]);
  });

  it("nessun testo rimasto in italiano", () => {
    const it = /«|»|\b(il|lo|della|delle|degli|che|non|sono|perché|lotto|vasetto|vasetti|tappa|evento|caseificio)\b/i;
    const bad = strings(EN).filter(([p, s]) => it.test(s.replace(/<code>.*?<\/code>/g, "").replace(/“[^”]*”/g, ""))).map(([p, s]) => `${p}: ${s.slice(0, 70)}`);
    expect(bad).toEqual([]);
  });

  it("frasi di al massimo 24 parole", () => {
    const long = [];
    for (const [p, s] of strings(EN)) for (const f of s.replace(/<[^>]+>/g, "").split(/(?<=[.!?])\s+/)) {
      if (f.split(/\s+/).filter(Boolean).length > 24) long.push(p);
    }
    expect(long).toEqual([]);
  });

  it("le sigle sono spiegate almeno una volta", () => {
    const all = strings(EN).map(([, s]) => s).join("\n");
    for (const [sigla, esteso] of [["EPCIS", "Electronic Product Code Information Services"], ["CBV", "Core Business Vocabulary"], ["GTIN", "Global Trade Item Number"], ["GLN", "Global Location Number"], ["SSCC", "Serial Shipping Container Code"], ["DC", "Distribution Centre"]]) {
      expect(all.includes(sigla), sigla).toBe(true);
      expect(all.includes(esteso), `${sigla}: manca «${esteso}»`).toBe(true);
    }
  });
});
