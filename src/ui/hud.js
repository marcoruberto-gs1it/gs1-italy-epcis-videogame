// HUD in alto (punteggio, vite, poteri, audio) e barra in basso con il logo.
import { state, commit, onChange } from "../engine/state.js";
import { t } from "../content/index.js";
import { sprite, img } from "../render/two/sprites.js";
import { LEVELS } from "../levels/index.js";
import { $ } from "./dom.js";
import { render, onRender } from "../render/scene-host.js";

// Il logo si aggiunge in assets/gs1-italy-logo.png: se manca, compare un segnaposto.
const logoFiles = import.meta.glob("/assets/gs1-italy-logo.png", { eager: true, query: "?url", import: "default" });
const LOGO = Object.values(logoFiles)[0] || null;

export const logoHtml = () => LOGO
  ? `<img class="logo" src="${LOGO}" alt="GS1 Italy">`
  : `<span class="logo-ph" role="img" aria-label="GS1 Italy">${t("foot.logoPlaceholder")}</span>`;

export function renderHud() {
  const hearts = [0, 1, 2].map(i => `<img class="px ${i < state.lives ? "" : "lost"}" src="${sprite("heart")}" alt="">`).join("");
  const pw = LEVELS.map(l => `<span class="${state.powers.includes(l.id) ? "on" : ""}" title="${l.power[0]}"></span>`).join("");
  $("#hud").innerHTML = `
    <span><span class="lbl">${t("hud.events")}</span><span class="val">${String(state.score).padStart(5, "0")}</span></span>
    <span class="lotto">${t("hud.lot")}</span>
    <span><span class="lbl">${t("hud.lives")}</span><span class="hearts" aria-label="${t("hud.livesAria", { n: state.lives })}">${hearts}</span></span>
    <span><span class="lbl">${t("hud.powers")}</span><span class="pw">${pw}</span></span>
    <button class="mute" id="mute" aria-label="${t("hud.audioAria")}">${state.muted ? t("hud.audioOff") : t("hud.audioOn")}</button>`;
  $("#mute").onclick = toggleMute;
}

export function toggleMute() { state.muted = !state.muted; commit(); }

export function renderFoot() {
  $("#foot").innerHTML = `<span>${t("foot.keys")}</span><span class="rmode" id="rmode"></span><span class="brand">${t("foot.brand")} ${logoHtml()}</span>`;
  renderMode();
}

export function renderMarquee() {
  $("#marquee").innerHTML = `${img("jar", 30)}<span class="mq-title">${t("title.heading")}</span><span class="mq-sub">${t("marquee.sub")}</span>${img("bip", 30)}`;
}

/** Indicatore del renderer attivo (tasto R) e avviso quando il 3D passa da solo al 2D. */
export function renderMode() {
  const el = $("#rmode");
  if (el) el.textContent = render.mode === "3d" ? t("foot.mode3d", { q: render.quality.toUpperCase() }) : t("foot.mode2d");
}

function fallbackNotice(r) {
  if (r.mode !== "2d" || !r.reason || r.reason === "manual") return;
  const n = document.createElement("div");
  n.className = "toast"; n.setAttribute("role", "status");
  n.textContent = t("foot.fallback");
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}

export function initHud() {
  onRender(r => { renderMode(); fallbackNotice(r); });
  renderMarquee();
  renderFoot();
  renderHud();
  onChange(renderHud);
}
