// Ogni evento del gioco viene validato contro lo schema JSON ufficiale di EPCIS 2.0
// (schemas/epcis-json-schema.json, scaricato da ref.gs1.org) e contro le regole di coerenza del gioco.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { toDocument } from "../../src/gs1/epcis.js";
import { isValidKey, digitalLinkKeys } from "../../src/gs1/checkdigit.js";

const schema = JSON.parse(readFileSync("schemas/epcis-json-schema.json", "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const files = readdirSync("src/data/events").filter(f => f.endsWith(".json"));
const load = f => JSON.parse(readFileSync("src/data/events/" + f, "utf8"));
const all = Object.fromEntries(files.map(f => [f.replace(".json", ""), load(f)]));

describe("schema EPCIS 2.0", () => {
  it.each(files)("%s è valido dentro un EPCISDocument", f => {
    const ok = validate(toDocument(load(f)));
    expect(ok, JSON.stringify(validate.errors, null, 1)).toBe(true);
  });

  it.each(files)("%s: chiavi GS1 con cifra di controllo corretta", f => {
    for (const { ai, key } of digitalLinkKeys(readFileSync("src/data/events/" + f, "utf8"))) expect(isValidKey(key), `AI ${ai} ${key}`).toBe(true);
  });
});

// Informazioni del lotto (ILMD): solo termini del GS1 Web Vocabulary (https://ref.gs1.org/voc/, v1.16),
// con il prefisso gs1: definito nel contesto JSON-LD ufficiale di EPCIS 2.0. Niente più cbvmda:.
describe("ILMD con il GS1 Web Vocabulary", () => {
  const TERMS = { "gs1:bestBeforeDate": "date", "gs1:productionDate": "date", "gs1:countryOfOrigin": "country" };
  for (const [name, events] of Object.entries(all)) {
    it(name, () => {
      for (const e of events) {
        if (!e.ilmd) continue;
        expect(e.type === "TransformationEvent" || e.action === "ADD", "ILMD solo alla nascita").toBe(true);
        for (const [k, v] of Object.entries(e.ilmd)) {
          expect(TERMS[k], `termine ${k}`).toBeDefined();
          if (TERMS[k] === "date") expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          if (TERMS[k] === "country") expect(v).toEqual({ "gs1:countryCode": expect.stringMatching(/^[A-Z]{2}$/) });
        }
      }
    });
  }
});

describe("uso corretto di action", () => {
  for (const [name, events] of Object.entries(all)) {
    it(name, () => {
      for (const e of events) {
        if (e.type === "TransformationEvent") expect(e.action).toBeUndefined();
        else expect(["ADD", "OBSERVE", "DELETE"]).toContain(e.action);
        if (e.action === "ADD") expect(["AggregationEvent", "AssociationEvent", "ObjectEvent"]).toContain(e.type);
      }
    });
  }
});

describe("coerenza delle quantità", () => {
  const L123 = "https://id.gs1.org/01/08000000001016/10/L123";

  it("la trasformazione crea 288 vasetti del lotto L123", () => {
    expect(all["food-latte"][0].outputQuantityList).toEqual([{ epcClass: L123, quantity: 288 }]);
  });

  it("12 cartoni da 24 vasetti sul pallet: 288", () => {
    const [carton, pallet] = all["food-raggi-x"];
    expect(carton.childQuantityList[0].quantity * pallet.childEPCs.length).toBe(288);
    expect(pallet.childEPCs).toHaveLength(12);
    expect(new Set(pallet.childEPCs).size).toBe(12);
  });

  it("il richiamo blocca 264 vasetti di L123 (+24 già venduti = 288) e tutto L124", () => {
    let l123 = 0, l124 = 0;
    for (const e of all["sfida-finale"]) {
      expect(e.disposition).toBe("recalled");
      for (const q of e.quantityList || []) {
        if (q.epcClass === L123) l123 += q.quantity;
        if (q.epcClass.endsWith("/10/L124")) l124 += q.quantity;
      }
      // I cartoni richiamati per SSCC contengono 24 vasetti ciascuno.
      if (!e.quantityList) l123 += 24 * e.epcList.length;
    }
    expect(l123).toBe(264);
    expect(l123 + 24).toBe(288);
    expect(l124).toBe(288);
  });

  it("la correzione dell'errore punta all'evento corretto", () => {
    const [wrong, fixed] = all["food-errore"];
    expect(wrong.errorDeclaration.correctiveEventIDs).toEqual([fixed.eventID]);
    expect(wrong.quantityList[0].epcClass).toMatch(/L132$/);
    expect(fixed.quantityList[0].epcClass).toBe(L123);
  });

  it("le t-shirt prodotte sono le stesse dell'inventario (24)", () => {
    const made = all["tessile-filo"][2].outputEPCList;
    expect(made).toHaveLength(24);
    expect(all["tessile-inventario"][0].epcList).toEqual(made);
  });
});
