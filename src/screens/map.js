// Mappa dei mondi con i nodi dei livelli.
import { register, go } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { sprite } from "../render/two/sprites.js";
import { bob } from "../anim/fx.js";
import { LEVELS } from "../levels/index.js";
import { $, $$, show } from "../ui/dom.js";

register("map", () => {
  const next = LEVELS.find(l => !state.done[l.id]);
  const node = l => `<button class="node ${state.done[l.id] ? "done" : ""} ${l.id === "finale" ? "finale" : ""}" data-lv="${l.id}">
      <span class="code">${l.id === "finale" ? t("map.finaleNode") : t("map.level", { id: l.id })}</span>
      <span class="nm">${l.meta.t}</span><span class="cc">${l.meta.c}</span>
      ${next && l.id === next.id ? `<img class="px here" src="${sprite("jar")}" alt="${t("map.here")}">` : ""}
    </button>`;
  const world = key => {
    const levels = LEVELS.filter(l => l.world === key);
    if (!levels.length) return "";
    return `<section class="world ${key === "finale" ? "finale" : ""}"><div class="world-head"><h3>${t(`map.${key}.heading`)}</h3><p>${t(`map.${key}.text`)}</p></div>
      <div class="nodes">${levels.map(node).join("")}</div></section>`;
  };
  const goLabel = !next ? t("map.seeEnd") : next.id === "finale" ? t("map.playFinale") : t("map.play", { id: next.id });
  show(`<div class="map">
    ${world("food")}${world("textile")}${world("finale")}
    <div class="row"><button class="btn" data-primary id="goNext">${goLabel}</button>
    <button class="btn alt" id="codex">${t("map.codex")}</button>
    <button class="btn alt" id="reset">${t("map.reset")}</button></div>
  </div>`);
  bob($(".node .here"));
  $$(".node").forEach(b => b.onclick = () => { sfx.sel(); go("intro", b.dataset.lv); });
  $("#goNext").onclick = () => (next ? go("intro", next.id) : go("final"));
  $("#codex").onclick = () => go("codex");
  $("#reset").onclick = () => { resetState({ muted: state.muted }); go("title"); };
});
