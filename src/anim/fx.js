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
  f.className = "float-score"; f.dataset.t = text; f.setAttribute("aria-hidden", "true");
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

// ---------- Animazioni di festa e di reazione (solo decorative: il testo non dipende mai da loro) ----------

const PARTY = ["var(--gs1-forest)", "var(--gs1-orange)", "var(--gs1-blue)", "var(--gs1-blue-200)", "var(--gs1-forest-300)", "var(--gs1-white)"];

/** Coriandoli con un po' di gravità: salgono a ventaglio, girano e ricadono. (x, y) in coordinate dello schermo. */
export function confetti(x, y, n = 26, { spread = 220, rise = 160, colors = PARTY } = {}) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.className = "fx-confetti";
    p.style.left = x + "px"; p.style.top = y + "px"; p.style.background = colors[i % colors.length];
    if (i % 3 === 0) p.style.borderRadius = "50%";
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * spread, up = rise * (0.5 + Math.random() * 0.7);
    gsap.timeline({ onComplete: () => p.remove() })
      .to(p, { x: dx * 0.6, y: -up, rotation: Math.random() * 360, duration: 0.45 + Math.random() * 0.2, ease: "power2.out" })
      .to(p, { x: dx, y: up * 0.9 + 120, rotation: "+=" + (180 + Math.random() * 360), autoAlpha: 0, duration: 0.9 + Math.random() * 0.5, ease: "power1.in" });
  }
}

/** Coriandoli che partono dal centro di un elemento. */
export function confettiFrom(el, n, opts) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height / 2, n, opts);
}

/** Pioggia di coriandoli dall'alto, su tutta la larghezza (evento registrato, finale). */
export function rain(n = 40, duration = 2.2) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.className = "fx-confetti";
    p.style.left = Math.random() * innerWidth + "px"; p.style.top = "-16px"; p.style.background = PARTY[i % PARTY.length];
    document.body.appendChild(p);
    gsap.to(p, {
      y: innerHeight + 40, x: (Math.random() - 0.5) * 160, rotation: 360 + Math.random() * 720,
      duration: duration * (0.6 + Math.random() * 0.6), delay: Math.random() * 0.8, ease: "power1.in", onComplete: () => p.remove()
    });
  }
}

/** Risposta giusta: l'opzione fa un piccolo salto, il numero gira su sé stesso, partono i coriandoli. */
export function celebrate(btn) {
  if (!btn || reduced()) return;
  const k = btn.querySelector(".k");
  anim(() => gsap.timeline()
    .fromTo(btn, { scale: 1 }, { scale: 1.035, duration: 0.14, ease: "power2.out" })
    .to(btn, { scale: 1, duration: 0.5, ease: "elastic.out(1.1, 0.4)" })
    .fromTo(k, { rotation: 0 }, { rotation: 360, duration: 0.6, ease: "back.out(1.6)" }, 0));
  confettiFrom(btn.querySelector(".k") || btn, 22, { spread: 260, rise: 140 });
}

/** Risposta sbagliata: l'opzione dondola come per dire «no». */
export function wobble(el) {
  if (!el || reduced()) return;
  anim(() => gsap.fromTo(el, { rotation: 0 }, { keyframes: [{ rotation: -1.6 }, { rotation: 1.4 }, { rotation: -0.8 }, { rotation: 0 }], duration: 0.45, ease: "power1.inOut", clearProps: "transform" }));
}

/** Elementi che entrano uno dopo l'altro con un movimento morbido. Restano visibili da subito. */
export function cascade(els, from = { y: 14 }, stagger = 0.06) {
  if (!els || !els.length || reduced()) return;
  anim(() => gsap.from(els, { ...from, duration: 0.5, stagger, ease: "back.out(1.7)", clearProps: "transform" }));
}

/** Timbro «registrato» che cade sul diario con un tonfo. */
export function stamp(el, thud) {
  if (!el || reduced()) return;
  anim(() => gsap.timeline()
    .fromTo(el, { scale: 2, rotation: -24 }, { scale: 1, rotation: -8, duration: 0.34, delay: 0.1, ease: "power4.in" })
    .to(thud, { keyframes: [{ y: 5 }, { y: -2 }, { y: 0 }], duration: 0.25, ease: "power1.out", clearProps: "transform" })
    .to(el, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<"));
}

/** Numero che conta da un valore all'altro (punti nella barra in alto e nel finale). */
export function countUp(el, from, to, format = n => String(n), duration = 0.9) {
  if (!el) return;
  if (reduced() || from === to) { el.textContent = format(to); return; }
  const o = { n: from };
  gsap.to(o, { n: to, duration, ease: "power2.out", onUpdate: () => { el.textContent = format(Math.round(o.n)); } });
}

/** Cuore perso: si gonfia, gira e cade. */
export function loseHeart(el) {
  if (!el || reduced()) return;
  gsap.fromTo(el, { scale: 1.8, rotation: 0, y: 0 }, { keyframes: [{ scale: 1.8, rotation: -20, duration: 0.15 }, { scale: 1, rotation: 15, y: 6, duration: 0.35 }, { rotation: 0, y: 0, duration: 0.3 }], ease: "power2.out", clearProps: "transform" });
}

/** Pallino della tappa appena completata: un piccolo scoppio. */
export function popDot(el) {
  if (!el || reduced()) return;
  gsap.fromTo(el, { scale: 2.4 }, { scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.35)", clearProps: "transform" });
  confettiFrom(el, 10, { spread: 90, rise: 50 });
}

/** Battito continuo e morbido (numero della tappa da giocare sulla mappa). */
export function heartbeat(el) {
  if (!el || reduced()) return;
  anim(() => gsap.timeline({ repeat: -1, repeatDelay: 0.9 })
    .to(el, { scale: 1.22, duration: 0.16, ease: "power2.out" })
    .to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" }));
}
