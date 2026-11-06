// Evento registrato: le pagine del diario in JSON, il superpotere, la scheda "Perché conta" e le nuove voci del glossario.
import { register, go } from "../engine/router.js";
import { state, commit } from "../engine/state.js";
import { sfx } from "../engine/audio.js";
import { typeLines, popIn, floatScore, pulse, stamp, rain, cascade, confettiFrom } from "../anim/fx.js";
import { t } from "../content/index.js";
import { byId, nextOf, codexOf } from "../levels/index.js";
import { toDocument } from "../gs1/epcis.js";
import { levelCode, glossaryBox } from "../ui/kit.js";
import { $, show, jsonLines } from "../ui/dom.js";
import { chainBar, wireChain } from "../ui/chain.js";
import { jarQrHtml, jarPartsHtml } from "../ui/jar.js";

export function whyCard(why) {
  const who = why.who.map(r => `<span class="role">${t("roles." + r)}</span>`).join("");
  return `<div class="why-card"><span class="tag">${t("win.whyTitle")}</span>
    <p>${why.benefit}</p>
    <p class="who"><span class="lbl">${t("win.who")}:</span> ${who}</p>
    ${why.case ? `<p class="case">${why.case}</p>` : ""}
    ${why.source ? `<p class="source">${t("win.source")}: ${why.source}</p>` : ""}
  </div>`;
}

register("win", id => {
  const level = byId(id);
  if (!level) return go("map");
  let gained = 0;
  if (!state.done[id]) {
    state.done[id] = true;
    gained = 100 * state.lives + 50;
    state.score += gained;
    if (!state.powers.includes(id)) state.powers.push(id);
  }
  state.level = id;
  commit();
  sfx.power();
  const next = nextOf(id);
  const nextLabel = !next ? t("win.end") : next.id === "finale" ? t("win.nextFinale") : t("win.next", { id: next.id });
  const cards = codexOf(level).map(c => c.t).join(", ");
  const many = level.events.length > 1;
  // Tappa senza eventi (1-9, chi compra): niente diario né timbro, al loro posto il QR code del vasetto.
  const none = level.events.length === 0;
  show(`${chainBar(level)}<div class="lv-head"><span class="code">${levelCode(level)}</span><h2 class="ok-title">${none ? t("win.headingDone") : t("win.heading")}</h2>${none ? "" : `<span class="stamp" id="stamp" aria-hidden="true">✓ ${t("win.stamp")}</span>`}</div>
    <div class="win">
      <div class="stack">
        ${none ? `<p class="fact">${t("win.noEvent")}</p><div class="jar-scan row">${jarQrHtml()}</div>${jarPartsHtml()}` : `<div class="row between"><h3>${many ? t("win.diaryMany") : t("win.diary")}</h3><button class="btn alt small" id="doc">${t("win.showDoc")}</button></div>
        <p class="dl-tip">${t("dl.tip")}</p>
        <div class="stack" id="diary"></div>`}
      </div>
      <div class="stack">
        <div class="power"><span class="tag">${t("win.unlocked")}</span><span class="pn">${level.power[0]}</span><p>${level.power[1]}</p></div>
        <p class="fact">${level.fact}</p>
        ${whyCard(level.why)}
        ${glossaryBox(level)}
        ${cards ? `<p class="codex-new">${t("win.codexNew", { list: cards })}</p>` : ""}
        <div class="row">
          <button class="btn alt" id="toMap">${t("win.map")}</button>
          <button class="btn" data-primary id="next">${nextLabel}</button>
        </div>
      </div>
    </div>`);

  let docMode = false;
  const renderEvents = () => {
    $("#diary").innerHTML = level.events.map((e, i) => `<div class="page"><span class="cap">${i + 1} · ${level.captions[i]}</span><pre class="json" id="json${i}" tabindex="0"></pre></div>`).join("");
    const typeFrom = i => {
      const pre = $("#json" + i);
      if (docMode || !pre || !pre.closest(".page") || i >= level.events.length) return;
      typeLines(pre, jsonLines(level.events[i]), sfx.tick, () => typeFrom(i + 1));
    };
    typeFrom(0);
    // Le pagine del diario entrano una dopo l'altra, già leggibili.
    cascade(document.querySelectorAll("#diary .page"), { y: 24 }, 0.12);
  };
  const renderDoc = () => {
    $("#diary").innerHTML = `<p class="cap">${t("win.docNote")}</p><pre class="json" id="json0" tabindex="0">${jsonLines(toDocument(level.events)).join("\n")}</pre>`;
  };
  if (!none) renderEvents();
  if (!none) $("#doc").onclick = () => {
    docMode = !docMode;
    $("#doc").textContent = docMode ? t("win.showEvents") : t("win.showDoc");
    docMode ? renderDoc() : renderEvents();
  };
  // Il superpotere compare con un piccolo scoppio, i punti volano verso l'HUD.
  popIn($(".power"), 0.2);
  confettiFrom($(".power .pn"), 30, { spread: 300, rise: 180 });
  // Il timbro «Registrato» cade sul diario; se la tappa è nuova piovono i coriandoli.
  if (!none) stamp($("#stamp"), $(".win"));
  if (gained) rain(46);
  if (gained) floatScore($(".ok-title"), "+" + gained);
  pulse(document.querySelectorAll(".hud .pw span")[state.powers.indexOf(id)], 2);
  wireChain();
  $("#toMap").onclick = () => go("map");
  $("#next").onclick = () => (next ? go("intro", next.id) : go("final"));
});
