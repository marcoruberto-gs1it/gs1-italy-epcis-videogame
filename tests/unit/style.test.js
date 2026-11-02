// Regole di scrittura GS1 Italy verificate su tutti i testi di it.json.
import { describe, it, expect } from "vitest";
import IT from "../../src/content/it.json";

const texts = [];
(function walk(o, path) {
  if (typeof o === "string") texts.push([path, o.replace(/<code>.*?<\/code>/g, "").replace(/<[^>]+>/g, "")]);
  else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
})(IT, "");

// Etichette brevi in maiuscolo (HUD, pulsanti, tasti): non sono frasi da leggere.
const isLabel = s => /^[A-ZÀÈÉÌÒÙ0-9 ·:!?\-'’,.()+/{}%▶✓]+$/.test(s);
const prose = texts.filter(([, s]) => !isLabel(s));

describe("stile di scrittura GS1 Italy", () => {
  it("numeri da uno a dieci in lettere (tranne nomi propri e orari: vasca 1, round 2, 8:15)", () => {
    const bad = [];
    for (const [path, s] of prose) {
      for (const m of s.matchAll(/(^|[\s(])([1-9]|10)(?=[\s.,;:!?)]|$)/g)) {
        const before = s.slice(0, m.index + m[1].length);
        const after = s.slice(m.index + m[0].length);
        if (/(vasca|linea|baia|round|Round|Ore|alle|livello|Mondo|mondo|tappa|Tappa)\s$/.test(before)) continue;
        if (/^:\d|^\s?°C|^[,.]\d/.test(after) || /\(\d\)\.\w+$/.test(s)) continue;
        bad.push(`${path}: «${s.slice(0, 80)}»`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("«barcode» minuscolo, «standard» e «sistema» minuscoli", () => {
    expect(prose.filter(([, s]) => /\bBarcode\b|\bStandard\b|\bSistema\b/.test(s)).map(([p]) => p)).toEqual([]);
  });

  it("maiuscole accentate corrette (È, non E')", () => {
    expect(texts.filter(([, s]) => /\bE['’]\s/.test(s)).map(([p]) => p)).toEqual([]);
  });

  it("plurali stranieri invariati (i tag, i barcode)", () => {
    expect(prose.filter(([, s]) => /\b(tags|barcodes|pallets|sensors)\b/i.test(s)).map(([p]) => p)).toEqual([]);
  });

  it("niente maschile generico nei testi narrativi", () => {
    const re = /\b(gli|i|ai|dai|dei|degli) (consumatori|clienti|operatori|giocatori|utenti|presentatori)\b|\b(un|l') ?(operatore|giocatore|utente|presentatore)\b/i;
    expect(prose.filter(([, s]) => re.test(s)).map(([p, s]) => `${p}: ${s}`)).toEqual([]);
  });

  it("frasi di al massimo 24 parole", () => {
    const long = [];
    for (const [path, s] of prose) for (const f of s.split(/(?<=[.!?])\s+/)) {
      const n = f.split(/\s+/).filter(Boolean).length;
      if (n > 24) long.push(`${path} (${n} parole)`);
    }
    expect(long).toEqual([]);
  });

  it("le sigle sono spiegate almeno una volta", () => {
    const all = texts.map(([, s]) => s).join("\n");
    for (const [sigla, esteso] of [["EPCIS", "Electronic Product Code Information Services"], ["EPC", "Electronic Product Code"], ["CBV", "Core Business Vocabulary"], ["GTIN", "Global Trade Item Number"], ["GLN", "Global Location Number"], ["SSCC", "Serial Shipping Container Code"], ["RFID", "Radio Frequency Identification"], ["DPP", "Passaporto Digitale di Prodotto"], ["CeDi", "Centro di Distribuzione"]]) {
      expect(all.includes(sigla), sigla).toBe(true);
      expect(all.includes(esteso), `${sigla}: manca «${esteso}»`).toBe(true);
    }
  });
});
