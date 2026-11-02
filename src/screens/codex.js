// Codex EPCIS: le carte dei concetti, che si sbloccano completando i livelli.
import { register, go } from "../engine/router.js";
import { state } from "../engine/state.js";
import { t } from "../content/index.js";
import { CODEX } from "../levels/index.js";
import { $, show } from "../ui/dom.js";

register("codex", () => {
  const open = CODEX.filter(c => state.done[c.level.id]);
  const card = c => state.done[c.level.id]
    ? `<article class="card"><h3>${c.t}</h3><p>${c.def}</p>
        <p><span class="lbl">${t("codex.example")}:</span> ${c.ex}</p>
        <p><span class="lbl">${t("codex.useful")}:</span> ${c.use}</p></article>`
    : `<article class="card locked" aria-label="${t("codex.locked")}"><h3>${t("codex.locked")}</h3><p>${t("codex.lockedText", { id: c.level.id })}</p></article>`;
  show(`<div class="codex">
    <div class="row between"><h2>${t("codex.heading")}</h2><button class="btn" data-primary id="back">${t("codex.back")}</button></div>
    <p class="sub">${t("codex.sub", { n: open.length, total: CODEX.length })}</p>
    <div class="cards">${CODEX.map(card).join("")}</div>
  </div>`);
  $("#back").onclick = () => go("map");
});
