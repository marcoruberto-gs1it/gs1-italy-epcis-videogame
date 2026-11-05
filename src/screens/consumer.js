// Ultimo anello: chi compra il vasetto inquadra il QR code GS1 (Digital Link con GTIN, lotto e data)
// e vede la pagina del prodotto, con il richiamo in evidenza e la storia del lotto.
// Il QR code è vero: inquadrato con lo smartphone apre la pagina generata in fase di build.
import { register, go } from "../engine/router.js";
import { sfx } from "../engine/audio.js";
import { t } from "../content/index.js";
import { img } from "../render/two/sprites.js";
import { cascade, popIn, confettiFrom } from "../anim/fx.js";
import { gsap, reduced } from "../anim/gsap-setup.js";
import { anim } from "../engine/router.js";
import { $, show } from "../ui/dom.js";
import { qrSvg } from "../ui/qr.js";
import { JAR, jarLink, jarParts } from "../gs1/consumer.js";

/** Il link scomposto: dominio, (01) GTIN, (10) lotto, (15) data. */
export function jarPartsHtml() {
  const AI = t("dl.ai");
  const text = p => (p.ai === null ? t("consumer.domain") : p.ai === "15" ? t("consumer.ai15") : AI[p.ai]);
  const url = jarParts().map(p => (p.ai === null
    ? `<span class="seg dom">${p.value}</span>`
    : `<span class="sl">${p.query ? "?" : "/"}</span><span class="seg ai ${p.ai === "01" ? "key" : "qual"}">${p.ai}</span><span class="sl">${p.query ? "=" : "/"}</span><span class="seg val ${p.ai === "01" ? "key" : "qual"}">${p.value}</span>`)).join("");
  return `<p class="dl-url" tabindex="0" role="group" aria-label="${jarLink()}">${url}</p>
    <ol class="dl-parts">${jarParts().map(p => { const [n, d] = text(p); return `<li class="${p.ai === null ? "dom" : p.ai === "01" ? "key" : "qual"}"><span class="badge">${p.ai ? `(${p.ai})` : "www"}</span><div><p class="nm"><b>${n}</b> <code>${p.value}</code></p><p>${d}</p></div></li>`; }).join("")}</ol>`;
}

register("consumer", () => {
  sfx.power();
  const link = jarLink();
  show(`<div class="consumer">
    <div class="lv-head"><span class="code">${t("consumer.tag")}</span><h2>${t("consumer.heading")}</h2></div>
    <p class="lead">${t("consumer.story")}</p>
    <div class="cons-grid">
      <figure class="jar-label">
        <figcaption class="tag">${t("consumer.label")}</figcaption>
        <div class="jar-row">
          <div class="jar-pic">${img("jar", 110)}<span class="jar-lot"><b>${t("consumer.product")}</b><span>${t("consumerPage.rows.lot")} <code>${JAR.lot}</code></span></span></div>
          <a class="qr-box" href="${link}" target="_blank" rel="noopener" aria-label="${t("consumer.open")} (${t("consumer.newTab")})">${qrSvg(link, { label: t("consumer.qrAria") })}</a>
        </div>
        <p class="scan">${t("consumer.scan")}</p>
        <a class="btn" href="${link}" target="_blank" rel="noopener">${t("consumer.open")}<span class="sr-only"> (${t("consumer.newTab")})</span></a>
      </figure>
      <div class="cons-info stack">
        <section class="card-lite">
          <h3>${t("consumer.seeTitle")}</h3>
          <ol class="see">${t("consumer.see").map((s, i) => `<li class="${i === 0 ? "alert" : ""}">${s}</li>`).join("")}</ol>
        </section>
        <section class="card-lite">
          <h3>${t("consumer.linkTitle")}</h3>
          <p>${t("consumer.linkText")}</p>
          ${jarPartsHtml()}
        </section>
        <p class="note">${t("consumer.sunrise")}</p>
      </div>
    </div>
    <div class="row center"><button class="btn" data-primary id="toFinal">${t("consumer.next")}</button></div>
  </div>`);
  // Il QR code «si stampa» modulo dopo modulo; il vasetto saltella; le spiegazioni arrivano a cascata.
  popIn($(".qr-box"), 0.15);
  if (!reduced()) anim(() => gsap.from(".consumer .qr path", { scale: 0.6, transformOrigin: "50% 50%", duration: 0.7, ease: "elastic.out(1, 0.5)", delay: 0.2 }));
  confettiFrom($(".qr-box"), 24, { spread: 300, rise: 160 });
  cascade(document.querySelectorAll(".consumer .see li, .consumer .dl-parts li"), { x: -20 }, 0.08);
  $("#toFinal").onclick = () => go("final");
});
