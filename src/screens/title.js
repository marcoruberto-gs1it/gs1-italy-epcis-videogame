// Schermata del titolo: testi e avvio a sinistra, la filiera illustrata a destra.
import { register, go } from "../engine/router.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { img, sprite } from "../render/two/sprites.js";
import { bob, eyes, introSequence } from "../anim/fx.js";
import { $, show } from "../ui/dom.js";
import { state } from "../engine/state.js";
import { mountScene } from "../render/scene-host.js";
import { mapScene } from "../render/three/scenes.js";
import { mapNodes } from "../levels/index.js";

register("title", () => {
  show(`<div class="home">
    <div class="intro">
      <span class="tag">${t("title.presents")}</span>
      <h1>${t("title.heading").replace("L123", "<em>L123</em>")}</h1>
      <p class="sub">${t("title.sub")}</p>
      <div class="row"><button class="btn" data-primary data-pop id="start">${t("title.start")}</button></div>
      <span class="hi">${t("title.record")}</span>
      <span class="credit">${t("title.credit")}</span>
    </div>
    <div class="scene-box hero-scene" id="heroScene"><div class="fallback" id="hero">${img("jar", 120, "", t("title.jarAlt"))}</div></div>
  </div>`);
  bob($("#hero img"));
  eyes($("#hero img"), sprite("jar"), sprite("jarBlink"));
  introSequence($(".home .intro"));
  mountScene($("#heroScene"), mapScene({ world: "food", nodes: mapNodes(state.done).filter(n => n.world === "food"), here: null, from: null }, { clickHtml() {} }));
  $("#start").onclick = () => { sfx.coin(); go("map"); };
});
