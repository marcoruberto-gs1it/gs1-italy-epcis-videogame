// Utilità per il DOM: selettori, escape, evidenziazione del JSON, cambio del contenuto dello schermo.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const screenEl = () => $("#screen");

export const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** JSON con chiavi, stringhe e numeri evidenziati, già diviso in righe. */
export function jsonLines(obj) {
  return esc(JSON.stringify(obj, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)?/g, (m, a, b) => (b ? `<span class="k">${a}</span>${b}` : `<span class="s">${a}</span>`))
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
