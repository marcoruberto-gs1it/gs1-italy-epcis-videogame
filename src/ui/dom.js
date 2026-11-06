// Utilità per il DOM: selettori, escape, evidenziazione del JSON, cambio del contenuto dello schermo.
import { t } from "../content/index.js";
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const screenEl = () => $("#screen");

export const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Stringa del JSON: i GS1 Digital Link diventano pulsanti che aprono la lente (ui/lens.js). */
function jsonString(q) {
  const uri = q.slice(6, -6);
  return /^https:\/\/id\.gs1\.org\/\d/.test(uri)
    ? `<button type="button" class="s dl" data-dl="${uri}" aria-label="${esc(t("dl.open", { uri }))}">${q}</button>`
    : `<span class="s">${q}</span>`;
}

/** Termine del GS1 Web Vocabulary (gs1:xxx): diventa un link alla sua definizione ufficiale su ref.gs1.org/voc. */
export const VOC = "https://ref.gs1.org/voc/";
function vocLink(q) {
  const m = /^&quot;gs1:([A-Za-z][A-Za-z0-9_-]*)&quot;$/.exec(q);
  return m ? `<a class="voc" href="${VOC}${m[1]}" target="_blank" rel="noopener" aria-label="${esc(t("voc.open", { term: "gs1:" + m[1] }))}">${q}</a>` : q;
}

/**
 * Valori del Core Business Vocabulary (CBV) usati negli eventi del gioco, con la loro lista di codici.
 * Ognuno è verificato sulla definizione ufficiale (https://ref.gs1.org/cbv/?show=codelistvalues):
 * il link è https://ref.gs1.org/cbv/{Lista}-{valore}. Un test controlla che ogni valore CBV degli eventi sia qui.
 */
export const CBV = "https://ref.gs1.org/cbv/";
export const CBV_TERMS = {
  bizStep: { list: "BizStep", values: ["assembling", "commissioning", "cycle_counting", "holding", "inspecting", "packing", "receiving", "shipping", "transporting"] },
  disposition: { list: "Disp", values: ["active", "in_progress", "in_transit", "recalled", "returned", "sellable_accessible"] },
  reason: { list: "ER", values: ["incorrect_data"] },
  // "type" serve a più liste: tipo di transazione (bizTransactionList) e tipo di origine o destinazione.
  type: { list: v => (["po", "desadv", "recadv"].includes(v) ? "BTT" : "SDT"), values: ["po", "desadv", "recadv", "owning_party", "location"] }
};

/** URL della definizione CBV di un valore, oppure null se il campo non è CBV o il valore non è verificato. */
export function cbvUrl(key, value) {
  const d = CBV_TERMS[key];
  if (!d || !d.values.includes(value)) return null;
  return `${CBV}${typeof d.list === "function" ? d.list(value) : d.list}-${value}`;
}

/**
 * Tipi di misura dei sensori (sensorReport.type): nel contesto JSON-LD di EPCIS 2.0 sono termini del
 * GS1 Web Vocabulary, come gs1:Temperature (gs1:MeasurementType, v1.16). Verificati uno per uno.
 */
export const VOC_MEASURES = ["Temperature"];

function cbvLink(q, key) {
  const v = q.slice(6, -6);
  if (key === "type" && VOC_MEASURES.includes(v)) return `<span class="s"><a class="voc" href="${VOC}${v}" target="_blank" rel="noopener" aria-label="${esc(t("voc.open", { term: "gs1:" + v }))}">${q}</a></span>`;
  const url = cbvUrl(key, v);
  return url && `<span class="s"><a class="cbv" href="${url}" target="_blank" rel="noopener" aria-label="${esc(t("cbv.open", { term: q.slice(6, -6) }))}">${q}</a></span>`;
}

/** JSON con chiavi, stringhe e numeri evidenziati, già diviso in righe. */
export function jsonLines(obj) {
  // La chiave appena letta dice se il valore che segue è una parola del CBV (bizStep, disposition...).
  let key = null;
  return esc(JSON.stringify(obj, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)?/g, (m, a, b) => {
      if (b) { key = a.slice(6, -6); return `<span class="k">${vocLink(a)}</span>${b}`; }
      if (/^&quot;gs1:/.test(a)) return `<span class="s">${vocLink(a)}</span>`;
      return cbvLink(a, key) || jsonString(a);
    })
    .replace(/(:\s)(-?\d+(\.\d+)?)/g, '$1<span class="n">$2</span>')
    .split("\n");
}

export function show(html) {
  const screen = screenEl();
  screen.innerHTML = html;
  screen.scrollTop = 0;
}

export function setMsg(html, good) {
  const m = $("#msg");
  if (!m) return;
  m.className = "msg" + (good ? " good" : "");
  m.innerHTML = html;
}

// ---------- Righe che non vanno mai a capo (JSON, ricerche nell'archivio, indirizzi) ----------
const FIT = "pre.json, .req";
const DESKTOP = 900;

/**
 * Su desktop riduce il carattere quanto basta perché la riga più lunga stia tutta nel riquadro,
 * senza andare a capo e senza scorrere (minimo 10 px). Su telefono le righe scorrono di lato.
 */
export function fitLines(el) {
  el.style.fontSize = "";
  if (innerWidth < DESKTOP || !el.clientWidth) return;
  for (let i = 0; i < 3 && el.scrollWidth > el.clientWidth + 1; i++) {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = Math.max(10, Math.floor(fs * (el.clientWidth - 2) / el.scrollWidth * 10) / 10) + "px";
  }
}

/** Adatta da solo ogni blocco nuovo o modificato, e tutti quando cambia la larghezza della finestra. */
export function initFitLines() {
  let queued = false;
  const all = () => { queued = false; $$(FIT).forEach(fitLines); };
  const later = () => { if (!queued) { queued = true; requestAnimationFrame(all); } };
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  addEventListener("resize", later);
  document.fonts?.ready.then(later);
}
