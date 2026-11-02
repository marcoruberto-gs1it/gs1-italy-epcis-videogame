// Note per chi presenta (tasto P, solo in modalità sala) e schermata dei comandi (tasto ?).
import { state } from "../engine/state.js";
import { onRoute } from "../engine/router.js";
import { ui, onModes, isSala } from "../engine/modes.js";
import { t } from "../content/index.js";
import { byId } from "../levels/index.js";
import { $ } from "./dom.js";

function notesFor() {
  const level = ["intro", "level", "win"].includes(state.view) && state.level ? byId(state.level) : null;
  if (level) return { title: level.meta.t, ...level.C.notes };
  const key = state.view === "final" ? "final" : state.view === "title" ? "title" : "map";
  return { title: "", ...t("notes.general." + key) };
}

export function renderNotes() {
  const el = $("#notes");
  if (!el) return;
  const open = ui.notes && isSala();
  el.hidden = !open;
  document.body.classList.toggle("notes-open", open);
  if (!open) return;
  const n = notesFor();
  el.innerHTML = `<h3>${t("notes.title")}${n.title ? " · " + n.title.toUpperCase() : ""}</h3>
    <dl>
      <dt>${t("notes.ask")}</dt><dd>${n.ask}</dd>
      <dt>${t("notes.answer")}</dt><dd>${n.answer}</dd>
      <dt>${t("notes.story")}</dt><dd>${n.story}</dd>
      <dt>${t("notes.link")}</dt><dd>${n.link}</dd>
    </dl>
    <p class="close">${t("notes.close")}</p>`;
}

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
  el.innerHTML = `<div class="box"><h2>${t("help.title")}</h2>
    <table><tbody>${t("help.rows").map(([k, d]) => `<tr><th scope="row"><kbd>${k}</kbd></th><td>${d}</td></tr>`).join("")}</tbody></table>
    <p class="close">${t("help.close")}</p></div>`;
}

export function initNotes() {
  onRoute(renderNotes);
  onModes(renderNotes);
}
