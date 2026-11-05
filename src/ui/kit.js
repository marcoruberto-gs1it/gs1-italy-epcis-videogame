// Mattoni comuni dei livelli: intestazione, domande a scelta, errori e schermata "continui?".
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { later } from "../engine/router.js";
import { shake, burst, pulse, celebrate, wobble, cascade } from "../anim/fx.js";
import { ui, onModes } from "../engine/modes.js";
import { backdrop } from "../render/two/scenes.js";
import { t } from "../content/index.js";
import { $, $$, screenEl, setMsg } from "./dom.js";
import { hook } from "../render/scene-host.js";

export const levelCode = level => (level.id === "finale" ? t("level.codeFinale") : t("level.code", { id: level.id }));

export function levelShell(level, sceneHtml, bodyHtml) {
  const m = level.meta;
  return `<div class="lv-head"><span class="code">${levelCode(level)}</span><h2>${m.t}</h2><span class="tag">${m.place}</span></div>
    <div class="lv"><div class="scene" id="scene"><p class="sr-only">${level.C.sceneDesc}</p>${backdrop(level.scene)}<div class="scene-content">${sceneHtml}</div></div><div class="stack" id="body">${hintBox(level)}${bodyHtml}<div class="msg" id="msg" role="status"></div>${glossaryBox(level)}</div></div>`;
}

/** Glossario della tappa: le parole che servono, spiegate in breve. */
export function glossaryBox(level) {
  const g = level.C.glossary;
  if (!g || !g.length) return "";
  return `<section class="gloss" aria-label="${t("level.glossary")}"><h3>${t("level.glossary")}</h3><dl>${g.map(([w, d]) => `<div><dt>${w}</dt><dd>${d}</dd></div>`).join("")}</dl></section>`;
}

/** Pulsante e testo del suggerimento del livello. */
function hintBox(level) {
  if (!level.C.hint) return "";
  ui.hint = false;
  return `<div class="hint-box"><button class="btn alt small" id="hintBtn" aria-expanded="false">${t("hint.button")}</button><p class="hint" id="hint" hidden>${level.C.hint}</p></div>`;
}

export function renderHint() {
  const h = $("#hint"), b = $("#hintBtn");
  if (!h || !b) return;
  h.hidden = !ui.hint;
  b.textContent = ui.hint ? t("hint.hide") : t("hint.button");
  b.setAttribute("aria-expanded", String(ui.hint));
}
onModes(renderHint);

export function fail(why) {
  state.lives = Math.max(0, state.lives - 1);
  sfx.no(); shake(screenEl()); commit();
  setMsg(why);
  if (state.lives === 0) continueScreen();
}

export function continueScreen() {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `<div class="box"><h2>${t("continue.heading")}</h2><div class="count" id="cd">9</div><button class="btn" data-primary id="cont">${t("continue.coin")}</button></div>`;
  screenEl().appendChild(ov);
  let n = 9;
  const timer = later.every(() => {
    n--;
    const cd = $("#cd");
    if (cd) { cd.textContent = Math.max(n, 0); pulse(cd); }
    sfx.tick();
    if (n <= 0) go();
  }, 900);
  function go() { later.stop(timer); sfx.coin(); state.lives = 3; commit(); ov.remove(); }
  $("#cont").onclick = go;
}

/** Domanda a scelta multipla: le opzioni sbagliate tolgono una vita, quella giusta chiama onOk. */
export function ask(container, opts, onOk) {
  container.innerHTML = opts.map((o, i) => `<button class="opt" data-key="${i + 1}" data-i="${i}"><span class="k">${i + 1}</span><span>${o.t}</span></button>`).join("");
  $$(".opt", container).forEach(b => b.onclick = () => {
    const o = opts[+b.dataset.i];
    if (o.ok) {
      $$(".opt", container).forEach(x => x.disabled = true);
      b.classList.add("ok"); b.onclick = null;
      sfx.ok(); celebrate(b); setMsg(o.why || "", true); onOk();
    } else { b.classList.add("no"); b.disabled = true; wobble(b); fail(o.why); }
  });
  // Le opzioni entrano una dopo l'altra (sono leggibili da subito).
  cascade($$(".opt", container), { x: -18 }, 0.05);
}

/** Domanda con il suo contesto: prima la situazione e i termini che servono, poi la domanda. */
export function question(q, ctx, focus = "q") {
  // Quando la domanda è sullo schermo, la scena 3D si avvicina al punto che interessa.
  queueMicrotask(() => hook("focus", focus));
  const box = ctx ? `<div class="ctx"><span class="lbl">${t("level.context")}</span><p>${ctx}</p></div>` : "";
  return `<div class="qblock">${box}<p class="q">${q}</p></div>`;
}
