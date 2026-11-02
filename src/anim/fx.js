// Piccole animazioni arcade, tutte con GSAP e legate alla schermata corrente.
import { gsap, reduced } from "./gsap-setup.js";
import { anim } from "../engine/router.js";

/** Saltello continuo a due passi (vasetto, indicatore "sei qui"). */
export function bob(el) {
  if (!el || reduced()) return;
  anim(() => gsap.to(el, { y: -6, duration: 0.6, ease: "steps(1)", repeat: -1, yoyo: true }));
}

/** Lampeggio continuo (PREMI INVIO, allarme). */
export function blink(el) {
  if (!el || reduced()) return;
  anim(() => gsap.to(el, { autoAlpha: 0, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true }));
}

/** Scossone sugli errori. */
export function shake(el) {
  if (!el || reduced()) return;
  anim(() => gsap.fromTo(el, { x: 0, y: 0 }, { keyframes: [{ x: -6, y: 2 }, { x: 6, y: -2 }, { x: -4, y: 0 }, { x: 0, y: 0 }], duration: 0.32, ease: "steps(1)" }));
}

/** Camion che attraversa la strada. */
export function drive(truck, road, duration) {
  if (!truck || !road) return;
  const dist = road.clientWidth - truck.clientWidth;
  if (reduced()) { gsap.set(truck, { x: dist }); return; }
  anim(() => gsap.to(truck, { x: dist, duration, ease: "steps(16)" }));
}

/** Onda del lettore RFID. */
export function wave(el) {
  if (!el || reduced()) return;
  anim(() => gsap.fromTo(el, { width: 20, height: 20, autoAlpha: 1 }, { width: 480, height: 480, autoAlpha: 0, duration: 1, ease: "steps(6)", repeat: 1 }));
}

/** Raggio dello scanner ai raggi X che scorre dall'alto in basso. */
export function beam(el) {
  if (!el || reduced()) return;
  anim(() => gsap.fromTo(el, { top: "0%", autoAlpha: 0.9 }, { top: "100%", duration: 1, ease: "steps(10)", onComplete: () => gsap.set(el, { autoAlpha: 0 }) }));
}

/** Scrive le righe del JSON una alla volta. Con reduced-motion le mostra subito. */
export function typeLines(pre, lines, onTick) {
  if (reduced()) { pre.innerHTML = lines.join("\n"); return; }
  const p = { i: 0 };
  let shown = 0;
  pre.innerHTML = "";
  anim(() => gsap.to(p, {
    i: lines.length, duration: lines.length * 0.045, ease: "none",
    onUpdate() {
      const n = Math.ceil(p.i);
      if (n === shown) return;
      shown = n;
      pre.innerHTML = lines.slice(0, n).join("\n");
      if (n % 3 === 0 && onTick) onTick();
    }
  }));
}
