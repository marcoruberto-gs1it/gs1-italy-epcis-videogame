// Livello 1-9 · Il consumatore inquadra il QR: il QR code GS1 (Digital Link con GTIN, lotto e data)
// apre la pagina del vasetto con il richiamo in evidenza; chi compra riporta il vasetto e il negozio
// registra il reso con un evento di oggetto (receiving, returned).
import events from "../data/events/food-consumatore.json";
import { defineLevel } from "./define.js";
import { question } from "../ui/kit.js";
import { jarQrHtml, jarPartsHtml } from "../ui/jar.js";
import { jarLink } from "../gs1/consumer.js";
import { t } from "../content/index.js";
import { cascade } from "../anim/fx.js";

export default defineLevel({
  slug: "food-consumatore", id: "1-9", world: "food", sp: "jar", scene: "negozio", events,

  mount({ C, hook, show, levelShell, ask, win, img, $ }) {
    const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
    show(levelShell(this,
      `<div class="row jar-scan"><div data-bob>${img("jar", 96)}</div>${jarQrHtml()}</div><span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <p class="scan-note">${C.scanNote}</p>
       ${question(C.q, C.qCtx, "q")}
       <div class="opts" id="opts"></div><div class="stack" id="link"></div><div class="stack" id="qa2"></div><div class="row" id="after"></div>`));
    ask($("#opts"), C.opts, () => {
      // Lo smartphone legge il link: lo scomponiamo pezzo per pezzo, poi la pagina mostra il richiamo.
      hook("scan");
      $("#link").innerHTML = `<h3>${C.linkTitle}</h3>${jarPartsHtml()}
        <a class="btn alt" href="${jarLink()}" target="_blank" rel="noopener">${t("consumer.open")}<span class="sr-only"> (${t("consumer.newTab")})</span></a>
        <p class="note">${t("consumer.sunrise")}</p>`;
      cascade(document.querySelectorAll("#link .dl-parts li"), { x: -20 }, 0.08);
      $("#qa2").innerHTML = `${question(C.q2, C.q2Ctx, "q2")}<div class="opts" id="opts2"></div>`;
      $("#link").scrollIntoView({ block: "start", behavior: smooth() });
      ask($("#opts2"), C.opts2, () => {
        hook("returned");
        $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
        $("#reg").onclick = () => win();
      });
    });
  }
});
