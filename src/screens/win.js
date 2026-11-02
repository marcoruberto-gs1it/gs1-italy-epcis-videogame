// Evento registrato: la pagina del diario in JSON e il superpotere sbloccato.
import { register, go } from "../engine/router.js";
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { typeLines } from "../anim/fx.js";
import { t } from "../content/index.js";
import { byId, nextOf } from "../levels/index.js";
import { levelCode } from "../ui/kit.js";
import { $, show, jsonLines } from "../ui/dom.js";

register("win", id => {
  const level = byId(id);
  if (!level) return go("map");
  if (!state.done[id]) {
    state.done[id] = true;
    state.score += 100 * state.lives + 50;
    if (!state.powers.includes(id)) state.powers.push(id);
  }
  state.level = id;
  commit();
  sfx.power();
  const next = nextOf(id);
  const nextLabel = !next ? t("win.end") : next.id === "finale" ? t("win.nextFinale") : t("win.next", { id: next.id });
  show(`<div class="lv-head"><span class="code">${levelCode(level)}</span><h2 style="color:var(--gs1-forest-300)">${t("win.heading")}</h2></div>
    <div class="win">
      <div class="stack"><h3>${t("win.diary")}</h3><pre class="json" id="json" tabindex="0"></pre></div>
      <div class="stack">
        <div class="power"><span class="tag">${t("win.unlocked")}</span><span class="pn">${level.power[0]}</span><p>${level.power[1]}</p></div>
        <p class="fact">${level.fact}</p>
        <div class="row">
          <button class="btn alt" id="toMap">${t("win.map")}</button>
          <button class="btn" data-primary id="next">${nextLabel}</button>
        </div>
      </div>
    </div>`);
  typeLines($("#json"), jsonLines(level.event), sfx.tick);
  $("#toMap").onclick = () => go("map");
  $("#next").onclick = () => (next ? go("intro", next.id) : go("final"));
});
