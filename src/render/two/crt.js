// Effetto CRT dello schermo (scanline, vignettatura, leggero sfarfallio). Tasto C. Spento con prefers-reduced-motion.
import { state, commit } from "../../engine/state.js";
import { reduced } from "../../anim/gsap-setup.js";

export function applyCrt() {
  const bezel = document.getElementById("bezel");
  if (bezel) bezel.classList.toggle("crt", state.crt && !reduced());
}

export function toggleCrt() {
  state.crt = !state.crt;
  commit();
  applyCrt();
}
