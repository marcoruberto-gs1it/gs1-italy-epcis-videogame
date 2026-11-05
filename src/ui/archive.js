// Archivio degli eventi (tasto E o pulsante «Eventi»): il JSON-LD di ogni tappa, consultabile in ogni momento.
// Si apre sopra il gioco senza cambiare schermata: alla chiusura si torna esattamente dove si era.
import { t } from "../content/index.js";
import { state } from "../engine/state.js";
import { setPaused } from "../engine/router.js";
import { LEVELS } from "../levels/index.js";
import { toDocument } from "../gs1/epcis.js";
import { levelCode } from "./kit.js";
import { $, $$, jsonLines } from "./dom.js";
import { closeLens } from "./lens.js";

let current = null;
let docMode = false;
let opener = null;
export const isArchiveOpen = () => !!$("#archive");

const pick = () => LEVELS.find(l => l.id === state.level) || LEVELS.find(l => !state.done[l.id]) || LEVELS[0];

function panelHtml(level) {
  const pages = docMode
    ? `<p class="cap">${t("archive.docNote")}</p><pre class="json" tabindex="0">${jsonLines(toDocument(level.events)).join("\n")}</pre>`
    : level.events.map((e, i) => `<div class="page"><span class="cap">${i + 1} · ${level.captions[i]}</span><pre class="json" tabindex="0">${jsonLines(e).join("\n")}</pre></div>`).join("");
  return `<div class="arch-head">
      <h3>${level.meta.t} <span class="c">${level.meta.c}</span></h3>
      <div class="row">
        <button class="btn alt small" id="archDoc" aria-pressed="${docMode}">${docMode ? t("archive.showEvents") : t("archive.showDoc")}</button>
        <button class="btn alt small" id="archCopy">${t("archive.copy")}</button>
        <span class="copied" id="archCopied" role="status"></span>
      </div>
    </div>
    <p class="dl-tip">${t("dl.tip")}</p>
    <div class="stack">${pages}</div>`;
}

function select(id, focus) {
  current = LEVELS.find(l => l.id === id) || current;
  $$("#archive .tab").forEach(b => {
    const on = b.dataset.id === current.id;
    b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  const panel = $("#archPanel");
  panel.setAttribute("aria-labelledby", "archTab-" + current.id);
  panel.innerHTML = panelHtml(current);
  $("#archDoc").onclick = () => { docMode = !docMode; select(current.id); $("#archDoc").focus(); };
  $("#archCopy").onclick = async () => {
    const out = $("#archCopied");
    const text = JSON.stringify(docMode ? toDocument(current.events) : current.events, null, 2);
    try { await navigator.clipboard.writeText(text); out.textContent = t("archive.copied"); }
    catch { out.textContent = t("archive.copyFail"); }
  };
}

export function toggleArchive(force) {
  const open = force ?? !isArchiveOpen();
  if (!open) {
    closeLens();
    $("#archive")?.remove();
    $(".app")?.removeAttribute("inert");
    setPaused(false);
    if (opener && opener.isConnected) opener.focus();
    opener = null;
    return;
  }
  if (isArchiveOpen()) return;
  opener = document.activeElement;
  current = pick();
  const el = document.createElement("div");
  el.id = "archive"; el.className = "help archive";
  el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "archTitle");
  el.innerHTML = `<div class="box">
    <div class="row between top">
      <div><span class="tag">${t("archive.tag")}</span><h2 id="archTitle" tabindex="-1">${t("archive.heading")}</h2></div>
      <button class="btn alt small" id="archClose">${t("archive.close")}</button>
    </div>
    <p class="sub">${t("archive.sub")}</p>
    <div class="tabs" role="tablist" aria-label="${t("archive.tabsAria")}">${LEVELS.map(l =>
      `<button class="tab" role="tab" id="archTab-${l.id}" data-id="${l.id}" aria-controls="archPanel"><span class="name">${levelCode(l)}</span><span class="meta">${l.meta.short}</span></button>`).join("")}</div>
    <section class="arch-panel" role="tabpanel" id="archPanel"></section>
    <p class="close">${t("archive.closeHint")}</p>
  </div>`;
  el.addEventListener("click", e => { if (e.target === el) toggleArchive(false); });
  document.body.appendChild(el);
  $(".app")?.setAttribute("inert", "");
  setPaused(true);
  $("#archClose").onclick = () => toggleArchive(false);
  const tabs = $$("#archive .tab");
  tabs.forEach((b, i) => {
    b.onclick = () => select(b.dataset.id);
    b.onkeydown = e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length].dataset.id, true);
    };
  });
  select(current.id);
  $("#archTitle").focus();
}
