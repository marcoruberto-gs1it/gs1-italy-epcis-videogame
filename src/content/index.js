// Testi del gioco in italiano (it.json) e in inglese (en.json): t("map.play", { id: "1-2" }).
// La lingua si sceglie in alto a destra; resta salvata nel browser e vale anche per la pagina del vasetto.
import IT from "./it.json";
import EN from "./en.json";

export const LANGS = { it: IT, en: EN };
export const LANG_KEY = "missione-l123-lang";

/** Lingua attiva: ?lang=en nell'indirizzo, poi la scelta salvata, altrimenti italiano. */
function pickLang() {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && q in LANGS) return q;
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && saved in LANGS) return saved;
  } catch { /* browser senza localStorage: italiano */ }
  return "it";
}

export const lang = typeof location === "undefined" ? "it" : pickLang();
const TEXT = LANGS[lang];

/** Cambia lingua: la salva e ricarica il gioco, che riparte dal punto salvato (mappa o traguardo). */
export function setLang(l) {
  if (!(l in LANGS) || l === lang) return;
  try { localStorage.setItem(LANG_KEY, l); } catch { /* niente */ }
  const url = new URL(location.href);
  url.searchParams.delete("lang");
  location.replace(url.href);
}

export function t(path, vars = {}) {
  const value = path.split(".").reduce((o, k) => (o == null ? o : o[k]), TEXT);
  if (value == null) throw new Error("Testo mancante: " + path);
  return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : value;
}
