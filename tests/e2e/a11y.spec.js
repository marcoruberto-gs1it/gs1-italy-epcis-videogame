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
    await press("1"); await press("3");
    await expect(page.locator("#opts .opt")).toHaveCount(4);
    await audit(page, "livello");
    await press("3"); await press("Enter");
    await expect(page.locator(".win")).toBeVisible();
    await audit(page, "evento registrato");
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
    const ids = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "finale"];
    localStorage.setItem("missione-l123", JSON.stringify({ v: 3, state: {
      score: 2400, lives: 3, done: Object.fromEntries(ids.map(i => [i, true])), powers: ids, muted: true, crt: true, view: "final"
    } }));
  });
  await page.goto(GAME + "?render=2d");
  await expect(page.locator(".final h1")).toBeVisible();
  await audit(page, "finale");
});
