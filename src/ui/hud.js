// Barra in alto: logo e nome del gioco, tappe completate, vite, punti, navigazione, archivio degli eventi, audio e comandi.
import { state, commit, onChange } from "../engine/state.js";
import { t } from "../content/index.js";
import { LEVELS } from "../levels/index.js";
import { $ } from "./dom.js";
import { render, onRender } from "../render/scene-host.js";
import { go } from "../engine/router.js";
import { icon } from "./icons.js";

// Il logo si aggiunge in assets/gs1-italy-logo.png: se manca, compare un segnaposto.
const logoFiles = import.meta.glob("/assets/gs1-italy-logo.png", { eager: true, query: "?url", import: "default" });
const LOGO = Object.values(logoFiles)[0] || null;

export const logoHtml = () => LOGO
  ? `<img class="logo" src="${LOGO}" alt="GS1 Italy">`
  : `<span class="logo-ph" role="img" aria-label="GS1 Italy">${t("hud.logoPlaceholder")}</span>`;

let onHelp = () => {};
let onArchive = () => {};
/** Collega il pulsante «Eventi» all'archivio degli eventi (ui/archive.js). */
export const setArchiveHandler = fn => { onArchive = fn; };
/** Collega il pulsante «Comandi» alla schermata dei comandi (evita un import circolare con notes.js). */
export const setHelpHandler = fn => { onHelp = fn; };

export function renderHud() {
  // Avanzamento diviso per filiera: food, tessile, sfida finale.
  const steps = ["food", "textile", "finale"].map(w => LEVELS.filter(l => l.world === w)).filter(g => g.length)
    .map(g => `<span class="grp"><span class="lbl" aria-hidden="true">${t(`hud.world.${g[0].world}`)}</span>${g.map(l => `<i class="${state.done[l.id] ? "on" : ""}"></i>`).join("")}</span>`).join("");
  const hearts = [0, 1, 2].map(i => `<span class="${i < state.lives ? "" : "lost"}">♥</span>`).join("");
  $("#hud").innerHTML = `
    <button class="brandbox" id="brandHome" aria-label="${t("hud.homeAria")}">${logoHtml()}<span aria-hidden="true">${t("title.heading")}</span></button>
    <div class="status">
      <span class="steps" role="img" aria-label="${t("hud.powersAria", { n: Object.keys(state.done).length, total: LEVELS.length })}">${steps}</span>
      <span class="hearts" role="img" aria-label="${t("hud.livesAria", { n: state.lives })}">${hearts}</span>
      <span class="score">${state.score} ${t("hud.events").toLowerCase()}</span>
    </div>
    <div class="tools">
      ${state.view && state.view !== "title" ? `<nav class="mainnav" aria-label="${t("nav.aria")}"><button class="tool nav" id="navHome">${icon("home")}<span class="lbl">${t("nav.home")}</span></button>${state.view !== "map" ? `<button class="tool nav" id="navMap">${icon("map")}<span class="lbl">${t("nav.map")}</span></button>` : ""}</nav>` : ""}
      <button class="tool" id="archBtn">${icon("doc")}<span class="lbl">${t("hud.archive")}</span></button>
      <button class="tool" id="mute" aria-pressed="${!state.muted}">${icon(state.muted ? "mute" : "sound")}<span class="lbl">${state.muted ? t("hud.audioOff") : t("hud.audioOn")}</span></button>
      <button class="tool" id="helpBtn">${icon("help")}<span class="lbl">${t("hud.help")}</span></button>
    </div>`;
  $("#mute").onclick = toggleMute;
  $("#helpBtn").onclick = () => onHelp();
  $("#archBtn").onclick = () => onArchive();
  $("#brandHome").onclick = () => { if (state.view !== "title") go("title"); };
  const home = $("#navHome"), map = $("#navMap");
  if (home) home.onclick = () => go("title");
  if (map) map.onclick = () => go("map");
}

export function toggleMute() { state.muted = !state.muted; commit(); }

/** Nome del renderer attivo, mostrato nei comandi e nelle note per chi presenta. */
export const rendererLabel = () => (render.mode === "3d" ? t("help.mode3d", { q: render.quality }) : t("help.mode2d"));

function fallbackNotice(r) {
  if (r.mode !== "2d" || !r.reason || r.reason === "manual") return;
  const n = document.createElement("div");
  n.className = "toast"; n.setAttribute("role", "status");
  n.textContent = t("hud.fallback");
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}

export function initHud() {
  onRender(fallbackNotice);
  renderHud();
  onChange(renderHud);
}
