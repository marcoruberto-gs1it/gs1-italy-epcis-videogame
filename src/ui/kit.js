// Mattoni comuni dei livelli: intestazione, domande a scelta, errori e schermata "continui?".
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { later } from "../engine/router.js";
import { shake } from "../anim/fx.js";
import { t } from "../content/index.js";
import { $, $$, screenEl, setMsg } from "./dom.js";

export const levelCode = level => (level.id === "finale" ? t("level.codeFinale") : t("level.code", { id: level.id }));

export function levelShell(level, sceneHtml, bodyHtml) {
  const m = level.meta;
  return `<div class="lv-head"><span class="code">${levelCode(level)}</span><h2>${m.t.toUpperCase()}</h2><span class="tag">${m.place.toUpperCase()}</span></div>
    <div class="lv"><div class="scene" id="scene">${sceneHtml}</div><div class="stack" id="body">${bodyHtml}<div class="msg" id="msg" role="status"></div></div></div>`;
}

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
    if (cd) cd.textContent = Math.max(n, 0);
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
      sfx.ok(); setMsg(o.why || "", true); onOk();
    } else { b.classList.add("no"); b.disabled = true; fail(o.why); }
  });
}
