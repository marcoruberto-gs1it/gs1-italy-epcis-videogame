// Percorsi delle stringhe di it.json che si traducono. Restano uguali in tutte le lingue gli identificativi
// usati dal codice: id, unlock, sp (sprite), who (ruoli), mapLit e mapNotice (luoghi della mappa del richiamo).
export const KEEP = /(^|\.)(id|unlock|sp)$|\.(who|mapLit|mapNotice)\[\d+\]$/;

/** Coppie [percorso, testo] di tutte le stringhe da tradurre. */
export function strings(obj) {
  const out = [];
  (function walk(o, p) {
    if (typeof o === "string") { if (!KEEP.test(p)) out.push([p, o]); }
    else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${p}[${i}]`));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k);
  })(obj, "");
  return out;
}

/** Copia di base con le stringhe tradotte al loro posto (percorso → testo). */
export function rebuild(base, tr) {
  const copy = JSON.parse(JSON.stringify(base));
  for (const [path, text] of Object.entries(tr)) {
    const keys = path.match(/[^.[\]]+/g);
    let o = copy;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = text;
  }
  return copy;
}
