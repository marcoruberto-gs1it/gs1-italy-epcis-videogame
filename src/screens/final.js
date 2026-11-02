// Schermata finale: punteggio, superpoteri, casi reali prima e dopo.
import { register, go } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { bob } from "../anim/fx.js";
import { t } from "../content/index.js";
import { img } from "../render/two/sprites.js";
import { LEVELS } from "../levels/index.js";
import { $, show } from "../ui/dom.js";

register("final", () => {
  sfx.power();
  show(`<div class="final">
    <span class="tag">${t("final.tag")}</span>
    <div id="hero">${img("jar", 100)}</div>
    <h1>${t("final.heading")}</h1>
    <p class="sub">${t("final.sub")}</p>
    <span class="counter">${t("final.score", { n: String(state.score).padStart(5, "0") })}</span>
    <div class="pgrid">${LEVELS.map(l => `<div class="pcell ${state.powers.includes(l.id) ? "on" : ""}"><span class="pn">${l.power[0]}</span><span>${l.power[1]}</span></div>`).join("")}</div>
    <div class="versus">${t("final.cases").map(c => `<div class="vs"><span class="tag">${c.tag}</span><span class="from">${c.from}</span><span class="to">${c.to}</span><small>${c.text}</small></div>`).join("")}</div>
    <div class="row" style="justify-content:center"><button class="btn alt" id="toMap">${t("final.map")}</button><button class="btn" data-primary id="again">${t("final.again")}</button></div>
  </div>`);
  bob($("#hero"));
  $("#toMap").onclick = () => go("map");
  $("#again").onclick = () => { resetState({ muted: state.muted }); go("title"); };
});
