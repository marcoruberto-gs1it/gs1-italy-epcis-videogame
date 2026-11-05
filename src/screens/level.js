// Intro di un livello e avvio della sua meccanica di gioco.
import { register, go, later } from "../engine/router.js";
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { reduced } from "../anim/gsap-setup.js";
import * as fx from "../anim/fx.js";
import { t } from "../content/index.js";
import { img, sprite } from "../render/two/sprites.js";
import { byId, worldStep } from "../levels/index.js";
import { levelShell, ask, fail } from "../ui/kit.js";
import { toggleHint } from "../engine/modes.js";
import { $, $$, show, setMsg } from "../ui/dom.js";
import { mountScene, hook } from "../render/scene-host.js";
import { chainBar, wireChain } from "../ui/chain.js";
import { levelScene } from "../render/three/scenes.js";

// Gli oggetti 3D cliccabili hanno sempre un equivalente HTML: il clic sul 3D attiva il pulsante HTML.
const ctx3d = { clickHtml: sel => { const b = $(sel); if (b && !b.disabled) b.click(); } };

register("intro", id => {
  const level = byId(id);
  if (!level) return go("map");
  state.level = id;
  const finale = id === "finale";
  // La scena della tappa fa da sfondo (in 3D); sopra, il riquadro con il titolo e Bip.
  show(`${chainBar(level)}<div class="intro-layout">
    <div class="scene-box intro-scene" id="introScene"><div class="fallback" id="hero">${img(level.meta.sp, finale ? 96 : 120)}</div></div>
    <div class="title intro-card"><div class="inner">
      <span class="tag">${t("intro.tag", { w: t(`map.${level.world}.heading`), ...worldStep(level) })}</span>
      <h1>${level.meta.t}</h1>
      <div class="narrator">${img("bip", 56, "bip", t("narrator.alt"))}<p class="speech"><b>${t("narrator.name")}</b><span class="txt">${level.intro}</span></p></div>
      <span class="hi">${t("intro.concept", { c: level.meta.c })}</span>
      <button class="btn" data-primary id="go">${t("intro.go")}</button>
    </div></div>
  </div>`);
  const preview = levelScene(level.slug);
  mountScene($("#introScene"), preview && (api => preview(api, { clickHtml() {} })));
  if (finale) { fx.blink($("#hero img")); sfx.alarm(); } else { fx.bob($("#hero img")); sfx.sel(); }
  if (level.meta.sp === "jar") fx.eyes($("#hero img"), sprite("jar"), sprite("jarBlink"));
  fx.eyes($(".narrator .bip"), sprite("bip"), sprite("bipBlink"));
  fx.introSequence($(".intro-card .inner"));
  wireChain();
  $("#go").onclick = () => go("level", id);
});

register("level", id => {
  const level = byId(id);
  if (!level) return go("map");
  state.level = id;
  level.mount({
    C: { register: t("level.register"), ...level.C },
    show(html) {
      show(chainBar(level) + html);
      wireChain();
      $$("[data-bob]").forEach(fx.bob);
      $$("[data-blink]").forEach(fx.blink);
      $$("img[data-sprite=jar]").forEach(el => fx.eyes(el, sprite("jar"), sprite("jarBlink")));
    },
    levelShell, ask, fail, setMsg, hook,
    win: () => go("win", id),
    sfx, img, sprite, fx, later, reduced, state, commit, $, $$
  });
  const hb = $("#hintBtn");
  if (hb) hb.onclick = toggleHint;
  const build = levelScene(level.slug);
  mountScene($("#scene"), build && (api => build(api, ctx3d)));
});
