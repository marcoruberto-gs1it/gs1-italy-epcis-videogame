// Renderer 3D: colore di brand esatto, ritorno automatico al 2D, cambio al volo con R, nessuna perdita di memoria.
import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const GAME = pathToFileURL(resolve("dist/index.html")).href;

async function start(page, query = "?render=3d") {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(GAME + query);
  const idle = () => page.waitForSelector("body:not([data-anim])", { state: "attached" });
  const press = async key => { if (key === "Enter") await idle(); await page.keyboard.press(key); };
  const openLevel = async id => {
    await page.evaluate(id => document.querySelector(`.stop[data-lv="${id}"]`).click(), id);
    await press("Enter");
    await expect(page.locator("#scene")).toBeVisible();
  };
  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await idle();
  return { errors, idle, press, openLevel };
}

test("il GS1 Blue in 3D resta #002C6C su una superficie in piena luce", async ({ page }) => {
  const { errors } = await start(page);
  expect(await page.evaluate(() => window.missioneL123.mode())).toBe("3d");
  await expect(page.locator("#diorama.r3d")).toBeVisible();
  const p = await page.evaluate(() => window.missioneL123.probe());
  const [r, g, b] = await page.evaluate(({ x, y }) => window.missioneL123.sample(x, y), p);
  const want = [0x00, 0x2c, 0x6c];
  for (const [i, v] of [r, g, b].entries()) expect(Math.abs(v - want[i]), `canale ${i}: ${[r, g, b]}`).toBeLessThanOrEqual(3);
  expect(errors).toEqual([]);
});

test("se il contesto WebGL si perde a metà livello il gioco continua in 2D", async ({ page }) => {
  const { errors, press, openLevel } = await start(page);
  await openLevel("1-3");
  await expect(page.locator("#scene.r3d")).toBeVisible();
  for (let i = 0; i < 5; i++) await press("Enter");
  expect(await page.evaluate(() => window.missioneL123.loseContext())).toBe(true);
  await expect(page.locator("#scene.r3d")).toHaveCount(0);
  expect(await page.evaluate(() => window.missioneL123.mode())).toBe("2d");
  await expect(page.locator(".toast")).toBeVisible();
  // Lo stato del livello è intatto: 5 cartoni già impilati, si prosegue fino all'evento registrato.
  await expect(page.locator("#cnt")).toContainText("5/12");
  for (let i = 0; i < 7; i++) await press("Enter");
  await press("1"); await press("Enter"); await press("Enter");
  await expect(page.locator(".win")).toBeVisible();
  expect(errors).toEqual([]);
});

test("il tasto R passa da 3D a 2D e ritorno senza perdere il punto", async ({ page }) => {
  const { errors, press, openLevel } = await start(page);
  await openLevel("1-3");
  for (let i = 0; i < 3; i++) await press("Enter");
  await press("r");
  await expect(page.locator("#scene.r3d")).toHaveCount(0);
  await expect(page.locator(".scene .carton:not([hidden])")).toHaveCount(3);
  await press("r");
  await expect(page.locator("#scene.r3d")).toHaveCount(1);
  expect(await page.evaluate(() => window.missioneL123.mode())).toBe("3d");
  await expect(page.locator("#cnt")).toContainText("3/12");
  expect(errors).toEqual([]);
});

test("nessuna perdita di memoria dopo tre giri di tutte le scene", async ({ page }) => {
  const { errors, openLevel } = await start(page);
  const ids = await page.$$eval(".stop", els => els.map(e => e.dataset.lv));
  const round = async () => {
    for (const id of ids) { await openLevel(id); await page.keyboard.press("Escape"); await expect(page.locator(".map")).toBeVisible(); }
    // Misura a scena ferma, sempre nello stesso stato (mappa con il diorama già disegnato).
    await page.waitForTimeout(1500);
    return page.evaluate(() => window.missioneL123.memory());
  };
  const first = await round();
  const second = await round();
  const third = await round();
  console.log("memoria per giro:", JSON.stringify([first, second, third]));
  expect(third.geometries).toBe(first.geometries);
  expect(third.textures).toBe(first.textures);
  expect(errors).toEqual([]);
});

test("prestazioni: meno di 150 draw call e 100.000 triangoli per scena, pixel ratio limitato", async ({ page }) => {
  const { errors, press, openLevel } = await start(page);
  const ids = await page.$$eval(".stop", els => els.map(e => e.dataset.lv));
  const report = [];
  const check = async label => {
    const st = await page.evaluate(() => window.missioneL123.stats());
    report.push(`${label}: ${st.calls} draw call, ${st.triangles} triangoli`);
    expect(st.calls, label).toBeLessThan(150);
    expect(st.triangles, label).toBeLessThan(100_000);
    expect(st.pixelRatio, label).toBeLessThanOrEqual(st.quality === "alta" ? 2 : 1.5);
  };
  await check("mappa");
  for (const id of ids) { await openLevel(id); await check("livello " + id); await page.keyboard.press("Escape"); await expect(page.locator(".map")).toBeVisible(); }
  // Il momento più pesante: raggi X con 12 cartoni e 288 vasetti visibili.
  await openLevel("1-3");
  for (let i = 0; i < 12; i++) await press("Enter");
  await press("1"); await press("Enter");
  await expect(page.locator("#pallet.xray")).toHaveCount(1);
  await check("raggi X");
  console.log(report.join(" | "));
  expect(errors).toEqual([]);
});
