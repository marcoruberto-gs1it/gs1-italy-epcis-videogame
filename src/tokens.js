// File generato da scripts/gen-tokens.js a partire da src/styles/tokens.css. Non modificarlo a mano.
export const TOKENS = {
  "gs1-blue": "#002C6C",
  "gs1-orange": "#F26334",
  "gs1-teal": "#22BCB9",
  "gs1-forest": "#00B74F",
  "gs1-white": "#FFFFFF",
  "gs1-off-white": "#FAF9F5",
  "gs1-light-gray": "#E5E8EB",
  "gs1-dark-gray": "#4A4A4A",
  "gs1-blue-950": "#000D2C",
  "gs1-blue-900": "#00163E",
  "gs1-blue-800": "#002154",
  "gs1-blue-700": "#113D7E",
  "gs1-blue-600": "#234E91",
  "gs1-blue-200": "#B8D3FE",
  "gs1-orange-700": "#C53E03",
  "gs1-orange-300": "#FE9575",
  "gs1-teal-700": "#077977",
  "gs1-teal-300": "#5AE3E0",
  "gs1-forest-900": "#013311",
  "gs1-forest-700": "#058237",
  "gs1-forest-300": "#4CDF75",
  "gs1-warm-400": "#A9A8A4",
  "gs1-warm-600": "#767571",
  "state-error": "#FF6B6B"
};

/** Restituisce il colore esadecimale di un token, ad esempio color("gs1-blue"). */
export const color = name => {
  if (!(name in TOKENS)) throw new Error("Token di colore sconosciuto: " + name);
  return TOKENS[name];
};
