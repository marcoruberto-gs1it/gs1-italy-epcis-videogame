// Gioco individuale: suggerimento con H, navigazione Home e Mappa, comandi (?).
import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const GAME = pathToFileURL(resolve("dist/index.html")).href + "?render=2d";

async function start(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(GAME);
  const idle = () => page.waitForSelector("body:not([data-anim])", { state: "attached" });
  const press = async key => { if (key === "Enter") await idle(); await page.keyboard.press(key); };
  return { errors, idle, press };
}

// Dal titolo alla prima domanda della tappa 1-1, la stalla.
async function toQuestion1(press, page) {
  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await press("Enter"); await press("Enter");
  await expect(page.locator("#opts .opt")).toHaveCount(4);
}

test("solo modalità individuale: niente scelta della modalità, suggerimento con H", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await expect(page.locator("#mSala, #mSolo, #mTeams, #notes")).toHaveCount(0);
  await toQuestion1(press, page);
  await expect(page.locator("#hint")).toBeHidden();
  await press("h");
  await expect(page.locator("#hint")).toBeVisible();
  await expect(page.locator("#hint")).toContainText("dove nasce il latte");
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/32-suggerimento.png" });
  await press("h");
  await expect(page.locator("#hint")).toBeHidden();
  expect(errors).toEqual([]);
});

test("il tasto ? mostra i comandi e Esc li chiude senza cambiare schermata", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await page.keyboard.press("?");
  await expect(page.locator(".help")).toBeVisible();
  await expect(page.locator(".help tr")).toHaveCount(11);
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/33-comandi.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".help")).toHaveCount(0);
  // Anche il pulsante «Chiudi» in alto a destra chiude i comandi.
  await page.keyboard.press("?");
  await page.locator("#helpClose").click();
  await expect(page.locator(".help")).toHaveCount(0);
  await expect(page.locator(".map")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Inizio, Mappa e logo nella barra in alto, tappe cliccabili nella barra della filiera", async ({ page }) => {
  const { errors, press } = await start(page);
  // «Sei qui»: la voce della schermata in cui ti trovi è accesa, e una sola alla volta.
  const current = page.locator("#hud .mainnav [aria-current=page]");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("id", "navHome");
  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await expect(current).toHaveAttribute("id", "navMap");
  await page.keyboard.press("e");
  await expect(page.locator("#archive")).toBeVisible();
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("id", "archBtn");
  // «Mappa» dall'archivio aperto sopra la mappa: si chiude l'archivio e si accende di nuovo Mappa.
  await page.locator("#navMap").click();
  await expect(page.locator("#archive")).toHaveCount(0);
  await expect(current).toHaveAttribute("id", "navMap");
  await page.locator("#navHome").click();
  await expect(page.locator("h1")).toHaveText("Missione L123");
  await toQuestion1(press, page);
  // Durante una tappa nessuna voce è accesa: la tappa si legge nella barra della filiera.
  await expect(current).toHaveCount(0);
  await expect(page.locator(".fbar .cn-stop.here")).toContainText("Stalla");
  await page.locator(".fbar .cn-arrow").last().click();
  await expect(page.locator(".fbar .cn-stop.here")).toContainText("Vasca");
  await page.locator("#navMap").click();
  await expect(page.locator(".map")).toBeVisible();
  await page.locator("#navHome").click();
  await expect(page.locator("h1")).toHaveText("Missione L123");
  // Anche il logo in alto a sinistra riporta all'inizio.
  await page.keyboard.press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await page.locator("#brandHome").click();
  await expect(page.locator("h1")).toHaveText("Missione L123");
  await expect(page.locator("link[rel=icon]")).toHaveAttribute("href", /^data:image\/png;base64,/);
  expect(errors).toEqual([]);
});

test("«Ricomincia da zero» sta in alto a destra e chiede conferma prima di azzerare", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await toQuestion1(press, page);
  await press("2");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4);
  await press("3"); await press("Enter");
  await expect(page.locator(".win")).toBeVisible();
  await expect(page.locator(".map #reset")).toHaveCount(0);
  const reset = page.locator(".topbar .tools #resetBtn");
  await expect(reset).toContainText("Ricomincia da zero");
  // Primo clic: chiede conferma, non azzera.
  await reset.click();
  await expect(reset).toContainText("Sicuro?");
  await expect(page.locator(".win")).toBeVisible();
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/37-ricomincia-conferma.png" });
  // Secondo clic: partita azzerata, si torna all'inizio.
  await reset.click();
  await expect(page.locator("h1")).toHaveText("Missione L123");
  await expect(page.locator("#hud .steps i.on")).toHaveCount(0);
  await expect(reset).toContainText("Ricomincia da zero");
  expect(errors).toEqual([]);
});

test("archivio degli eventi a metà tappa: tutte le tappe aperte, lente sul Digital Link, si torna alla domanda", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await toQuestion1(press, page);
  await page.keyboard.press("e");
  const arch = page.locator("#archive");
  await expect(arch).toBeVisible();
  // È una pagina, non una finestra sovrapposta: la schermata di gioco è sospesa e nascosta.
  await expect(arch).not.toHaveAttribute("role", "dialog");
  await expect(page.locator("#screen")).toBeHidden();
  await expect(arch.locator(".tab")).toHaveCount(9);
  // Tutta la filiera: tutti gli eventi, dalla stalla (nascita del lotto di latte) al richiamo.
  await arch.locator("#archTab-all").click();
  await expect(arch.locator("#archPanel h3")).toContainText("Tutta la filiera");
  // Mappa della filiera: otto tappe, ogni evento è un riquadro cliccabile che mostra il suo testo.
  await expect(arch.locator(".fstage")).toHaveCount(8);
  const nodes = arch.locator(".fnode");
  const n = await nodes.count();
  expect(n).toBeGreaterThan(10);
  const cap = arch.locator("#flowDetail .page .cap"), json = arch.locator("#flowDetail pre.json");
  await expect(nodes.first()).toHaveAttribute("aria-pressed", "true");
  await expect(cap).toContainText("1-1");
  await expect(json).toContainText("commissioning");
  await nodes.last().click();
  await expect(nodes.last()).toHaveAttribute("aria-pressed", "true");
  await expect(nodes.first()).toHaveAttribute("aria-pressed", "false");
  await expect(cap).toContainText("1-8");
  await expect(json).toContainText("recalled");
  // Frecce della tastiera ed «Evento precedente»: si scorre lungo la filiera.
  await page.keyboard.press("ArrowLeft");
  await expect(nodes.nth(n - 2)).toHaveAttribute("aria-pressed", "true");
  await expect(nodes.nth(n - 2)).toBeFocused();
  await arch.locator("#flowPrev").click();
  await expect(nodes.nth(n - 3)).toHaveAttribute("aria-pressed", "true");
  await arch.locator(".fnode.TransformationEvent").first().click();
  await expect(json).toContainText("TransformationEvent");
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/36-archivio-tutta-la-filiera.png", fullPage: true });
  await arch.locator("#archTab-1-1").click();
  await expect(arch.locator(".tab[aria-selected=true]")).toContainText("1-1");
  // I termini del GS1 Web Vocabulary portano alla loro definizione ufficiale.
  const voc = arch.locator('#archPanel a.voc', { hasText: "gs1:productionDate" });
  await expect(voc).toHaveAttribute("href", "https://ref.gs1.org/voc/productionDate");
  await expect(voc).toHaveAttribute("target", "_blank");
  await expect(arch.locator('#archPanel a.voc', { hasText: "gs1:countryCode" })).toHaveAttribute("href", "https://ref.gs1.org/voc/countryCode");
  await expect(arch.locator(".tab[aria-selected=true]")).toContainText("1-1");
  // Anche le tappe non ancora giocate sono consultabili.
  await arch.locator(".tab").nth(3).click();
  await expect(arch.locator(".tab[aria-selected=true]")).toContainText("1-4");
  await expect(arch.locator("#archPanel pre.json").first()).toContainText("AggregationEvent");
  await arch.locator("#archDoc").click();
  await expect(arch.locator("#archPanel pre.json")).toContainText("EPCISDocument");
  // Anche a 1280 px il documento si legge intero: nessuna riga tagliata.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);
  const pre = arch.locator("#archPanel pre.json");
  const m = await pre.evaluate(e => ({ sw: e.scrollWidth, cw: e.clientWidth }));
  expect(m.sw).toBeLessThanOrEqual(m.cw + 1);
  await page.setViewportSize({ width: 1920, height: 1080 });
  // Lente: il link del lotto si scompone in (01) GTIN e (10) lotto.
  await arch.locator('button.dl[data-dl$="/10/L123"]').first().click();
  const lens = page.locator("#lens");
  await expect(lens).toBeVisible();
  await expect(lens.locator(".dl-parts .badge")).toHaveText(["id.gs1.org", "(01)", "(10)"]);
  await expect(lens).toContainText("Lotto");
  await expect(lens).toContainText("cifra di controllo");
  // L'indirizzo scomposto resta su una sola riga.
  const url = lens.locator(".dl-url");
  const box = await url.boundingBox();
  const lineH = await url.evaluate(e => parseFloat(getComputedStyle(e).lineHeight));
  expect(box.height).toBeLessThan(lineH * 2);
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/34-lente-digital-link.png" });
  // Si chiude con «Chiudi» in alto a destra (o con Esc).
  const close = lens.locator("#lensClose");
  const cb = await close.boundingBox(), lb = await lens.locator(".box").boundingBox();
  expect(cb.y - lb.y).toBeLessThan(40);
  expect(lb.x + lb.width - (cb.x + cb.width)).toBeLessThan(40);
  await close.click();
  await expect(lens).toHaveCount(0);
  await expect(arch).toBeVisible();
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/35-archivio-eventi.png" });
  await page.keyboard.press("Escape");
  await expect(arch).toHaveCount(0);
  // La domanda è ancora lì, con le stesse opzioni.
  await expect(page.locator("#opts .opt")).toHaveCount(4);
  await page.locator("#archBtn").click();
  await expect(arch).toBeVisible();
  await arch.locator("#archClose").click();
  await expect(arch).toHaveCount(0);
  // Anche Mappa chiude l'archivio e porta alla mappa.
  await page.keyboard.press("e");
  await page.locator("#navMap").click();
  await expect(arch).toHaveCount(0);
  await expect(page.locator(".map")).toBeVisible();
  expect(errors).toEqual([]);
});
