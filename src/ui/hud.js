// Barra in alto: logo e nome del gioco, tappe completate, vite, punti, navigazione, archivio degli eventi, audio e comandi.
import { state, commit, onChange } from "../engine/state.js";
import { t } from "../content/index.js";
import { LEVELS } from "../levels/index.js";
import { $, $$ } from "./dom.js";
import { countUp, loseHeart, popDot, wobble } from "../anim/fx.js";
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
let onReset = () => {};
/** Collega il pulsante «Ricomincia da zero» (main.js: azzera la partita, la mappa e torna all'inizio). */
export const setResetHandler = fn => { onReset = fn; };
// Conferma in due tempi: il primo clic chiede «Sicuro?», il secondo (entro 4 secondi) azzera.
let resetArmed = false;
let resetTimer = null;
// Valori mostrati l'ultima volta: servono per animare solo quello che cambia.
let shown = null;
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
      <nav class="mainnav" aria-label="${t("nav.aria")}">
        <button class="tool nav" id="navHome" data-nav="home">${icon("home")}<span class="lbl">${t("nav.home")}</span></button>
        <button class="tool nav" id="navMap" data-nav="map">${icon("map")}<span class="lbl">${t("nav.map")}</span></button>
        <button class="tool nav" id="archBtn" data-nav="events">${icon("doc")}<span class="lbl">${t("hud.archive")}</span></button>
      </nav>
      <button class="tool" id="mute" aria-pressed="${!state.muted}" title="${state.muted ? t("hud.audioOff") : t("hud.audioOn")}">${icon(state.muted ? "mute" : "sound")}<span class="lbl">${state.muted ? t("hud.audioOff") : t("hud.audioOn")}</span></button>
      <button class="tool" id="helpBtn" title="${t("hud.help")}">${icon("help")}<span class="lbl">${t("hud.help")}</span></button>
      <button class="tool reset ${resetArmed ? "armed" : ""}" id="resetBtn" title="${resetArmed ? t("hud.resetConfirm") : t("hud.reset")}" aria-label="${resetArmed ? t("hud.resetConfirm") : t("hud.resetAria")}">${icon("reset")}<span class="lbl">${resetArmed ? t("hud.resetConfirm") : t("hud.reset")}</span></button>
    </div>`;
  $("#resetBtn").onclick = () => {
    clearTimeout(resetTimer);
    if (resetArmed) { resetArmed = false; onReset(); renderHud(); return; }
    resetArmed = true;
    renderHud();
    wobble($("#resetBtn"));
    $("#resetBtn").focus();
    resetTimer = setTimeout(() => { resetArmed = false; renderHud(); }, 4000);
  };
  animateChanges();
  $("#mute").onclick = toggleMute;
  $("#helpBtn").onclick = () => onHelp();
  $("#archBtn").onclick = () => onArchive();
  // Inizio e Mappa: se sei già lì sotto l'archivio, basta chiudere l'archivio.
  const goTo = view => () => (state.view === view ? onArchive(false) : go(view));
  $("#brandHome").onclick = goTo("title");
  $("#navHome").onclick = goTo("title");
  $("#navMap").onclick = goTo("map");
  markNav();
}

/**
 * «Sei qui»: accende la voce della barra in alto che corrisponde a ciò che vedi.
 * Archivio aperto → Eventi; altrimenti Inizio o Mappa. Durante una tappa nessuna voce è accesa:
 * la tappa si legge nella barra della filiera.
 */
export function markNav() {
  const here = document.getElementById("archive") ? "events" : state.view === "title" ? "home" : state.view === "map" ? "map" : null;
  $$("#hud .mainnav [data-nav]").forEach(b => {
    if (b.dataset.nav === here) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
}

/** Punti che contano fino al nuovo valore, cuore perso che cade, pallino della tappa appena fatta che scoppia. */
function animateChanges() {
  const now = { score: state.score, lives: state.lives, done: { ...state.done } };
  const prev = shown;
  shown = now;
  if (!prev) return;
  const score = $("#hud .score");
  if (score && now.score > prev.score) countUp(score, prev.score, now.score, n => `${n} ${t("hud.events").toLowerCase()}`);
  if (now.lives < prev.lives) loseHeart($$("#hud .hearts span")[now.lives]);
  const dots = $$("#hud .steps i");
  LEVELS.forEach((l, i) => { if (now.done[l.id] && !prev.done[l.id]) popDot(dots[i]); });
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
