// Piccole animazioni arcade, tutte con GSAP e legate alla schermata corrente.
import { gsap, reduced } from "./gsap-setup.js";
import { anim } from "../engine/router.js";

/** Saltello continuo a due passi (vasetto, indicatore "sei qui"). */
export function bob(el) {
  if (!el || reduced()) return;
  anim(() => gsap.to(el, { y: -6, duration: 0.6, ease: "steps(1)", repeat: -1, yoyo: true }));
}

/** Lampeggio continuo (PREMI INVIO, allarme). Si attenua senza sparire, così il testo resta leggibile. */
export function blink(el) {
  if (!el || reduced()) return;
  anim(() => gsap.to(el, { opacity: 0.3, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true }));
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

/** Mostra subito tutte le righe del JSON: il testo non dipende mai da un'animazione. */
export function typeLines(pre, lines, onTick, onDone) {
  pre.innerHTML = lines.join("\n");
  if (onTick) onTick();
  if (onDone) onDone();
}

/** Sostituisce a intervalli l'immagine di uno sprite (occhi che sbattono, ruote che girano). */
export function frames(imgEl, srcs, every = 0.35, repeatDelay = 0) {
  if (!imgEl || reduced()) return;
  let i = 0;
  anim(() => gsap.to({}, {
    duration: every, repeat: -1, repeatDelay,
    onRepeat() { i = (i + 1) % srcs.length; imgEl.src = srcs[i]; }
  }));
}

/** Esplosione di quadratini a partire da un elemento (risposta giusta, superpotere). */
export function burst(el, colors = ["var(--gs1-forest)", "var(--gs1-white)", "var(--gs1-forest-300)"], n = 14) {
  if (!el || reduced()) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + Math.min(r.width, 60) / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.className = "fx-particle";
    p.style.left = cx + "px"; p.style.top = cy + "px"; p.style.background = colors[i % colors.length];
    document.body.appendChild(p);
    const a = (Math.PI * 2 * i) / n, d = 40 + Math.random() * 50;
    anim(() => gsap.to(p, { x: Math.cos(a) * d, y: Math.sin(a) * d, autoAlpha: 0, duration: 0.6, ease: "steps(6)", onComplete: () => p.remove() }));
  }
}

/** Piccolo battito per attirare l'attenzione (numero del conto alla rovescia, quadratino del potere). */
export function pulse(el, scale = 1.35) {
  if (!el || reduced()) return;
  anim(() => gsap.fromTo(el, { scale }, { scale: 1, duration: 0.35, ease: "steps(3)" }));
}

/** Testo "+N" che sale e sparisce sopra un elemento (decorativo: non blocca Invio). */
export function floatScore(el, text) {
  if (!el || reduced()) return;
  const r = el.getBoundingClientRect();
  const f = document.createElement("span");
  f.className = "float-score"; f.textContent = text;
  f.style.left = r.left + "px"; f.style.top = r.top + "px";
  document.body.appendChild(f);
  anim(() => gsap.fromTo(f, { y: 0, autoAlpha: 1 }, { y: -70, autoAlpha: 0, duration: 1.2, ease: "power1.out", onComplete: () => f.remove() }));
}

/** Entrata "a scatti" di un elemento: cade dall'alto. Resta sempre visibile. */
export function dropIn(el, delay = 0) {
  if (!el || reduced()) return;
  anim(() => gsap.from(el, { y: -40, duration: 0.3, delay, ease: "steps(4)" }));
}

/** Entrata di più elementi uno dopo l'altro: si spostano, ma il testo è visibile da subito. */
export function staggerIn(els, from = { x: -20 }) {
  if (!els || !els.length || reduced()) return;
  anim(() => gsap.from(els, { ...from, duration: 0.25, stagger: 0.08, ease: "steps(3)" }));
}

/** Comparsa con rimbalzo (vasetto appena nato, superpotere). Resta sempre visibile e leggibile. */
export function popIn(el, delay = 0) {
  if (!el || reduced()) return;
  anim(() => gsap.from(el, { scale: 0.85, duration: 0.35, delay, ease: "back.out(2)" }));
}

/**
 * Ingresso di una schermata "titolo" (intro dei livelli, titolo, finale). Titolo, narratore, testi
 * e pulsanti sono visibili da subito e non cambiano: si muove solo l'immagine dell'eroe.
 */
export function introSequence(root, { heroBounce = true } = {}) {
  if (!root || reduced()) return;
  const hero = root.querySelector("#hero") || root.closest(".intro-layout, .home, .final")?.querySelector("#hero");
  if (hero && heroBounce) anim(() => gsap.from(hero, { y: -60, duration: 0.6, ease: "bounce.out" }));
}

/** Occhi che sbattono ogni tanto: per un attimo mostra lo sprite con gli occhi chiusi. */
export function eyes(imgEl, open, closed, every = 2.6) {
  if (!imgEl || reduced()) return;
  anim(() => gsap.timeline({ repeat: -1, delay: Math.random() })
    .set(imgEl, { attr: { src: closed } }, every)
    .set(imgEl, { attr: { src: open } }, every + 0.14));
}
