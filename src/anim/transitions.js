// Transizioni tra schermate: una tendina a stecche che si apre sulla schermata nuova.
import { gsap, reduced } from "./gsap-setup.js";
import { skippable } from "./skip.js";

const SLATS = 10;
let curtain = null;
let tween = null;

export function initCurtain(el) {
  curtain = el;
  curtain.innerHTML = Array.from({ length: SLATS }, () => `<span></span>`).join("");
  gsap.set(curtain.children, { scaleY: 0 });
}

/** Apre la tendina sulla schermata appena disegnata. Non blocca l'input: la tendina non riceve clic. */
export function reveal() {
  if (!curtain || reduced()) return;
  if (tween) tween.kill();
  tween = skippable(gsap.fromTo(curtain.children, { scaleY: 1 }, {
    scaleY: 0, transformOrigin: "50% 0%", duration: 0.28, ease: "steps(4)",
    stagger: { each: 0.025, from: "center" }
  }));
}
