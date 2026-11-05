// Pagina prodotto del vasetto, quella che si apre inquadrando il QR code GS1 alla fine del gioco.
// Viene generata in fase di build (plugin in vite.config.js) nel percorso GS1 Digital Link:
//   dist/01/08000000001016/10/L123.html  →  …/01/08000000001016/10/L123?15=261130 su GitHub Pages.
// Testi da it.json (consumerPage), date e misure dagli eventi EPCIS del gioco, colori da tokens.css.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { JAR, jarPath, jarLink, jarParts, PUBLIC_BASE } from "../src/gs1/consumer.js";

const read = f => JSON.parse(readFileSync(f, "utf8"));
const ev = name => read(`src/data/events/${name}.json`);

/** Passi della storia del lotto: testo da it.json, data ed evento dal JSON del gioco. */
function steps() {
  const map = [
    ["stalla", ev("food-stalla")[0]],
    ["ricevimento", ev("food-stalla")[1]],
    ["vasca", ev("food-latte")[0]],
    ["controllo", ev("food-nascita")[0]],
    ["pallet", ev("food-raggi-x")[1]],
    ["spedizione", ev("food-cbv")[0]],
    ["freddo", ev("food-freddo")[1]],
    ["cedi", ev("food-errore")[1]],
    ["richiamo", ev("sfida-finale")[0]]
  ];
  return map.map(([key, e]) => ({ key, e }));
}

const fmtDate = iso => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(new Date(iso));
const fmtTime = iso => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(iso));
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const num = n => String(n).replace(".", ",");

const JAR_SVG = `<svg class="jar" viewBox="0 0 120 130" aria-hidden="true">
  <rect x="14" y="8" width="92" height="16" rx="6" class="lid"/>
  <path d="M20 28h80l-8 92a8 8 0 0 1-8 7H36a8 8 0 0 1-8-7z" class="cup"/>
  <rect x="26" y="52" width="68" height="40" rx="6" class="lbl"/>
  <text x="60" y="70" text-anchor="middle" class="t1">YOGURT</text>
  <text x="60" y="85" text-anchor="middle" class="t2">L123</text>
</svg>`;

export function consumerPageHtml() {
  const it = read("src/content/it.json");
  const P = it.consumerPage, C = it.consumer, AI = it.dl.ai;
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  const recall = ev("sfida-finale")[0];
  const bestBefore = fmtDate(JAR.bestBefore + "T12:00:00Z");
  const recallDate = fmtDate(recall.eventTime);
  const temp = ev("food-freddo")[1].sensorElementList[0].sensorReport[0];

  const partText = p => (p.ai === null ? C.domain : p.ai === "15" ? C.ai15 : AI[p.ai]);
  const parts = jarParts();
  const url = parts.map(p => (p.ai === null ? `<span class="seg dom">${p.value}</span>` : `<span class="sl">${p.query ? "?" : "/"}</span><span class="seg ai">${p.ai}</span><span class="sl">${p.query ? "=" : "/"}</span><span class="seg val">${p.value}</span>`)).join("");

  const story = steps().map(({ key, e }) => {
    const [title, text] = P.steps[key];
    const last = key === "richiamo";
    return `<li class="step ${last ? "alert" : ""}">
      <span class="dot" aria-hidden="true"></span>
      <div class="sc">
        <p class="when"><time datetime="${e.eventTime}">${fmtTime(e.eventTime)}</time></p>
        <h3>${title}</h3>
        <p>${fill(text, { min: num(temp.minValue), max: num(temp.maxValue) })}</p>
        <p class="ev"><code>${e.type} · ${e.bizStep}${e.disposition ? ` · ${e.disposition}` : ""}</code></p>
      </div>
    </li>`;
  }).join("");

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${P.recallTag}: ${P.title}</title>
<meta name="description" content="${P.recallTitle}. ${P.demo}">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Spline+Sans+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
${tokens}
:root { --font-body: "Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif; --font-mono: "Spline Sans Mono", ui-monospace, Consolas, monospace; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--ui-bg); color: var(--ui-ink); font-family: var(--font-body); line-height: 1.5; font-size: 17px; }
main { max-width: 680px; margin: 0 auto; padding: 16px 16px 40px; display: flex; flex-direction: column; gap: 16px; }
h1, h2, h3 { color: var(--gs1-blue); line-height: 1.2; margin: 0; }
h2 { font-size: 1.25em; }
h3 { font-size: 1em; }
p { margin: 0; }
code { font-family: var(--font-mono); font-size: .82em; }
.demo { font-size: .8em; color: var(--ui-muted); text-align: center; background: var(--gs1-white); border: 2px dashed var(--ui-sky); border-radius: 12px; padding: 6px 10px; }
.card { background: var(--gs1-white); border-radius: 22px; padding: 18px; box-shadow: 0 6px 22px var(--ui-mist); display: flex; flex-direction: column; gap: 10px; }
/* Richiamo: in evidenza, prima di tutto il resto */
.recall { background: var(--ui-bad); color: var(--gs1-white); border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 8px 0 var(--gs1-orange-700); }
.recall h1 { color: var(--gs1-white); font-size: 1.55em; }
.recall .tag { align-self: flex-start; background: var(--gs1-white); color: var(--ui-bad); font-weight: 800; text-transform: uppercase; letter-spacing: .08em; font-size: .78em; border-radius: 999px; padding: 4px 12px; display: inline-flex; gap: 6px; align-items: center; }
.recall .tag::before { content: "!"; display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--ui-bad); color: var(--gs1-white); font-size: .9em; }
.recall dl { margin: 4px 0 0; display: grid; grid-template-columns: 1fr; gap: 0; background: var(--gs1-white); color: var(--ui-ink); border-radius: 16px; padding: 12px 14px; }
.recall dt { font-weight: 700; color: var(--gs1-blue); font-size: .8em; text-transform: uppercase; letter-spacing: .04em; }
.recall dt:not(:first-child) { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--gs1-light-gray); }
.recall dd { margin: 0; font-weight: 600; }
.recall .what { background: var(--gs1-white); color: var(--ui-ink); border-radius: 16px; padding: 12px 14px; }
.recall .what h2 { color: var(--ui-bad); font-size: 1.05em; margin-bottom: 6px; }
.recall .what ol { margin: 0; padding-left: 1.3em; display: grid; gap: 4px; font-weight: 600; }
.recall .also { font-weight: 700; }
@media (prefers-reduced-motion: no-preference) {
  .recall { animation: pop .5s cubic-bezier(.2,1.6,.4,1) both; }
  .recall .tag::before { animation: blink 1.4s ease-in-out infinite; }
  @keyframes pop { from { transform: scale(.94); } }
  @keyframes blink { 50% { transform: scale(1.25); } }
}
.product { display: grid; grid-template-columns: 96px 1fr; gap: 14px; align-items: center; }
.jar { width: 96px; height: auto; }
.jar .lid { fill: var(--gs1-orange); }
.jar .cup { fill: var(--gs1-white); stroke: var(--gs1-blue); stroke-width: 4; }
.jar .lbl { fill: var(--gs1-blue); }
.jar .t1 { fill: var(--gs1-white); font: 800 11px var(--font-body); }
.jar .t2 { fill: var(--gs1-orange-300); font: 700 13px var(--font-mono); }
.product dl { margin: 6px 0 0; display: grid; grid-template-columns: 1fr; font-size: .9em; }
.product dt:not(:first-child) { margin-top: 4px; }
.product dt { color: var(--ui-muted); }
.product dd { margin: 0; font-weight: 700; }
.product .maker { font-size: .85em; color: var(--ui-muted); }
/* Storia del lotto: una linea del tempo, un punto per evento */
.story { list-style: none; margin: 0; padding: 0; }
.step { position: relative; display: grid; grid-template-columns: 22px 1fr; gap: 10px; padding-bottom: 14px; }
.step:not(:last-child)::before { content: ""; position: absolute; left: 10px; top: 18px; bottom: 0; width: 3px; background: var(--ui-sky); }
.dot { width: 22px; height: 22px; border-radius: 50%; background: var(--gs1-blue); border: 4px solid var(--gs1-blue-200); margin-top: 2px; }
.step .sc { display: flex; flex-direction: column; gap: 2px; }
.when { font-size: .8em; font-weight: 700; color: var(--gs1-orange-700); text-transform: uppercase; letter-spacing: .04em; }
.ev { color: var(--ui-muted); }
.step.alert .dot { background: var(--ui-bad); border-color: var(--ui-bad-bg); }
.step.alert .sc { background: var(--ui-bad-bg); border-radius: 14px; padding: 8px 10px; }
.step.alert h3, .step.alert .when { color: var(--ui-bad); }
/* GS1 Digital Link scomposto */
.url { font-family: var(--font-mono); font-size: .8em; background: var(--ui-mist); border-radius: 12px; padding: 8px 10px; overflow-wrap: anywhere; line-height: 2; }
.url .seg { border-radius: 6px; padding: 2px 4px; }
.url .dom { background: var(--ui-ok-bg); }
.url .ai { background: var(--gs1-blue); color: var(--gs1-white); }
.url .val { background: var(--ui-sky); }
.url .sl { color: var(--ui-muted); }
.parts { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.parts li { display: grid; grid-template-columns: 64px 1fr; gap: 10px; align-items: start; background: var(--ui-mist); border-radius: 14px; padding: 8px 10px; font-size: .9em; }
.parts .b { font-family: var(--font-mono); font-weight: 700; text-align: center; background: var(--gs1-white); border-radius: 8px; padding: 2px 4px; }
.parts .v { font-family: var(--font-mono); font-weight: 700; }
.btn { display: inline-block; align-self: flex-start; background: var(--gs1-blue); color: var(--gs1-white); text-decoration: none; font-weight: 700; border-radius: 999px; padding: 10px 18px; }
.btn:hover { background: var(--ui-navy-2); }
a:focus-visible { outline: 3px solid var(--gs1-orange); outline-offset: 3px; }
footer { font-size: .8em; color: var(--ui-muted); text-align: center; }
</style>
</head>
<body>
<main>
  <p class="demo">${P.demo}</p>

  <section class="recall" aria-labelledby="recallTitle">
    <span class="tag">${P.recallTag}</span>
    <h1 id="recallTitle">${P.recallTitle}</h1>
    <p>${fill(P.recallText, { date: recallDate })}</p>
    <dl>
      <dt>${P.rows.product}</dt><dd>${C.product}</dd>
      <dt>${P.rows.lot}</dt><dd><strong>${JAR.lot}</strong></dd>
      <dt>${P.rows.bestBefore}</dt><dd>${bestBefore}</dd>
      <dt>${P.rows.reason}</dt><dd>${P.reason}</dd>
      <dt>${P.rows.date}</dt><dd>${recallDate}</dd>
    </dl>
    <div class="what">
      <h2>${P.whatTitle}</h2>
      <ol>${P.what.map(w => `<li>${w}</li>`).join("")}</ol>
    </div>
    <p class="also">${P.alsoL124}</p>
  </section>

  <section class="card" aria-labelledby="productTitle">
    <h2 id="productTitle">${P.productTitle}</h2>
    <div class="product">
      ${JAR_SVG}
      <div>
        <p><strong>${C.product}</strong></p>
        <p class="maker">${P.maker}</p>
        <dl>
          <dt>${P.rows.gtin}</dt><dd><code>${JAR.gtin}</code></dd>
          <dt>${P.rows.lot}</dt><dd><code>${JAR.lot}</code></dd>
          <dt>${P.rows.bestBefore}</dt><dd>${bestBefore}</dd>
        </dl>
      </div>
    </div>
  </section>

  <section class="card" aria-labelledby="storyTitle">
    <h2 id="storyTitle">${P.storyTitle}</h2>
    <p>${P.storySub}</p>
    <ol class="story">${story}</ol>
  </section>

  <section class="card" aria-labelledby="dlTitle">
    <h2 id="dlTitle">${P.dlTitle}</h2>
    <p>${C.linkText}</p>
    <p class="url" aria-label="${jarLink()}">${url}</p>
    <ul class="parts">${parts.map(p => { const [n, d] = partText(p); return `<li><span class="b">${p.ai ? `(${p.ai})` : "www"}</span><div><p><strong>${n}</strong> <span class="v">${p.value}</span></p><p>${d}</p></div></li>`; }).join("")}</ul>
  </section>

  <section class="card" aria-labelledby="gameTitle">
    <h2 id="gameTitle">${P.gameTitle}</h2>
    <p>${P.gameText}</p>
    <a class="btn" href="${PUBLIC_BASE}/">${P.gameLink}</a>
  </section>

  <footer>${P.footer}</footer>
</main>
</body>
</html>
`;
}

/** Scrive la pagina nel percorso del Digital Link, dentro la cartella di build. */
export function writeConsumerPage(outDir = "dist") {
  const file = join(outDir, jarPath().slice(1) + ".html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, consumerPageHtml());
  return file;
}
