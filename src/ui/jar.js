// Il QR code del vasetto e il suo GS1 Digital Link scomposto: dominio, (01) GTIN, (10) lotto, (15) data.
// Usati nella tappa 1-9 (chi compra) e nel finale.
import { t } from "../content/index.js";
import { qrSvg } from "./qr.js";
import { jarLink, jarParts } from "../gs1/consumer.js";

const role = p => (p.ai === null ? "dom" : p.ai === "01" ? "key" : "qual");

/** QR code cliccabile: inquadrato o cliccato apre la pagina del vasetto. */
export const jarQrHtml = () =>
  `<a class="qr-box" href="${jarLink()}" target="_blank" rel="noopener" aria-label="${t("consumer.open")} (${t("consumer.newTab")})">${qrSvg(jarLink(), { label: t("consumer.qrAria") })}</a>`;

/** Il link scomposto, con il significato di ogni pezzo. */
export function jarPartsHtml() {
  const AI = t("dl.ai");
  const text = p => (p.ai === null ? t("consumer.domain") : p.ai === "15" ? t("consumer.ai15") : AI[p.ai]);
  const url = jarParts().map(p => (p.ai === null
    ? `<span class="seg dom">${p.value}</span>`
    : `<span class="sl">${p.query ? "?" : "/"}</span><span class="seg ai ${role(p)}">${p.ai}</span><span class="sl">${p.query ? "=" : "/"}</span><span class="seg val ${role(p)}">${p.value}</span>`)).join("");
  return `<p class="dl-url jar-url" tabindex="0" role="group" aria-label="${jarLink()}">${url}</p>
    <ol class="dl-parts">${jarParts().map(p => { const [n, d] = text(p); return `<li class="${role(p)}"><span class="badge">${p.ai ? `(${p.ai})` : "www"}</span><div><p class="nm"><b>${n}</b> <code>${p.value}</code></p><p>${d}</p></div></li>`; }).join("")}</ol>`;
}
