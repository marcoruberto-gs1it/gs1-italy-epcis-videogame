// Intro di un livello e avvio della sua meccanica di gioco.
import { register, go, later } from "../engine/router.js";
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { reduced } from "../anim/gsap-setup.js";
import * as fx from "../anim/fx.js";
import { t } from "../content/index.js";
import { img, sprite } from "../render/two/sprites.js";
import { byId, WORLDS } from "../levels/index.js";
import { levelShell, ask, fail } from "../ui/kit.js";
import { $, $$, show, setMsg } from "../ui/dom.js";

register("intro", id => {
  const level = byId(id);
  if (!level) return go("map");
  state.level = id;
  const finale = id === "finale";
  show(`<div class="title"><div class="inner">
    <span class="tag">${finale ? t("intro.tagFinale") : t("intro.tag", { w: WORLDS[level.world], id })}</span>
    <div id="hero">${img(level.meta.sp, finale ? 96 : 120)}</div>
    <h1>${level.meta.t.toUpperCase()}</h1>
    <div class="narrator">${img("reader", 44, "", t("narrator.alt"))}<p class="speech"><b>${t("narrator.name")}</b> ${level.intro}</p></div>
    <span class="hi">${t("intro.concept", { c: level.meta.c.toUpperCase() })}</span>
    <button class="btn" data-primary id="go">${t("intro.go")}</button>
  </div></div>`);
  if (finale) { fx.blink($("#hero")); sfx.alarm(); } else { fx.bob($("#hero")); sfx.sel(); }
  $("#go").onclick = () => go("level", id);
});

register("level", id => {
  const level = byId(id);
  if (!level) return go("map");
  state.level = id;
  level.mount({
    C: { register: t("level.register"), ...level.C },
    show(html) {
      show(html);
      $$("[data-bob]").forEach(fx.bob);
      $$("[data-blink]").forEach(fx.blink);
    },
    levelShell, ask, fail, setMsg,
    win: () => go("win", id),
    sfx, img, sprite, fx, later, reduced, state, commit, $, $$
  });
});
