// Materiali di brand per Three.js, in stile illustrazione isometrica vettoriale. I colori arrivano solo da tokens.js.
//
// Gestione colore: ColorManagement attivo, uscita sRGB, nessun tone mapping. Le luci della scena (stage.js)
// danno tre toni piatti a ogni oggetto: la faccia superiore mostra esattamente il colore del token
// (ad esempio gs1-blue), la faccia rivolta a destra l'85%, quella rivolta a sinistra il 70%.
// Lo verifica tests/e2e/render.spec.js.
import { Color, MeshLambertMaterial, MeshBasicMaterial } from "three";
import { color } from "../../tokens.js";

const cache = new Map();

/** Materiale condiviso per un token di colore. Opzioni: { transparent, opacity }. */
export function toon(token, opts = {}) {
  const key = token + JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  const m = new MeshLambertMaterial({ color: new Color(color(token)), flatShading: !!opts.flat });
  if (opts.transparent) { m.transparent = true; m.opacity = opts.opacity ?? 1; m.depthWrite = false; }
  cache.set(key, m);
  return m;
}

/** Materiale non illuminato (raggi X, onda RFID, sciami di particelle). */
export function flat(token, opts = {}) {
  const key = "flat:" + token + JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  const m = new MeshBasicMaterial({ color: new Color(color(token)), transparent: !!opts.transparent, opacity: opts.opacity ?? 1, depthWrite: !opts.transparent });
  cache.set(key, m);
  return m;
}

/** Materiale non condiviso, da animare (opacità, colore) e da eliminare con la scena. */
export function own(token, opts = {}) {
  const m = opts.basic ? new MeshBasicMaterial({ color: new Color(color(token)) }) : new MeshLambertMaterial({ color: new Color(color(token)) });
  if (opts.transparent) { m.transparent = true; m.opacity = opts.opacity ?? 1; m.depthWrite = false; }
  m.userData.own = true;
  return m;
}

export const brandColor = token => new Color(color(token));

/** Elimina i materiali condivisi (solo quando il 3D viene spento del tutto). */
export function disposeShared() {
  cache.forEach(m => m.dispose());
  cache.clear();
}
