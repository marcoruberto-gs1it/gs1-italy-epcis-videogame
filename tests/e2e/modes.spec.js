// Modalità sala (note per chi presenta, sfida a squadre), modalità individuale (suggerimenti), comandi (?).
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
  await expect(page.locator("#opts .opt")).toHaveCount(3);
}

test("modalità sala: note con P e punti alla squadra con A e B", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await expect(page.locator("#mSala.on")).toBeVisible();
  await press("3");
  await expect(page.locator("#mTeams")).toContainText("sì");
  await toQuestion1(press, page);

  await press("p");
  await expect(page.locator("#notes")).toBeVisible();
  await expect(page.locator("#notes")).toContainText("cisterna di latte");
  await expect(page.locator("#notes")).toContainText("Grafica");
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/30-note-per-chi-presenta.png" });
  await press("p");
  await expect(page.locator("#notes")).toBeHidden();

  // La squadra Orange sbaglia: nessun punto. La squadra Blue risponde giusto: un punto.
  await press("b");
  await expect(page.locator(".team-B.turn")).toBeVisible();
  await press("1");
  await expect(page.locator(".team-B")).toContainText("Orange 0");
  await expect(page.locator(".team.turn")).toHaveCount(0);
  await press("a");
  await press("2");
  await expect(page.locator(".team-A")).toContainText("Blue 1");
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/31-squadre.png" });
  expect(errors).toEqual([]);
});

test("modalità individuale: niente note, suggerimento con H", async ({ page }) => {
  const { errors, press, idle } = await start(page);
  await press("2");
  await expect(page.locator("#mSolo.on")).toBeVisible();
  await expect(page.locator("#mTeams")).toHaveCount(0);
  await toQuestion1(press, page);
  await press("p");
  await expect(page.locator("#notes")).toBeHidden();
  await expect(page.locator("#hint")).toBeHidden();
  await press("h");
  await expect(page.locator("#hint")).toBeVisible();
  await expect(page.locator("#hint")).toContainText("diventa yogurt");
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
  await expect(page.locator(".help tr")).toHaveCount(12);
  await idle(); await page.screenshot({ path: "docs/screenshots/desktop-3d/33-comandi.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".help")).toHaveCount(0);
  await expect(page.locator(".map")).toBeVisible();
  expect(errors).toEqual([]);
});
