// Lente sul GS1 Digital Link: un clic su un link id.gs1.org nel JSON lo scompone in Application Identifier.
import { t } from "../content/index.js";
import { parseDigitalLink } from "../gs1/digitallink.js";
import { $, esc } from "./dom.js";

let opener = null;
export const isLensOpen = () => !!$("#lens");

// Ruolo di ogni pezzo, per il colore: chiave principale o dato che la precisa.
const role = ai => (["10", "254"].includes(ai) ? "qual" : "key");

function urlHtml(dl) {
  return `<span class="seg dom">${dl.domain.replace("https://", "")}</span>` + dl.parts
    .map(p => `<span class="sl">/</span><span class="seg ai ${role(p.ai)}">${esc(p.ai)}</span><span class="sl">/</span><span class="seg val ${role(p.ai)}">${esc(p.value)}</span>`).join("");
}

function partHtml(p) {
  const [name, text] = t("dl.ai")[p.ai] || [t("dl.unknownName"), t("dl.unknownText")];
  return `<li class="${role(p.ai)}"><span class="badge">(${esc(p.ai)})</span><div>
    <p class="nm"><b>${name}</b> <code>${esc(p.value)}</code></p>
    <p>${text}</p>
    ${p.check ? `<p class="chk">${t("dl.check", { d: p.check })}</p>` : ""}
  </div></li>`;
}

export function openLens(uri, from) {
  const dl = parseDigitalLink(uri);
  if (!dl) return;
  closeLens();
  opener = from || document.activeElement;
  const el = document.createElement("div");
  el.id = "lens"; el.className = "help lens";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "lensTitle");
  el.innerHTML = `<div class="box" tabindex="-1">
    <span class="tag">${t("dl.tag")}</span>
    <h2 id="lensTitle">${t("dl.heading")}</h2>
    <p class="dl-url">${urlHtml(dl)}</p>
    <p>${t("dl.intro")} ${t("dl.aiWhat")}</p>
    <ol class="dl-parts">
      <li class="dom"><span class="badge">id.gs1.org</span><div><p class="nm"><b>${t("dl.domainName")}</b></p><p>${t("dl.domainText")}</p></div></li>
      ${dl.parts.map(partHtml).join("")}
    </ol>
    <p class="note">${t("dl.qr")}</p>
    <div class="row"><button class="btn alt small" id="lensClose">${t("dl.close")}</button></div>
  </div>`;
  el.addEventListener("click", e => { if (e.target === el) closeLens(); });
  document.body.appendChild(el);
  document.querySelectorAll(".app, #archive").forEach(n => n.setAttribute("inert", ""));
  $("#lensClose").onclick = closeLens;
  $(".box", el).focus();
}

export function closeLens() {
  const el = $("#lens");
  if (!el) return;
  el.remove();
  // L'archivio, se aperto, resta il livello attivo; altrimenti torna attivo il gioco.
  const arch = $("#archive");
  if (arch) arch.removeAttribute("inert"); else $(".app")?.removeAttribute("inert");
  if (opener && opener.isConnected) opener.focus();
  opener = null;
}

export function initLens() {
  document.addEventListener("click", e => {
    const b = e.target.closest?.("button.dl[data-dl]");
    if (b) { e.preventDefault(); openLens(b.dataset.dl, b); }
  });
}
