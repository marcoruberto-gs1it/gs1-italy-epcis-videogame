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

import { parseDigitalLink, isDigitalLink } from "../../src/gs1/digitallink.js";

// Codici costruiti sui prefissi d'esempio della guida GS1 Italy (800000000 caseificio, 803208900 distribuzione).
describe("GS1 Digital Link", () => {
  it("scompone prodotto e lotto", () => {
    const dl = parseDigitalLink("https://id.gs1.org/01/08000000001016/10/L123");
    expect(dl.domain).toBe("https://id.gs1.org");
    expect(dl.parts).toEqual([{ ai: "01", value: "08000000001016", check: "6" }, { ai: "10", value: "L123" }]);
  });
  it("scompone luogo e parte del luogo, SSCC e bene aziendale", () => {
    expect(parseDigitalLink("https://id.gs1.org/414/8000000000026/254/vasca1").parts.map(p => p.ai)).toEqual(["414", "254"]);
    expect(parseDigitalLink("https://id.gs1.org/00/180000000012345679").parts[0].check).toBe("9");
    expect(parseDigitalLink("https://id.gs1.org/8004/800000000SENS042").parts[0]).toEqual({ ai: "8004", value: "800000000SENS042" });
  });
  it("ignora testi che non sono Digital Link", () => {
    expect(isDigitalLink("https://ref.gs1.org/cbv/BizStep-commissioning")).toBe(false);
    expect(parseDigitalLink("urn:epc:id:sgtin:0614141.112345.400")).toBeNull();
  });
});
