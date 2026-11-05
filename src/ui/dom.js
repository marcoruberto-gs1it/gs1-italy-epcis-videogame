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

/** JSON con chiavi, stringhe e numeri evidenziati, già diviso in righe. */
export function jsonLines(obj) {
  return esc(JSON.stringify(obj, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)?/g, (m, a, b) => (b ? `<span class="k">${vocLink(a)}</span>${b}` : /^&quot;gs1:/.test(a) ? `<span class="s">${vocLink(a)}</span>` : jsonString(a)))
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
