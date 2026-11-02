// HUD in alto (punteggio, vite, poteri, audio) e barra in basso con il logo.
import { state, commit, onChange } from "../engine/state.js";
import { t } from "../content/index.js";
import { sprite } from "../render/two/sprites.js";
import { LEVELS } from "../levels/index.js";
import { $ } from "./dom.js";

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
  $("#foot").innerHTML = `<span>${t("foot.keys")}</span><span class="brand">${t("foot.brand")} ${logoHtml()}</span>`;
}

export function initHud() {
  renderFoot();
  renderHud();
  onChange(renderHud);
}
