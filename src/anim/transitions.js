// Transizione tra schermate: la schermata nuova entra con una breve dissolvenza (saltabile con Invio).
import { gsap, reduced } from "./gsap-setup.js";
import { skippable } from "./skip.js";

let tween = null;

export function reveal() {
  const screen = document.getElementById("screen");
  if (!screen || reduced()) return;
  if (tween) tween.kill();
  tween = skippable(gsap.fromTo(screen, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "transform" }));
}
