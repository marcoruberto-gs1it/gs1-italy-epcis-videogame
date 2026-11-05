// Router delle schermate. A ogni cambio di schermata ferma animazioni e timer della schermata precedente.
import { gsap } from "../anim/gsap-setup.js";
import { clearSkippable } from "../anim/skip.js";
import { reveal } from "../anim/transitions.js";
import { unmountScene } from "../render/scene-host.js";
import { state, commit } from "./state.js";

const screens = {};
let scope = gsap.context(() => {});
const timers = new Set();

export function register(name, render) { screens[name] = render; }

const routeListeners = new Set();
/** Avvisa dopo ogni cambio di schermata (note per chi presenta, aiuto). */
export const onRoute = fn => { routeListeners.add(fn); return () => routeListeners.delete(fn); };

export function go(name, arg) {
  if (!screens[name]) throw new Error("Schermata sconosciuta: " + name);
  scope.revert();
  clearSkippable();
  unmountScene();
  timers.forEach(id => { clearInterval(id); clearTimeout(id); });
  timers.clear();
  document.querySelectorAll(".fx-particle, .float-score").forEach(el => el.remove());
  scope = gsap.context(() => {});
  state.view = name;
  if (name !== "level" && name !== "intro" && name !== "win") state.level = null;
  commit();
  screens[name](arg);
  const heading = document.querySelector("#screen h1, #screen h2");
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  reveal();
  routeListeners.forEach(fn => fn(name, arg));
}

/** Registra animazioni GSAP nella schermata corrente, così vengono annullate quando si cambia schermata. */
export const anim = fn => scope.add(fn);

// In pausa (archivio degli eventi aperto) i conti alla rovescia non avanzano.
let paused = false;
export const setPaused = v => { paused = !!v; };

/** Timer legati alla schermata corrente: si fermano da soli quando si cambia schermata. */
export const later = {
  every(fn, ms) { const id = setInterval(() => { if (!paused) fn(); }, ms); timers.add(id); return id; },
  after(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
  stop(id) { clearInterval(id); clearTimeout(id); timers.delete(id); }
};
