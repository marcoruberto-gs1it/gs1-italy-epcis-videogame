// Collega le schermate al renderer attivo. I livelli chiamano hook("xray") e simili: la versione 2D
// aggiorna già il DOM, la scena 3D (se attiva) riceve lo stesso aggancio. Gli agganci vengono registrati,
// così passando al 3D a metà livello la scena riparte dallo stesso punto, e passando al 2D non si perde nulla.
import { initialRenderer, initialQuality, webglAvailable } from "./detect.js";
import { Stage } from "./three/stage.js";

export const render = { mode: initialRenderer(), quality: initialQuality(), reason: null };

const listeners = new Set();
let stage = null;
let current = null;

const notify = () => listeners.forEach(fn => fn(render));
export const onRender = fn => { listeners.add(fn); return () => listeners.delete(fn); };

function getStage() {
  if (stage) return stage;
  try {
    stage = new Stage({ quality: render.quality, onFail: fail, onQuality: q => { render.quality = q; notify(); } });
  } catch {
    fail("WebGL non disponibile");
  }
  return stage;
}

/** Il 3D non funziona più: si continua in 2D, senza ricaricare e senza perdere lo stato. */
export function fail(reason) {
  render.mode = "2d";
  render.reason = reason;
  detach3d();
  if (stage) { try { stage.destroy(); } catch {} stage = null; }
  notify();
}

/** Mostra la scena di una schermata. build(api) costruisce la scena 3D; null se la schermata è solo 2D. */
export function mountScene(container, build) {
  current = { container, build, history: [], hooks: null };
  if (render.mode === "3d" && build) attach3d();
}

function attach3d() {
  if (!current || !current.build) return;
  const s = getStage();
  if (!s) return;
  try {
    const content = s.show(current.container, current.build);
    current.hooks = content.hooks || {};
    current.container.classList.add("r3d");
    s.instant = true;
    current.history.forEach(([name, args]) => call(name, args));
    s.instant = false;
    s.dirty = true;
  } catch (e) {
    console.warn("[Missione L123] scena 3D non disponibile:", e);
    fail("errore nella scena 3D");
  }
}

function detach3d() {
  if (current) { current.container.classList.remove("r3d"); current.hooks = null; }
  if (stage) stage.clear();
}

function call(name, args) {
  const f = current && current.hooks && current.hooks[name];
  if (!f) return;
  try { f(...args); } catch (e) { console.warn("[Missione L123] aggancio 3D", name, e); }
}

/** Aggancio di scena chiamato dai livelli: registrato e inoltrato alla scena 3D attiva. */
export function hook(name, ...args) {
  if (!current) return;
  current.history.push([name, args]);
  call(name, args);
}

export function unmountScene() {
  if (stage) stage.clear();
  current = null;
}

/** Tasto R: cambia renderer al volo, restando nello stesso punto del gioco. */
export function toggleRenderer() {
  if (render.mode === "3d") {
    render.mode = "2d"; render.reason = "manual";
    detach3d();
  } else if (webglAvailable()) {
    render.mode = "3d"; render.reason = null;
    attach3d();
  }
  notify();
}

/** Tasto X: pixelatura leggera del 3D (non in qualità bassa). */
export function togglePixel() { if (stage && render.mode === "3d") { stage.togglePixel(); stage.dirty = true; } }

// Strumenti per i test automatici e per chi presenta (console del browser).
window.missioneL123 = {
  mode: () => render.mode,
  quality: () => render.quality,
  reason: () => render.reason,
  memory: () => (stage ? { ...stage.info(), programs: stage.renderer.info.programs?.length ?? 0 } : null),
  loseContext: () => { const ext = stage && stage.renderer.getContext().getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); return !!ext; },
  probe: () => (stage && stage.content && stage.content.probe ? stage.project(stage.content.probe()) : null),
  sample: (x, y) => (stage ? stage.sample(x, y) : null),
  /** Draw call e triangoli di un fotogramma della scena corrente, più il pixel ratio usato. */
  stats: () => {
    if (!stage || !stage.scene) return null;
    stage.renderer.render(stage.scene, stage.camera);
    const r = stage.renderer.info.render;
    return { calls: r.calls, triangles: r.triangles, pixelRatio: stage.renderer.getPixelRatio(), quality: render.quality };
  }
};
