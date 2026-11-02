// Mappa della filiera: il paesaggio illustrato (3D) e l'elenco delle tappe, che funziona anche in 2D.
import { register, go } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { sprite } from "../render/two/sprites.js";
import { staggerIn } from "../anim/fx.js";
import { LEVELS, mapNodes } from "../levels/index.js";
import { $, $$, show } from "../ui/dom.js";
import { mountScene } from "../render/scene-host.js";
import { mapScene } from "../render/three/scenes.js";

// Ultima tappa "sei qui" mostrata: serve per far saltare il vasetto fino alla tappa nuova.
let lastHere = null;

register("map", () => {
  const next = LEVELS.find(l => !state.done[l.id]);
  const stop = l => `<button class="stop ${state.done[l.id] ? "done" : ""} ${next && l.id === next.id ? "next" : ""}" data-lv="${l.id}">
      <img class="px" src="${sprite(l.meta.sp)}" alt=""><span class="n">${l.id === "finale" ? t("map.finaleNode") : t("map.level", { id: l.id })}</span><span>${l.meta.t}</span>
    </button>`;
  const world = key => {
    const levels = LEVELS.filter(l => l.world === key);
    if (!levels.length) return "";
    return `<section><h3>${t(`map.${key}.heading`)}</h3><div class="stop-list">${levels.map(stop).join("")}</div></section>`;
  };
  const goLabel = !next ? t("map.seeEnd") : next.id === "finale" ? t("map.playFinale") : t("map.play", { id: next.id });
  show(`<div class="map">
    <div class="row between"><h2>${t("map.title")}</h2>
      <div class="row"><button class="btn" data-primary id="goNext">${goLabel}</button>
      <button class="btn alt small" id="codex">${t("map.codex")}</button>
      <button class="btn alt small" id="reset">${t("map.reset")}</button></div></div>
    <div class="scene-box diorama" id="diorama" aria-hidden="true"></div>
    <div class="stops">${world("food")}${world("textile")}${world("finale")}</div>
  </div>`);
  staggerIn($$(".stop"), { y: 10 });
  mountScene($("#diorama"), mapScene({ nodes: mapNodes(state.done), here: next && next.id, from: lastHere }, { clickHtml: sel => { const b = $(sel); if (b) b.click(); } }));
  lastHere = next ? next.id : null;
  $$(".stop").forEach(b => b.onclick = () => { sfx.sel(); go("intro", b.dataset.lv); });
  $("#goNext").onclick = () => (next ? go("intro", next.id) : go("final"));
  $("#codex").onclick = () => go("codex");
  $("#reset").onclick = () => { resetState(); go("title"); };
});
