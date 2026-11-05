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

/** JSON con chiavi, stringhe e numeri evidenziati, già diviso in righe. */
export function jsonLines(obj) {
  return esc(JSON.stringify(obj, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)?/g, (m, a, b) => (b ? `<span class="k">${a}</span>${b}` : jsonString(a)))
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
