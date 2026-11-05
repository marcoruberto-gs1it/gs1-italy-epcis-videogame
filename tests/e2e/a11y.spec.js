// Accessibilità (WCAG 2 A e AA) con axe-core sulle schermate principali, in 3D e in 2D.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const GAME = pathToFileURL(resolve("dist/index.html")).href;

async function audit(page, name) {
  await page.waitForSelector("body:not([data-anim])", { state: "attached" });
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const bad = r.violations.filter(v => v.impact === "serious" || v.impact === "critical");
  const report = bad.map(v => `${name} · ${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`);
  expect(report, report.join("\n")).toEqual([]);
}

for (const render of ["3d", "2d"]) {
  test(`schermate di gioco accessibili (${render})`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(GAME + "?render=" + render);
    const idle = () => page.waitForSelector("body:not([data-anim])", { state: "attached" });
    const press = async k => { if (k === "Enter") await idle(); await page.keyboard.press(k); };

    await audit(page, "titolo");
    await press("Enter");
    await audit(page, "mappa");
    await press("Enter");
    await audit(page, "intro");
    await press("Enter");
    // Tappa 1-1, la stalla: due domande, poi l'evento.
    await press("2");
    await expect(page.locator("#opts2 .opt")).toHaveCount(4);
    await audit(page, "livello");
    await press("3"); await press("Enter");
    await expect(page.locator(".win")).toBeVisible();
    await audit(page, "evento registrato");
    await page.locator('#diary button.dl').first().click();
    await audit(page, "lente digital link");
    await page.keyboard.press("Escape");
    await press("e");
    await audit(page, "archivio eventi");
    await page.keyboard.press("Escape");
    await press("g");
    await audit(page, "codex");
    await page.keyboard.press("?");
    await audit(page, "comandi");
    expect(errors).toEqual([]);
  });
}

test("finale accessibile", async ({ page }) => {
  // Partita già completata: il gioco riparte dal finale.
  await page.addInitScript(() => {
    const ids = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "finale"];
    localStorage.setItem("missione-l123", JSON.stringify({ v: 4, state: {
      score: 2400, lives: 3, done: Object.fromEntries(ids.map(i => [i, true])), powers: ids, muted: true, crt: true, view: "final"
    } }));
  });
  await page.goto(GAME + "?render=2d");
  await expect(page.locator(".final h1")).toBeVisible();
  await audit(page, "finale");
});

test("QR code del vasetto e pagina prodotto accessibili", async ({ page }) => {
  await page.addInitScript(() => {
    const ids = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "finale"];
    localStorage.setItem("missione-l123", JSON.stringify({ v: 4, state: {
      score: 2400, lives: 3, done: Object.fromEntries(ids.map(i => [i, true])), powers: ids, muted: true, crt: true, view: "consumer"
    } }));
  });
  await page.goto(GAME + "?render=2d");
  await expect(page.locator(".consumer .qr")).toBeVisible();
  await audit(page, "qr code del vasetto");
  // La pagina che si apre inquadrando il QR code: richiamo per primo, poi prodotto e storia del lotto.
  await page.goto(pathToFileURL(resolve("dist/01/08000000001016/10/L123.html")).href + "?15=261130");
  await expect(page.locator(".recall h1")).toHaveText("Non mangiare lo yogurt di questo lotto");
  await expect(page.locator(".recall")).toContainText("30 novembre 2026");
  await expect(page.locator(".story .step")).toHaveCount(9);
  await expect(page.locator(".story .step.alert")).toContainText("recalled");
  await page.screenshot({ path: `docs/screenshots/${test.info().project.name}/38-pagina-vasetto.png`, fullPage: true });
  await audit(page, "pagina del vasetto");
});
