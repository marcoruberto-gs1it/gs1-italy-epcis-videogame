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
  await expect(page.locator(".help tr")).toHaveCount(10);
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/33-comandi.png" });
  await page.keyboard.press("Escape");
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
