// Schermata del titolo.
import { register, go } from "../engine/router.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { img } from "../render/two/sprites.js";
import { bob, blink } from "../anim/fx.js";
import { logoHtml } from "../ui/hud.js";
import { $, show } from "../ui/dom.js";

register("title", () => {
  show(`<div class="title"><div class="inner">
    ${logoHtml()}
    <span class="tag">${t("title.presents")}</span>
    <div id="hero">${img("jar", 120, "", t("title.jarAlt"))}</div>
    <h1>${t("title.heading")}</h1>
    <p class="sub">${t("title.sub")}</p>
    <button class="btn" data-primary id="start"><span id="press">${t("title.start")}</span></button>
    <span class="hi">${t("title.record")}</span>
    <span class="credit">${t("title.credit")}</span>
  </div></div>`);
  bob($("#hero"));
  blink($("#press"));
  $("#start").onclick = () => { sfx.coin(); go("map"); };
});
