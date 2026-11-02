// Mappa dei mondi con i nodi dei livelli.
import { register, go, anim } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { sprite } from "../render/two/sprites.js";
import { bob, staggerIn } from "../anim/fx.js";
import { gsap, reduced } from "../anim/gsap-setup.js";
import { skippable } from "../anim/skip.js";
import { LEVELS } from "../levels/index.js";
import { $, $$, show } from "../ui/dom.js";
import { mountScene } from "../render/scene-host.js";
import { mapScene } from "../render/three/scenes.js";

// Ultima tappa "sei qui" mostrata: serve per far camminare il vasetto fino alla tappa nuova.
let lastHere = null;

register("map", () => {
  const next = LEVELS.find(l => !state.done[l.id]);
  const node = l => `<button class="node ${state.done[l.id] ? "done" : ""} ${l.id === "finale" ? "finale" : ""}" data-lv="${l.id}">
      <span class="code">${l.id === "finale" ? t("map.finaleNode") : t("map.level", { id: l.id })}</span>
      <span class="nm">${l.meta.t}</span><span class="cc">${l.meta.c}</span>
      <img class="px icon" src="${sprite(l.meta.sp)}" alt="">
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
    <div class="diorama" id="diorama" aria-hidden="true"></div>
    ${world("food")}${world("textile")}${world("finale")}
    <div class="row"><button class="btn" data-primary id="goNext">${goLabel}</button>
    <button class="btn alt" id="codex">${t("map.codex")}</button>
    <button class="btn alt" id="reset">${t("map.reset")}</button></div>
  </div>`);
  const here = $(".node .here");
  staggerIn($$(".node"), { y: 16 });
  const from = lastHere && next && lastHere !== next.id ? $(`.node[data-lv="${lastHere}"]`) : null;
  if (here && from && !reduced()) {
    // Il vasetto salta dalla tappa appena completata a quella nuova.
    const a = from.getBoundingClientRect(), b = here.closest(".node").getBoundingClientRect();
    anim(() => skippable(gsap.from(here, { x: a.left - b.left, y: a.top - b.top, duration: 0.9, delay: 0.4, ease: "steps(9)", onComplete: () => bob(here) })));
  } else bob(here);
  // Diorama 3D: un'isola per tappa, nell'ordine di gioco (food su una riga, tessile e sfida finale sotto).
  const cols = { food: 0, textile: 0 };
  const nodes = LEVELS.map(l => {
    const row = l.world === "food" ? 0 : 1;
    const col = l.world === "finale" ? cols.textile : cols[l.world]++;
    return { id: l.id, sp: l.meta.sp, done: !!state.done[l.id], row, col: l.world === "food" ? col : col + 1 };
  });
  mountScene($("#diorama"), mapScene({ nodes, here: next && next.id, from: lastHere }, { clickHtml: sel => { const b = $(sel); if (b) b.click(); } }));
  lastHere = next ? next.id : null;
  $$(".node").forEach(b => b.onclick = () => { sfx.sel(); go("intro", b.dataset.lv); });
  $("#goNext").onclick = () => (next ? go("intro", next.id) : go("final"));
  $("#codex").onclick = () => go("codex");
  $("#reset").onclick = () => { resetState({ muted: state.muted }); go("title"); };
});
