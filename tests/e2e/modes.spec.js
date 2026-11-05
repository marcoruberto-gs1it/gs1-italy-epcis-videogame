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

// Dal titolo al livello 1-1 con la vasca già piena (latte e fermenti).
async function toQuestion1(press, page) {
  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await press("Enter"); await press("Enter");
  await press("1"); await press("3");
  await expect(page.locator("#opts .opt")).toHaveCount(4);
}

test("solo modalità individuale: niente scelta della modalità, suggerimento con H", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await expect(page.locator("#mSala, #mSolo, #mTeams, #notes")).toHaveCount(0);
  await toQuestion1(press, page);
  await expect(page.locator("#hint")).toBeHidden();
  await press("h");
  await expect(page.locator("#hint")).toBeVisible();
  await expect(page.locator("#hint")).toContainText("consumato");
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
  await expect(page.locator("#navHome")).toHaveCount(0);
  await toQuestion1(press, page);
  await expect(page.locator(".fbar .cn-stop.here")).toContainText("Vasca");
  await page.locator(".fbar .cn-arrow").last().click();
  await expect(page.locator(".fbar .cn-stop.here")).toContainText("Controllo qualità");
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

test("archivio degli eventi a metà tappa: tutte le tappe aperte, lente sul Digital Link, si torna alla domanda", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await toQuestion1(press, page);
  await page.keyboard.press("e");
  const arch = page.locator("#archive");
  await expect(arch).toBeVisible();
  // È una pagina, non una finestra sovrapposta: la schermata di gioco è sospesa e nascosta.
  await expect(arch).not.toHaveAttribute("role", "dialog");
  await expect(page.locator("#screen")).toBeHidden();
  await expect(arch.locator(".tab")).toHaveCount(7);
  await expect(arch.locator(".tab[aria-selected=true]")).toContainText("1-1");
  // Anche le tappe non ancora giocate sono consultabili.
  await arch.locator(".tab").nth(2).click();
  await expect(arch.locator(".tab[aria-selected=true]")).toContainText("1-3");
  await expect(arch.locator("#archPanel pre.json").first()).toContainText("AggregationEvent");
  await arch.locator("#archDoc").click();
  await expect(arch.locator("#archPanel pre.json")).toContainText("EPCISDocument");
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
