// QR code del vasetto: GS1 Digital Link con GTIN, lotto e data, coerente con gli eventi del gioco.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { JAR, jarLink, jarPath, jarParts, toYYMMDD, PUBLIC_BASE } from "../../src/gs1/consumer.js";
import { isValidKey } from "../../src/gs1/checkdigit.js";
import { consumerPageHtml } from "../../scripts/consumer-page.js";

const latte = JSON.parse(readFileSync("src/data/events/food-latte.json", "utf8"));

describe("GS1 Digital Link del vasetto", () => {
  it("sintassi: /01/{GTIN}/10/{lotto}?15={AAMMGG}", () => {
    expect(jarLink()).toBe(`${PUBLIC_BASE}/01/08000000001016/10/L123?15=261130`);
    expect(jarPath()).toMatch(/^\/01\/\d{14}\/10\/[!-~]{1,20}$/);
    expect(toYYMMDD("2026-11-30")).toBe("261130");
    expect(jarParts().map(p => p.ai)).toEqual([null, "01", "10", "15"]);
  });

  it("GTIN con cifra di controllo corretta", () => {
    expect(isValidKey(JAR.gtin)).toBe(true);
  });

  it("stesso GTIN e lotto dello yogurt prodotto, stessa data dell'ILMD (gs1:bestBeforeDate)", () => {
    const e = latte[0];
    expect(e.outputQuantityList[0].epcClass).toBe(`https://id.gs1.org${jarPath()}`);
    expect(e.ilmd["gs1:bestBeforeDate"]).toBe(JAR.bestBefore);
  });
});

describe("pagina del vasetto", () => {
  const html = consumerPageHtml();
  it("richiamo in evidenza, prima del resto", () => {
    expect(html.indexOf('class="recall"')).toBeLessThan(html.indexOf('id="productTitle"'));
    expect(html).toContain("Non mangiare lo yogurt di questo lotto");
    expect(html).toContain("30 novembre 2026");
    expect(html).toContain("5 novembre 2026");
  });
  it("storia del lotto dagli eventi, senza segnaposto rimasti", () => {
    expect((html.match(/<li class="step/g) || []).length).toBe(9);
    expect(html).toContain("tra 4,1 e 9 °C");
    expect(html).not.toMatch(/\{\w+\}/);
  });
  it("niente colori scritti a mano fuori dai token", () => {
    const css = html.split("</style>")[0].split(":root {")[1].split("\n}\n").slice(1).join("");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });
});
