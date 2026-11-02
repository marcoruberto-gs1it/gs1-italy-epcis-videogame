// Configurazione unica di GSAP: default, rispetto di prefers-reduced-motion.
import { gsap } from "gsap";

gsap.defaults({ duration: 0.4, ease: "power2.out" });
// Niente "lag smoothing": dopo un fotogramma pesante le animazioni non rallentano, così nessuna dura più del previsto.
gsap.ticker.lagSmoothing(0);

const query = window.matchMedia("(prefers-reduced-motion: reduce)");

/** true se chi gioca ha chiesto meno movimento: niente scossoni, niente spostamenti, solo cambi immediati. */
export const reduced = () => query.matches;

export { gsap };
