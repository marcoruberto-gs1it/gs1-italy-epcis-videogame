// Configurazione unica di GSAP: default, rispetto di prefers-reduced-motion.
import { gsap } from "gsap";

gsap.defaults({ duration: 0.4, ease: "power2.out" });

const query = window.matchMedia("(prefers-reduced-motion: reduce)");

/** true se chi gioca ha chiesto meno movimento: niente scossoni, niente spostamenti, solo cambi immediati. */
export const reduced = () => query.matches;

export { gsap };
