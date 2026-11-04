// Transizione tra schermate: la schermata nuova entra con un piccolo spostamento.
// Niente dissolvenza: il testo è visibile da subito, anche se l'animazione si interrompe.
import { gsap, reduced } from "./gsap-setup.js";

let tween = null;

export function reveal() {
  const screen = document.getElementById("screen");
  if (!screen) return;
  if (tween) tween.kill();
  gsap.set(screen, { clearProps: "opacity,visibility" });
  if (reduced()) return;
  tween = gsap.fromTo(screen, { y: 10 }, { y: 0, duration: 0.25, ease: "power2.out", clearProps: "transform" });
}
