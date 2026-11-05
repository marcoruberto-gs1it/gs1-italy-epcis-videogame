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

describe("GS1 Digital Link", () => {
  it("scompone prodotto e lotto", () => {
    const dl = parseDigitalLink("https://id.gs1.org/01/09506000134352/10/L123");
    expect(dl.domain).toBe("https://id.gs1.org");
    expect(dl.parts).toEqual([{ ai: "01", value: "09506000134352", check: "2" }, { ai: "10", value: "L123" }]);
  });
  it("scompone luogo e parte del luogo, SSCC e bene aziendale", () => {
    expect(parseDigitalLink("https://id.gs1.org/414/0614141007776/254/vasca1").parts.map(p => p.ai)).toEqual(["414", "254"]);
    expect(parseDigitalLink("https://id.gs1.org/00/106141411234567897").parts[0].check).toBe("7");
    expect(parseDigitalLink("https://id.gs1.org/8004/0614141SENS042").parts[0]).toEqual({ ai: "8004", value: "0614141SENS042" });
  });
  it("ignora testi che non sono Digital Link", () => {
    expect(isDigitalLink("https://ref.gs1.org/cbv/BizStep-commissioning")).toBe(false);
    expect(parseDigitalLink("urn:epc:id:sgtin:0614141.112345.400")).toBeNull();
  });
});
