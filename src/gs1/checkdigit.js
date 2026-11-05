// Cifra di controllo GS1 (modulo 10, pesi 3 e 1 da destra) per GTIN, GLN, SSCC e GDTI.

/** Calcola la cifra di controllo per le cifre date (senza la cifra di controllo). */
export function checkDigit(digits) {
  if (!/^\d+$/.test(digits)) throw new Error("Solo cifre: " + digits);
  let sum = 0;
  for (let i = digits.length - 1, w = 3; i >= 0; i--, w = 4 - w) sum += Number(digits[i]) * w;
  return (10 - (sum % 10)) % 10;
}

/** true se l'ultima cifra del codice è la cifra di controllo corretta. */
export const isValidKey = code => /^\d{8,18}$/.test(code) && checkDigit(code.slice(0, -1)) === Number(code.slice(-1));

export const KEY_LENGTH = { "01": 14, "414": 13, "417": 13, "00": 18, "253": 13 };

/** Estrae dalle URI GS1 Digital Link di un testo le chiavi da verificare: { ai, key }. */
export function digitalLinkKeys(text) {
  const out = [];
  for (const [, ai, value] of text.matchAll(/https:\/\/id\.gs1\.org\/(01|414|417|00|253)\/(\d+)/g)) {
    out.push({ ai, key: value.slice(0, KEY_LENGTH[ai]) });
  }
  return out;
}
