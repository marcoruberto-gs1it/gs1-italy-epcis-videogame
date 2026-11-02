import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { checkDigit, isValidKey, digitalLinkKeys } from "../../src/gs1/checkdigit.js";

describe("cifra di controllo GS1", () => {
  it("calcola la cifra di controllo di codici noti", () => {
    expect(checkDigit("0950600013435")).toBe(2);   // GTIN-14 di esempio GS1
    expect(checkDigit("061414100777")).toBe(6);    // GLN di esempio
    expect(checkDigit("10614141123456789")).toBe(7); // SSCC di esempio
  });

  it("riconosce codici sbagliati", () => {
    expect(isValidKey("09506000134352")).toBe(true);
    expect(isValidKey("09506000134353")).toBe(false);
    expect(isValidKey("abc")).toBe(false);
  });

  const files = readdirSync("src/data/events").filter(f => f.endsWith(".json"));
  it.each(files)("tutti gli identificativi di %s hanno la cifra di controllo corretta", file => {
    const keys = digitalLinkKeys(readFileSync("src/data/events/" + file, "utf8"));
    for (const { ai, key } of keys) expect(isValidKey(key), `AI ${ai} ${key}`).toBe(true);
  });
});
