// Schermata dei comandi (tasto ? o pulsante «Comandi»).
import { t } from "../content/index.js";
import { $ } from "./dom.js";
import { setHelpHandler, rendererLabel } from "./hud.js";

let helpOpen = false;
export const isHelpOpen = () => helpOpen;

export function toggleHelp(force) {
  helpOpen = force ?? !helpOpen;
  let el = $("#help");
  if (!helpOpen) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement("div");
    el.id = "help"; el.className = "help"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", t("help.title"));
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="box" tabindex="0"><h2>${t("help.title")}</h2>
    <table><tbody>${t("help.rows").map(([k, d]) => `<tr><th scope="row"><kbd>${k}</kbd></th><td>${d}</td></tr>`).join("")}</tbody></table>
    <p class="mode-line">${t("help.renderer", { m: rendererLabel() })}</p>
    <p class="close">${t("help.close")}</p></div>`;
}

export function initNotes() {
  setHelpHandler(() => toggleHelp());
}
