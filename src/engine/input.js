// Comandi da tastiera per chi presenta: 1-9 scelta, Invio conferma, Esc mappa, M audio.
import { state } from "./state.js";
import { go } from "./router.js";
import { toggleMute } from "../ui/hud.js";
import { screenEl } from "../ui/dom.js";

export function initInput() {
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const screen = screenEl();
    const onButton = document.activeElement && document.activeElement.tagName === "BUTTON";
    if (e.key === "m" || e.key === "M") { toggleMute(); return; }
    if (e.key === "Escape") { if (state.view !== "title") go("map"); return; }
    if (/^[1-9]$/.test(e.key)) {
      const b = screen.querySelector(`[data-key="${e.key}"]:not(:disabled)`);
      if (b) { b.click(); e.preventDefault(); }
      return;
    }
    // Invio sul pulsante con il focus lo attiva normalmente; altrimenti attiva l'azione principale visibile.
    if ((e.key === "Enter" || e.key === " ") && !onButton) {
      const b = screen.querySelector(".overlay [data-primary]") || [...screen.querySelectorAll("[data-primary]")].pop();
      if (b) { b.click(); e.preventDefault(); }
    }
  });
}
