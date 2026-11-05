// Schermata finale: punteggio, superpoteri, casi reali prima e dopo, vantaggi per ruolo (stampabili).
import { register, go } from "../engine/router.js";
import { state, resetState } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { bob, eyes, burst, introSequence } from "../anim/fx.js";
import { t } from "../content/index.js";
import { img, sprite } from "../render/two/sprites.js";
import { LEVELS } from "../levels/index.js";
import { logoHtml } from "../ui/hud.js";
import { $, show } from "../ui/dom.js";

register("final", () => {
  sfx.power();
  const benefits = t("final.benefits");
  show(`<div class="final">
    <span class="tag">${t("final.tag")}</span>
    <div id="hero">${img("jar", 100)}</div>
    <h1>${t("final.heading")}</h1>
    <p class="sub">${t("final.sub")}</p>
    <span class="counter">${t("final.score", { n: String(state.score).padStart(5, "0") })}</span>

    <h3>${t("final.powersTitle")}</h3>
    <div class="pgrid">${LEVELS.map(l => `<div class="pcell ${state.powers.includes(l.id) ? "on" : ""}"><span class="pn">${state.powers.includes(l.id) ? "✓ " : ""}${l.power[0]}</span><span>${l.power[1]}</span></div>`).join("")}</div>

    <h3>${t("final.casesTitle")}</h3>
    <div class="versus">${t("final.cases").map(c => `<div class="vs"><span class="tag">${c.tag}</span><span class="from">${c.from}</span><span class="to">${c.to}</span><small>${c.text}</small><small class="source">${t("win.source")}: ${c.source}</small></div>`).join("")}</div>

    <section class="benefits" id="benefits">
      <div class="print-only">${logoHtml()}</div>
      <h3>${t("final.benefitsTitle")}</h3>
      <p>${t("final.benefitsSub")}</p>
      <div class="roles">${Object.entries(benefits).map(([role, list]) => `<div class="rolecard"><h4>${t("roles." + role)}</h4><ul>${list.map(b => `<li>${b}</li>`).join("")}</ul></div>`).join("")}</div>
    </section>

    <div class="row center">
      <button class="btn alt" id="print">${t("final.print")}</button>
      <button class="btn alt" id="toMap">${t("final.map")}</button>
      <button class="btn" data-primary id="again">${t("final.again")}</button>
    </div>
  </div>`);
  bob($("#hero img"));
  eyes($("#hero img"), sprite("jar"), sprite("jarBlink"));
  introSequence($(".final"));
  // Coriandoli in pixel con i colori di brand.
  burst($("#hero"), ["var(--gs1-forest)", "var(--gs1-white)", "var(--gs1-orange)", "var(--gs1-blue-200)"], 28);
  $("#print").onclick = () => window.print();
  $("#toMap").onclick = () => go("map");
  $("#again").onclick = () => { resetState(); go("title"); };
});
