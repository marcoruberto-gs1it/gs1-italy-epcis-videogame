// Piccole animazioni arcade, tutte con GSAP e legate alla schermata corrente.
import { gsap, reduced } from "./gsap-setup.js";
import { anim } from "../engine/router.js";
import { skippable } from "./skip.js";

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

/** Scrive le righe del JSON una alla volta (al massimo in 2,5 secondi). Con reduced-motion le mostra subito. */
export function typeLines(pre, lines, onTick, onDone) {
  if (reduced()) { pre.innerHTML = lines.join("\n"); if (onDone) onDone(); return; }
  const p = { i: 0 };
  let shown = 0;
  pre.innerHTML = "";
  anim(() => skippable(gsap.to(p, {
    i: lines.length, duration: Math.min(2.5, lines.length * 0.045), ease: "none", onComplete: onDone,
    onUpdate() {
      const n = Math.ceil(p.i);
      if (n === shown) return;
      shown = n;
      pre.innerHTML = lines.slice(0, n).join("\n");
      if (n % 3 === 0 && onTick) onTick();
    }
  })));
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

/** Testo "+N" che sale e sparisce sopra un elemento. */
export function floatScore(el, text) {
  if (!el || reduced()) return;
  const r = el.getBoundingClientRect();
  const f = document.createElement("span");
  f.className = "float-score"; f.textContent = text;
  f.style.left = r.left + "px"; f.style.top = r.top + "px";
  document.body.appendChild(f);
  anim(() => skippable(gsap.fromTo(f, { y: 0, autoAlpha: 1 }, { y: -70, autoAlpha: 0, duration: 1.2, ease: "power1.out", onComplete: () => f.remove() })));
}

/** Entrata "a scatti" di un elemento: cade dall'alto. */
export function dropIn(el, delay = 0) {
  if (!el || reduced()) return;
  anim(() => gsap.from(el, { y: -40, autoAlpha: 0, duration: 0.3, delay, ease: "steps(4)" }));
}

/** Entrata di più elementi uno dopo l'altro. */
export function staggerIn(els, from = { x: -20 }) {
  if (!els || !els.length || reduced()) return;
  anim(() => skippable(gsap.from(els, { ...from, autoAlpha: 0, duration: 0.25, stagger: 0.08, ease: "steps(3)" })));
}

/** Comparsa con rimbalzo (vasetto appena nato, superpotere). */
export function popIn(el, delay = 0) {
  if (!el || reduced()) return;
  anim(() => skippable(gsap.from(el, { scale: 0.4, autoAlpha: 0, duration: 0.45, delay, ease: "back.out(2)" })));
}

/**
 * Sequenza d'ingresso di una schermata "titolo" (intro dei livelli, finale): lettere del titolo,
 * eroe che rimbalza, narratore, testo scritto a macchina, pulsante. Massimo circa 4 secondi, saltabile con Invio.
 */
export function introSequence(root, { heroBounce = true } = {}) {
  if (!root || reduced()) return;
  const h1 = root.querySelector("h1");
  if (h1) h1.innerHTML = [...h1.textContent].map(c => `<span class="ch">${c}</span>`).join("");
  const speech = root.querySelector(".speech .txt");
  const full = speech ? speech.textContent : "";
  const typed = { n: 0 };
  anim(() => {
    const tl = gsap.timeline();
    tl.from(root.querySelector(".tag"), { autoAlpha: 0, y: -10, duration: 0.2, ease: "steps(2)" })
      .from(root.querySelector("#hero"), heroBounce ? { y: -80, autoAlpha: 0, duration: 0.6, ease: "bounce.out" } : { autoAlpha: 0, duration: 0.3 }, "<")
      .from(h1 ? h1.querySelectorAll(".ch") : [], { y: -24, autoAlpha: 0, duration: 0.15, stagger: 0.025, ease: "steps(3)" }, "-=0.2");
    const narrator = root.querySelector(".narrator");
    if (narrator) {
      tl.from(narrator, { x: -40, autoAlpha: 0, duration: 0.3, ease: "steps(4)" });
      if (speech) {
        tl.to(typed, {
          n: full.length, duration: Math.min(2, full.length * 0.012), ease: "none",
          onStart: () => { speech.textContent = ""; },
          onUpdate: () => { speech.textContent = full.slice(0, Math.ceil(typed.n)); },
          onComplete: () => { speech.textContent = full; }
        });
      }
    }
    tl.from(root.querySelectorAll(".hi, #go, [data-pop]"), { scale: 0.5, autoAlpha: 0, duration: 0.25, stagger: 0.1, ease: "back.out(2)" });
    return skippable(tl);
  });
}

/** Occhi che sbattono ogni tanto: per un attimo mostra lo sprite con gli occhi chiusi. */
export function eyes(imgEl, open, closed, every = 2.6) {
  if (!imgEl || reduced()) return;
  anim(() => gsap.timeline({ repeat: -1, delay: Math.random() })
    .set(imgEl, { attr: { src: closed } }, every)
    .set(imgEl, { attr: { src: open } }, every + 0.14));
}
