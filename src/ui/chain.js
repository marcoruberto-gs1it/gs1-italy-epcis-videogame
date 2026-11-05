// Barra «La filiera»: tutte le tappe della filiera sempre in vista, con la tappa corrente ingrandita.
// Serve anche per spostarsi: si clicca una tappa, oppure si usano le frecce precedente e successiva.
import { go } from "../engine/router.js";
import { state } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { LEVELS } from "../levels/index.js";
import { $, $$ } from "./dom.js";
import { icon } from "./icons.js";

/** Tappe da mostrare: quelle della filiera della tappa. La sfida finale ripercorre la filiera food. */
function chainOf(level) {
  if (level.world === "finale") return LEVELS.filter(l => l.world === "food" || l.world === "finale");
  return LEVELS.filter(l => l.world === level.world);
}

export function chainBar(level) {
  const list = chainOf(level);
  const all = LEVELS;
  const i = all.indexOf(level);
  const prev = all[i - 1], next = all[i + 1];
  const name = level.world === "finale" ? t("map.finale.heading") : t(`map.${level.world}.heading`);
  const stop = l => {
    const here = l === level;
    const num = state.done[l.id] ? "✓" : l.id === "finale" ? "!" : l.id.split("-")[1];
    return `<li><button class="cn-stop${here ? " here" : ""}${state.done[l.id] ? " done" : ""}" data-lv="${l.id}"${here ? ` aria-current="step"` : ""}>
      <span class="num" aria-hidden="true">${num}</span><span class="pl">${l.meta.short}</span><span class="sr-only"> · ${l.meta.t}${here ? ` · ${t("map.here")}` : ""}</span></button></li>`;
  };
  const arrow = (l, dir) => l
    ? `<button class="cn-arrow" data-lv="${l.id}" aria-label="${t(`nav.${dir}`)}: ${l.meta.t}">${icon(dir)}</button>`
    : `<span class="cn-arrow off" aria-hidden="true"></span>`;
  return `<nav class="fbar" aria-label="${t("nav.chainAria", { w: name })}">
    <span class="cn-title" aria-hidden="true">${name}</span>
    ${arrow(prev, "prev")}
    <ol class="cn-list">${list.map(stop).join("")}</ol>
    ${arrow(next, "next")}
  </nav>`;
}

/** Collega i pulsanti della barra e porta in vista la tappa corrente (su schermi stretti la barra scorre). */
export function wireChain() {
  $$(".fbar [data-lv]").forEach(b => { b.onclick = () => { sfx.sel(); go("intro", b.dataset.lv); }; });
  const list = $(".fbar .cn-list"), here = $(".fbar .here");
  if (list && here) list.scrollLeft = here.offsetLeft - (list.clientWidth - here.offsetWidth) / 2;
}
