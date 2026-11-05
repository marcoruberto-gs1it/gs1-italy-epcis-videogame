// Barra in alto: logo e nome del gioco, tappe completate, vite, punti, squadre, audio e comandi.
import { state, commit, onChange } from "../engine/state.js";
import { t } from "../content/index.js";
import { LEVELS } from "../levels/index.js";
import { $ } from "./dom.js";
import { render, onRender } from "../render/scene-host.js";
import { teamsOn, onModes } from "../engine/modes.js";
import { go } from "../engine/router.js";

// Il logo si aggiunge in assets/gs1-italy-logo.png: se manca, compare un segnaposto.
const logoFiles = import.meta.glob("/assets/gs1-italy-logo.png", { eager: true, query: "?url", import: "default" });
const LOGO = Object.values(logoFiles)[0] || null;

export const logoHtml = () => LOGO
  ? `<img class="logo" src="${LOGO}" alt="GS1 Italy">`
  : `<span class="logo-ph" role="img" aria-label="GS1 Italy">${t("hud.logoPlaceholder")}</span>`;

let onHelp = () => {};
/** Collega il pulsante «Comandi» alla schermata dei comandi (evita un import circolare con notes.js). */
export const setHelpHandler = fn => { onHelp = fn; };

export function renderHud() {
  // Avanzamento diviso per filiera: food, tessile, sfida finale.
  const steps = ["food", "textile", "finale"].map(w => LEVELS.filter(l => l.world === w)).filter(g => g.length)
    .map(g => `<span class="grp"><span class="lbl" aria-hidden="true">${t(`hud.world.${g[0].world}`)}</span>${g.map(l => `<i class="${state.done[l.id] ? "on" : ""}"></i>`).join("")}</span>`).join("");
  const hearts = [0, 1, 2].map(i => `<span class="${i < state.lives ? "" : "lost"}">♥</span>`).join("");
  $("#hud").innerHTML = `
    <div class="brandbox">${logoHtml()}<span>${t("title.heading")}</span></div>
    <div class="status">
      <span class="steps" role="img" aria-label="${t("hud.powersAria", { n: Object.keys(state.done).length, total: LEVELS.length })}">${steps}</span>
      <span class="hearts" role="img" aria-label="${t("hud.livesAria", { n: state.lives })}">${hearts}</span>
      <span class="score">${state.score} ${t("hud.events").toLowerCase()}</span>
      ${teamsHtml()}
    </div>
    <div class="tools">
      ${state.view && state.view !== "title" ? `<nav class="mainnav" aria-label="${t("nav.aria")}"><button class="tool nav" id="navHome">${t("nav.home")}</button>${state.view !== "map" ? `<button class="tool nav" id="navMap">${t("nav.map")}</button>` : ""}</nav>` : ""}
      <button class="tool" id="mute" aria-label="${t("hud.audioAria")}">${state.muted ? t("hud.audioOff") : t("hud.audioOn")}</button>
      <button class="tool" id="helpBtn">${t("hud.help")}</button>
    </div>`;
  $("#mute").onclick = toggleMute;
  $("#helpBtn").onclick = () => onHelp();
  const home = $("#navHome"), map = $("#navMap");
  if (home) home.onclick = () => go("title");
  if (map) map.onclick = () => go("map");
}

function teamsHtml() {
  if (!teamsOn()) return "";
  const tm = state.teams;
  const team = k => `<span class="team team-${k} ${tm.turn === k ? "turn" : ""}">${t("teams." + k)} ${tm[k]}<span class="sr-only"> · ${t("teams.name" + k)}: ${t("teams.points", { n: tm[k] })}</span></span>`;
  const turn = tm.turn ? t("teams.turn", { t: t("teams." + tm.turn) }) : t("teams.noTurn");
  return `<span class="teams" title="${turn}">${team("A")}${team("B")}</span><span class="sr-only" aria-live="polite">${turn}</span>`;
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

function modeClasses() {
  document.body.classList.toggle("mode-sala", state.mode === "sala");
  document.body.classList.toggle("mode-solo", state.mode !== "sala");
}

export function initHud() {
  modeClasses();
  onModes(() => { modeClasses(); renderHud(); });
  onChange(modeClasses);
  onRender(fallbackNotice);
  renderHud();
  onChange(renderHud);
}
