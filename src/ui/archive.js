// Archivio degli eventi (tasto E o pulsante «Eventi»): il JSON-LD di ogni tappa, consultabile in ogni momento.
// È una pagina, non una finestra sovrapposta: prende il posto della schermata di gioco, che resta sospesa
// (nascosta, non distrutta). Alla chiusura si torna esattamente dove si era.
import { t } from "../content/index.js";
import { state } from "../engine/state.js";
import { setPaused, onRoute } from "../engine/router.js";
import { LEVELS } from "../levels/index.js";
import { toDocument } from "../gs1/epcis.js";
import { levelCode } from "./kit.js";
import { $, $$, jsonLines } from "./dom.js";
import { closeLens } from "./lens.js";
import { gsap, reduced } from "../anim/gsap-setup.js";

let current = null;
let docMode = false;
let opener = null;
let prevTab = null;
export const isArchiveOpen = () => !!$("#archive");

/** Il pulsante «Eventi» della barra in alto indica se l'archivio è aperto. */
function archBtn(on) { $("#archBtn")?.setAttribute("aria-pressed", on); }

// Inizio, Mappa o un'altra schermata chiudono l'archivio e mostrano la nuova schermata.
onRoute(() => toggleArchive(false));

const pick = () => LEVELS.find(l => l.id === state.level) || LEVELS.find(l => !state.done[l.id]) || LEVELS[0];

/**
 * Scheda «Tutta la filiera»: gli eventi di tutte le tappe alimentari e del ritiro, in ordine di tappa,
 * dalla nascita del lotto di latte alla stalla fino al richiamo. Ogni pagina dice da quale tappa viene.
 */
function wholeChain() {
  const levels = LEVELS.filter(l => l.world === "food" || l.world === "finale");
  const events = levels.flatMap(l => l.events);
  const captions = levels.flatMap(l => l.events.map((e, i) => `${levelCode(l)} · ${l.captions[i]}`));
  return { id: "all", whole: true, events, captions, meta: { t: t("archive.allHeading"), c: t("archive.allCount", { n: events.length }) } };
}

function panelHtml(level) {
  const pages = docMode
    ? `<p class="cap">${t("archive.docNote")}</p><pre class="json" tabindex="0">${jsonLines(toDocument(level.events)).join("\n")}</pre>`
    : level.events.map((e, i) => `<div class="page"><span class="cap">${level.whole ? "" : `${i + 1} · `}${level.captions[i]}</span><pre class="json" tabindex="0">${jsonLines(e).join("\n")}</pre></div>`).join("");
  return `<div class="arch-head">
      <h3>${level.meta.t} <span class="c">${level.meta.c}</span></h3>
      <div class="row">
        <button class="btn alt small" id="archDoc" aria-pressed="${docMode}">${docMode ? t("archive.showEvents") : t("archive.showDoc")}</button>
        <button class="btn alt small" id="archCopy">${t("archive.copy")}</button>
        <span class="copied" id="archCopied" role="status"></span>
      </div>
    </div>
    ${level.whole ? `<p class="sub">${t("archive.allNote")}</p>` : ""}
    <p class="dl-tip">${t("dl.tip")}</p>
    <div class="stack">${pages}</div>`;
}

function select(id, focus) {
  current = id === "all" ? wholeChain() : LEVELS.find(l => l.id === id) || current;
  $$("#archive .tab").forEach(b => {
    const on = b.dataset.id === current.id;
    b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  const panel = $("#archPanel");
  panel.setAttribute("aria-labelledby", "archTab-" + current.id);
  const before = prevTab;
  prevTab = current.id;
  panel.innerHTML = panelHtml(current);
  // Cambio di tappa: il pannello scivola dal lato della tappa scelta e le pagine arrivano a cascata.
  if (before && before !== current.id && !reduced()) {
    const order = id => (id === "all" ? LEVELS.length : LEVELS.findIndex(l => l.id === id));
    const dir = order(current.id) > order(before) ? 1 : -1;
    gsap.from(panel.querySelectorAll(".arch-head, .page, pre.json"), { x: 40 * dir, duration: 0.45, stagger: 0.05, ease: "power3.out", clearProps: "transform" });
  }
  $("#archDoc").onclick = () => { docMode = !docMode; select(current.id); $("#archDoc").focus(); };
  $("#archCopy").onclick = async () => {
    const out = $("#archCopied");
    // Si copia sempre un EPCISDocument completo (un oggetto, non una lista di eventi):
    // è il formato che strumenti come OpenEPCIS si aspettano.
    const text = JSON.stringify(toDocument(current.events), null, 2);
    try { await navigator.clipboard.writeText(text); out.textContent = t("archive.copied"); }
    catch { out.textContent = t("archive.copyFail"); }
  };
}

export function toggleArchive(force) {
  const open = force ?? !isArchiveOpen();
  if (!open) {
    closeLens();
    if (!isArchiveOpen()) return;
    $("#archive").remove();
    $("#screen").hidden = false;
    setPaused(false);
    archBtn(false);
    if (opener && opener.isConnected) opener.focus();
    opener = null;
    return;
  }
  if (isArchiveOpen()) return;
  opener = document.activeElement;
  current = pick();
  const el = document.createElement("section");
  el.id = "archive"; el.className = "archive";
  el.setAttribute("aria-labelledby", "archTitle");
  el.innerHTML = `<div class="box">
    <div class="row between top">
      <div><span class="tag">${t("archive.tag")}</span><h2 id="archTitle" tabindex="-1">${t("archive.heading")}</h2></div>
      <button class="btn alt small" id="archClose">${t("archive.close")}</button>
    </div>
    <p class="sub">${t("archive.sub")}</p>
    <div class="tabs" role="tablist" aria-label="${t("archive.tabsAria")}">${LEVELS.map(l =>
      `<button class="tab" role="tab" id="archTab-${l.id}" data-id="${l.id}" aria-controls="archPanel"><span class="name">${levelCode(l)}</span><span class="meta">${l.meta.short}</span></button>`).join("")}<button class="tab all" role="tab" id="archTab-all" data-id="all" aria-controls="archPanel"><span class="name">${t("archive.allTab")}</span><span class="meta">${t("archive.allTabMeta")}</span></button></div>
    <section class="arch-panel" role="tabpanel" id="archPanel"></section>
    <p class="close">${t("archive.closeHint")}</p>
  </div>`;
  const screen = $("#screen");
  screen.hidden = true;
  screen.after(el);
  setPaused(true);
  archBtn(true);
  window.scrollTo(0, 0);
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
  prevTab = null;
  select(current.id);
  $("#archTitle").focus();
  // Apertura: le schede delle tappe arrivano a cascata, come pagine di un raccoglitore.
  if (!reduced()) gsap.from(tabs, { y: -18, rotation: () => (Math.random() - 0.5) * 6, duration: 0.5, stagger: 0.04, ease: "back.out(2.2)", clearProps: "transform" });
}
