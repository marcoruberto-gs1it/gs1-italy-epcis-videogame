import { describe, it, expect } from "vitest";
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

  it("estrae le chiavi dalle URI GS1 Digital Link", () => {
    expect(digitalLinkKeys("https://id.gs1.org/01/09506000134352/10/L123 https://id.gs1.org/417/0614141000029"))
      .toEqual([{ ai: "01", key: "09506000134352" }, { ai: "417", key: "0614141000029" }]);
  });
});
