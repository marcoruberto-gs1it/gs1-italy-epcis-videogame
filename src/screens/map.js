// Mappa: una scheda per filiera (food, tessile, sfida finale). Ogni scheda ha il suo paesaggio 3D
// con le tappe numerate e lo stesso percorso numerato in HTML, che funziona anche in 2D.
import { register, go } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { staggerIn } from "../anim/fx.js";
import { LEVELS, mapNodes } from "../levels/index.js";
import { $, $$, show } from "../ui/dom.js";
import { mountScene } from "../render/scene-host.js";
import { mapScene } from "../render/three/scenes.js";

const WORLD_KEYS = ["food", "textile", "finale"];
// Scheda aperta e ultima tappa "sei qui" mostrata (serve per far saltare il segnaposto fino alla tappa nuova).
let tab = null;
let lastHere = null;

register("map", () => {
  const next = LEVELS.find(l => !state.done[l.id]);
  const worlds = WORLD_KEYS.map(key => ({ key, levels: LEVELS.filter(l => l.world === key) })).filter(w => w.levels.length);
  if (!tab || !worlds.some(w => w.key === tab)) tab = next ? next.world : worlds[0].key;

  const label = l => (l.id === "finale" ? t("map.finaleNode") : t("map.level", { id: l.id }));
  const stop = (l, i) => `<li><button class="stop ${state.done[l.id] ? "done" : ""} ${next && l.id === next.id ? "next" : ""}" data-lv="${l.id}">
      <span class="num" aria-hidden="true">${state.done[l.id] ? "✓" : l.id === "finale" ? "!" : i + 1}</span>
      <span class="txt"><span class="n">${label(l)}${next && l.id === next.id ? ` · ${t("map.here")}` : ""}</span><span class="t">${l.meta.t}</span><span class="c">${l.meta.c}</span></span>
    </button></li>`;
  const pins = w => w.levels.map((l, i) => `<span class="pin ${state.done[l.id] ? "done" : ""} ${next && l.id === next.id ? "next" : ""}" data-pin="${l.id}" aria-hidden="true">${state.done[l.id] ? "✓" : l.id === "finale" ? "!" : i + 1}</span>`).join("");
  const progress = w => (w.key === "finale" ? "" : `<span class="meta">${t("map.progress", { n: w.levels.filter(l => state.done[l.id]).length, total: w.levels.length })}</span>`);

  show(`<div class="map">
    <div class="map-head">
      <div class="tabs" role="tablist" aria-label="${t("map.tabsAria")}">${worlds.map(w => `<button class="tab" role="tab" id="tab-${w.key}" data-world="${w.key}" aria-controls="panel-${w.key}" aria-selected="${w.key === tab}" tabindex="${w.key === tab ? 0 : -1}"><span class="name">${t(`map.${w.key}.heading`)}</span>${progress(w)}</button>`).join("")}</div>
      <div class="row"><button class="btn alt small" id="codex">${t("map.codex")}</button><button class="btn alt small" id="reset">${t("map.reset")}</button></div>
    </div>
    ${worlds.map(w => `<section class="world" role="tabpanel" id="panel-${w.key}" aria-labelledby="tab-${w.key}" data-world="${w.key}" ${w.key === tab ? "" : "hidden"}>
      <div class="world-head"><p>${t(`map.${w.key}.text`)}</p>${playButton(w)}</div>
      <div class="scene-box diorama" aria-hidden="true">${pins(w)}</div>
      <ol class="path">${w.levels.map(stop).join("")}</ol>
    </section>`).join("")}
  </div>`);

  function playButton(w) {
    const todo = w.levels.find(l => !state.done[l.id]);
    if (todo) return `<button class="btn play" data-go="${todo.id}">${todo.id === "finale" ? t("map.playFinale") : t("map.play", { id: todo.id })}</button>`;
    // Filiera completata: si passa alla prossima tappa ancora da fare, oppure al finale.
    if (next) return `<button class="btn play" data-go="${next.id}">${t(`map.goto.${next.world}`)}</button>`;
    return `<button class="btn play" data-go="end">${t("map.seeEnd")}</button>`;
  }

  function open(key, focus) {
    tab = key;
    $$(".tab").forEach(b => { const on = b.dataset.world === key; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    $$(".world").forEach(p => {
      const on = p.dataset.world === key;
      p.hidden = !on;
      // Il pulsante principale (Invio) è quello della scheda aperta.
      p.querySelector(".play").toggleAttribute("data-primary", on);
    });
    const panel = $(`#panel-${key}`);
    staggerIn($$(".stop", panel), { y: 10 });
    const nodes = mapNodes(state.done).filter(n => n.world === key);
    const here = nodes.find(n => !n.done);
    mountScene($(".diorama", panel), mapScene({ world: key, nodes, here: here && here.id, from: lastHere }, { clickHtml: sel => { const b = $(sel); if (b) b.click(); } }));
    lastHere = here ? here.id : lastHere;
  }

  $$(".tab").forEach(b => {
    b.onclick = () => { if (b.dataset.world !== tab) { sfx.sel(); open(b.dataset.world); } };
    b.onkeydown = e => {
      const i = worlds.findIndex(w => w.key === b.dataset.world);
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      open(worlds[(i + step + worlds.length) % worlds.length].key, true);
    };
  });
  $$(".stop").forEach(b => b.onclick = () => { sfx.sel(); go("intro", b.dataset.lv); });
  $$(".pin").forEach(p => p.onclick = () => $(`.stop[data-lv="${p.dataset.pin}"]`).click());
  $$(".play").forEach(b => b.onclick = () => (b.dataset.go === "end" ? go("final") : go("intro", b.dataset.go)));
  $("#codex").onclick = () => go("codex");
  $("#reset").onclick = () => { resetState(); tab = null; lastHere = null; go("title"); };
  open(tab);
});
