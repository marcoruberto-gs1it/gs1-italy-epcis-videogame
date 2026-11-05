// Scomposizione di un GS1 Digital Link (https://id.gs1.org/01/.../10/...) nei suoi Application Identifier.
import { KEY_LENGTH, isValidKey } from "./checkdigit.js";

export const DL_DOMAIN = "https://id.gs1.org";

/** true se il testo è un GS1 Digital Link del dominio id.gs1.org. */
export const isDigitalLink = s => typeof s === "string" && /^https:\/\/id\.gs1\.org\/\d{2,4}\/[^/\s]+/.test(s);

/**
 * Divide il link in coppie { ai, value }. Per le chiavi con cifra di controllo (GTIN, SSCC, GLN, GDTI)
 * aggiunge check: l'ultima cifra della chiave, solo se è corretta.
 */
export function parseDigitalLink(uri) {
  if (!isDigitalLink(uri)) return null;
  const segs = uri.slice(DL_DOMAIN.length + 1).split("/");
  const parts = [];
  for (let i = 0; i < segs.length; i += 2) {
    const ai = segs[i], value = decodeURIComponent(segs[i + 1] ?? "");
    const part = { ai, value };
    const len = KEY_LENGTH[ai];
    if (len && isValidKey(value.slice(0, len))) part.check = value[len - 1];
    parts.push(part);
  }
  return { domain: DL_DOMAIN, parts };
}
