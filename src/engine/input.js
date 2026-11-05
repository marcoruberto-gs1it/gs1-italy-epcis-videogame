// Comandi da tastiera: 1-9 scelta, Invio conferma, Esc mappa, M audio, E archivio degli eventi.
import { state } from "./state.js";
import { go } from "./router.js";
import { toggleMute } from "../ui/hud.js";
import { screenEl } from "../ui/dom.js";
import { skipAll } from "../anim/skip.js";
import { toggleRenderer, togglePixel } from "../render/scene-host.js";
import { toggleHint } from "./modes.js";
import { toggleHelp, isHelpOpen } from "../ui/notes.js";
import { toggleArchive, isArchiveOpen } from "../ui/archive.js";
import { closeLens, isLensOpen } from "../ui/lens.js";

export function initInput() {
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const screen = screenEl();
    const onButton = document.activeElement && document.activeElement.tagName === "BUTTON";
    // Invio durante un'animazione la porta subito alla fine, senza attivare pulsanti.
    if (e.key === "Enter" && skipAll()) { e.preventDefault(); return; }
    // Lente sul Digital Link e archivio degli eventi stanno sopra il gioco: finché sono aperti, il gioco non riceve tasti.
    if (isLensOpen()) { if (e.key === "Escape") { closeLens(); e.preventDefault(); } return; }
    if (isArchiveOpen()) { if (e.key === "Escape" || e.key === "e" || e.key === "E") { toggleArchive(false); e.preventDefault(); } return; }
    if ((e.key === "e" || e.key === "E") && !isHelpOpen()) { toggleArchive(true); e.preventDefault(); return; }
    if (e.key === "?") { toggleHelp(); e.preventDefault(); return; }
    if (isHelpOpen()) { if (e.key === "Escape" || e.key === "Enter") { toggleHelp(false); e.preventDefault(); } return; }
    if (e.key === "m" || e.key === "M") { toggleMute(); return; }
    if (e.key === "h" || e.key === "H") { toggleHint(); return; }
    if (e.key === "r" || e.key === "R") { toggleRenderer(); return; }
    if (e.key === "x" || e.key === "X") { togglePixel(); return; }
    if (e.key === "Escape") { if (state.view !== "title") go("map"); return; }
    if (e.key === "g" || e.key === "G") {
      // Il glossario del gioco si apre dalle schermate di riposo, mai a metà tappa.
      if (state.view === "codex") go("map");
      else if (["title", "map", "win", "final"].includes(state.view)) go("codex");
      return;
    }
    if ((e.key === "d" || e.key === "D") && state.view === "win") { screen.querySelector("#doc")?.click(); return; }
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
