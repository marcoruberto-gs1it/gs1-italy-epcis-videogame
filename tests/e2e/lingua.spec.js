// Scelta della lingua in alto a destra: italiano e inglese, anche per la pagina del vasetto.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const GAME = pathToFileURL(resolve("dist/index.html")).href + "?render=2d";
const JAR = pathToFileURL(resolve("dist/01/08000000001016/10/L123.html")).href;

async function audit(page, name) {
  await page.waitForSelector("body:not([data-anim])", { state: "attached" });
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const bad = r.violations.filter(v => v.impact === "serious" || v.impact === "critical");
  expect(bad.map(v => `${name} · ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`)).toEqual([]);
}

test("IT · EN: il gioco cambia lingua e la ricorda", async ({ page }, info) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(GAME);
  await expect(page.locator("h1")).toHaveText("Missione L123");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator('#hud .lang-btn[data-lang="it"]')).toHaveAttribute("aria-pressed", "true");

  await page.locator('#hud .lang-btn[data-lang="en"]').click();
  await expect(page.locator("h1")).toHaveText("Mission L123");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Mission L123");
  await expect(page.locator('#hud .lang-btn[data-lang="en"]')).toHaveAttribute("aria-pressed", "true");
  await audit(page, "title (en)");
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/40-en-title.png` });

  // Mappa e prima tappa in inglese.
  await page.keyboard.press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await expect(page.locator("#navMap")).toContainText("Map");
  await expect(page.locator(".stop").first()).toContainText("Stage 1-1");
  await audit(page, "map (en)");
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/41-en-map.png` });
  await page.locator(".stop").first().click();
  await page.locator("#go").click();
  await expect(page.locator("#opts .opt")).toHaveCount(4);
  await expect(page.locator("#body")).toContainText("lot");
  await audit(page, "stage 1-1 (en)");
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/42-en-stage-1-1.png` });

  // Archivio degli eventi in inglese; il JSON resta quello di EPCIS.
  await page.keyboard.press("e");
  await expect(page.locator("#archTitle")).not.toHaveText("Tutti gli eventi della filiera");
  await expect(page.locator("#archive pre.json").first()).toContainText("commissioning");
  await page.keyboard.press("Escape");

  // La scelta resta: ricaricando, il gioco è ancora in inglese.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // La pagina del vasetto segue la lingua del gioco (stesso sito, stessa scelta).
  await page.goto(JAR + "?15=261130");
  await expect(page.locator('main[lang="en"]')).toBeVisible();
  await expect(page.locator('main[lang="it"]')).toBeHidden();
  await expect(page.locator('main[lang="en"] .recall h1')).toHaveText("Do not eat yogurt from this lot");
  await audit(page, "jar page (en)");
  await page.screenshot({ path: `docs/screenshots/${info.project.name}/43-en-jar-page.png`, fullPage: true });
  await page.locator('main[lang="en"] button[data-lang="it"]').click();
  await expect(page.locator('main[lang="it"]')).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");

  // E il gioco torna in italiano (riparte dalla mappa, dove la partita è salvata).
  await page.goto(GAME);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator("#navMap")).toContainText("Mappa");
  expect(errors).toEqual([]);
});
