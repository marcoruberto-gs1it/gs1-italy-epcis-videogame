// Schermata del titolo.
import { register, go } from "../engine/router.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { img, sprite } from "../render/two/sprites.js";
import { bob, blink, eyes, introSequence } from "../anim/fx.js";
import { logoHtml } from "../ui/hud.js";
import { $, show } from "../ui/dom.js";
import { state } from "../engine/state.js";
import { setMode, toggleTeams, onModes } from "../engine/modes.js";

/** Pulsanti della modalità: 1 sala, 2 individuale, 3 squadre sì/no (solo in sala). */
function modesHtml() {
  const sala = state.mode === "sala";
  return `<span class="tag">${t("modes.title")}</span>
    <div class="modes">
      <button class="mode ${sala ? "on" : ""}" data-key="1" id="mSala" aria-pressed="${sala}"><b>1 · ${t("modes.sala")}</b><span>${t("modes.salaText")}</span></button>
      <button class="mode ${sala ? "" : "on"}" data-key="2" id="mSolo" aria-pressed="${!sala}"><b>2 · ${t("modes.solo")}</b><span>${t("modes.soloText")}</span></button>
    </div>
    ${sala ? `<button class="btn alt small" data-key="3" id="mTeams" aria-pressed="${state.teams.on}">3 · ${state.teams.on ? t("modes.teamsOn") : t("modes.teamsOff")}</button>` : ""}`;
}

function wireModes() {
  const box = $("#modes");
  if (!box) return;
  box.innerHTML = modesHtml();
  $("#mSala").onclick = () => setMode("sala");
  $("#mSolo").onclick = () => setMode("individuale");
  const tm = $("#mTeams");
  if (tm) tm.onclick = toggleTeams;
}
onModes(() => { if (state.view === "title") wireModes(); });

register("title", () => {
  show(`<div class="title home"><div class="inner">
    ${logoHtml()}
    <span class="tag">${t("title.presents")}</span>
    <div id="hero">${img("jar", 80, "", t("title.jarAlt"))}</div>
    <h1>${t("title.heading")}</h1>
    <p class="sub">${t("title.sub")}</p>
    <div class="modes-box" id="modes"></div>
    <button class="btn" data-primary data-pop id="start"><span id="press">${t("title.start")}</span></button>
    <span class="hi">${t("title.record")}</span>
    <span class="credit">${t("title.credit")}</span>
  </div></div>`);
  bob($("#hero img"));
  eyes($("#hero img"), sprite("jar"), sprite("jarBlink"));
  blink($("#press"));
  wireModes();
  introSequence($(".title .inner"));
  $("#start").onclick = () => { sfx.coin(); go("map"); };
});
