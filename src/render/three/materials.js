// Materiali di brand per Three.js. I colori arrivano solo da tokens.js.
//
// Gestione colore: ColorManagement attivo, uscita sRGB, nessun tone mapping. Le luci della scena
// sono tarate (vedi stage.js) perché una faccia rivolta verso l'alto in piena luce mostri
// esattamente il colore del token (ad esempio gs1-blue). Lo verifica tests/e2e/render.spec.js.
import { Color, DataTexture, RedFormat, NearestFilter, MeshToonMaterial, MeshBasicMaterial } from "three";
import { color } from "../../tokens.js";

let gradient = null;
/** Gradiente toon a tre passi: ombra, mezza luce, piena luce (1,0 = colore di brand esatto). */
export function gradientMap() {
  if (gradient) return gradient;
  gradient = new DataTexture(new Uint8Array([150, 205, 255]), 3, 1, RedFormat);
  gradient.minFilter = gradient.magFilter = NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

const cache = new Map();

/** Materiale toon condiviso per un token di colore. Opzioni: { transparent, opacity, emissive }. */
export function toon(token, opts = {}) {
  const key = token + JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  const m = new MeshToonMaterial({ color: new Color(color(token)), gradientMap: gradientMap() });
  if (opts.transparent) { m.transparent = true; m.opacity = opts.opacity ?? 1; m.depthWrite = false; }
  if (opts.emissive) { m.emissive = new Color(color(opts.emissive)); m.emissiveIntensity = opts.emissiveIntensity ?? 1; }
  cache.set(key, m);
  return m;
}

/** Materiale non illuminato (raggi X, onda RFID, marcatori luminosi). */
export function flat(token, opts = {}) {
  const key = "flat:" + token + JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  const m = new MeshBasicMaterial({ color: new Color(color(token)), transparent: !!opts.transparent, opacity: opts.opacity ?? 1, depthWrite: !opts.transparent });
  cache.set(key, m);
  return m;
}

/** Materiale non condiviso, da animare (opacità, colore) e da eliminare con la scena. */
export function own(token, opts = {}) {
  const m = opts.basic
    ? new MeshBasicMaterial({ color: new Color(color(token)) })
    : new MeshToonMaterial({ color: new Color(color(token)), gradientMap: gradientMap() });
  if (opts.transparent) { m.transparent = true; m.opacity = opts.opacity ?? 1; m.depthWrite = false; }
  m.userData.own = true;
  return m;
}

export const brandColor = token => new Color(color(token));

/** Elimina i materiali condivisi (solo quando il 3D viene spento del tutto). */
export function disposeShared() {
  cache.forEach(m => m.dispose());
  cache.clear();
  if (gradient) { gradient.dispose(); gradient = null; }
}
