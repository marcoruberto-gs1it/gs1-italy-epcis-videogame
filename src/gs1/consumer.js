// Il QR code del vasetto: un GS1 Digital Link con GTIN, lotto e data «da consumarsi preferibilmente entro».
// Lo usano sia il gioco (schermata del consumatore, con il QR code) sia la pagina prodotto generata in fase di build.
// Sintassi GS1 Digital Link 1.4: dominio (anche quello della marca) + /01/{GTIN}/10/{lotto} + ?15={AAMMGG}.

/** Indirizzo pubblico del gioco su GitHub Pages: il QR code porta qui. */
export const PUBLIC_BASE = "https://marcoruberto-gs1it.github.io/gs1-italy-epcis-videogame";

export const JAR = {
  gtin: "08000000001016",
  lot: "L123",
  // Uguale a gs1:bestBeforeDate nell'ILMD della trasformazione (tappa 1-2): lo verifica un test.
  bestBefore: "2026-11-30"
};

/** AAMMGG, il formato delle date negli Application Identifier GS1 (es. 2026-11-30 → 261130). */
export const toYYMMDD = iso => iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10);

/** Percorso del Digital Link: chiave primaria e qualificatore nel percorso, la data nella query. */
export const jarPath = (j = JAR) => `/01/${j.gtin}/10/${encodeURIComponent(j.lot)}`;

/** Link completo stampato nel QR code del vasetto. */
export const jarLink = (j = JAR, base = PUBLIC_BASE) => `${base}${jarPath(j)}?15=${toYYMMDD(j.bestBefore)}`;

/** Lo stesso link scomposto nei suoi pezzi, per spiegarlo: dominio, (01), (10), (15). */
export const jarParts = (j = JAR, base = PUBLIC_BASE) => [
  { ai: null, value: base.replace("https://", "") },
  { ai: "01", value: j.gtin },
  { ai: "10", value: j.lot },
  { ai: "15", value: toYYMMDD(j.bestBefore), query: true }
];
