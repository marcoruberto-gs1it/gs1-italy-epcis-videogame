// Percorso completo dal titolo al finale, solo con la tastiera, con uno screenshot per ogni schermata.
import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const GAME = pathToFileURL(resolve("dist/index.html")).href;

test("dal titolo al finale con la tastiera", async ({ page }, info) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  const requests = [];
  page.on("request", r => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:")) requests.push(r.url()); });


  // Invio salta le animazioni in corso: per attivare un pulsante aspettiamo che siano finite.
  const idle = () => page.waitForSelector("body:not([data-anim])", { state: "attached" });
  const shot = async name => { await idle(); await page.screenshot({ path: `docs/screenshots/${info.project.name}/${name}.png` }); };
  const press = async key => { if (key === "Enter") await idle(); await page.keyboard.press(key); };
  const pressOn = async sel => { await idle(); await page.locator(sel).press("Enter"); };
  const seeWin = async name => {
    await expect(page.locator(".win")).toBeVisible();
    await idle();
    await page.waitForTimeout(300);
    await shot(name);
  };
  const intro = async name => {
    await press("Enter");
    await expect(page.locator(".narrator")).toBeVisible();
    if (name) { await idle(); await shot(name); }
    await press("Enter");
  };

  await page.goto(GAME + "?render=" + info.project.metadata.render);
  await expect(page.locator("h1")).toHaveText("Missione L123");
  await expect(page.locator(".topbar img.logo")).toBeVisible();
  await shot("01-titolo");

  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await shot("02-mappa");

  // L'intro si apre con titolo, testo del narratore e pulsante già completi e visibili.
  await press("Enter");
  await expect(page.locator(".narrator")).toBeVisible();
  const speech = await page.locator(".speech .txt").textContent();
  expect(speech).toContain("Si comincia dal latte.");
  expect(await page.locator(".intro-card h1 .ch").count()).toBe(0);
  await expect(page.locator("#go")).toBeVisible();
  expect(await page.locator("#screen").evaluate(el => getComputedStyle(el).opacity)).toBe("1");
  await shot("03-intro-1-1");
  await press("Enter");

  // 1-1 Alla stalla nasce il lotto del latte: prima una risposta sbagliata, poi il ricevimento al caseificio
  await shot("04-livello-1-1-stalla");
  await press("1");
  await expect(page.locator("#msg")).toBeVisible();
  await press("2");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4);
  await expect(page.locator("#qa2")).toContainText("ricevimento");
  await page.waitForTimeout(1200);
  await shot("04b-livello-1-1-ricevimento");
  await press("3"); await press("Enter");
  await seeWin("05-evento-1-1");
  await expect(page.locator("#diary")).toContainText("commissioning");
  await expect(page.locator("#diary")).toContainText("8000000000033");

  // Documento completo e Codex
  await press("d");
  await expect(page.locator("#json0")).toContainText("EPCISDocument");
  await shot("06-documento-completo");
  await press("d");
  await press("g");
  await expect(page.locator(".card:not(.locked)")).toHaveCount(2);
  await shot("07-codex");
  await press("Escape");
  await expect(page.locator(".map")).toBeVisible();

  // 1-2 Dal latte allo yogurt: prima un ingrediente sbagliato
  await intro();
  await press("2");
  await expect(page.locator("#msg")).toBeVisible();
  await press("1"); await press("3");
  await expect(page.locator("#opts .opt")).toHaveCount(4);
  await shot("07c-livello-1-2-vasca");
  await press("3"); await press("Enter");
  await seeWin("07d-evento-1-2");

  // 1-3 Nasce il vasetto
  await intro();
  await page.waitForTimeout(1500);
  await shot("07b-livello-1-3-vasetto");
  for (const [r, j] of [[0, 0], [1, 1], [2, 2], [3, 1]]) await pressOn(`.chip[data-r="${r}"][data-j="${j}"]`);
  await pressOn("#reg");
  await seeWin("08-evento-1-3");

  // 1-4 Vista ai raggi X: 12 cartoni da impilare
  await intro();
  for (let i = 0; i < 12; i++) await press("Enter");
  await expect(page.locator("#cnt")).toContainText("12/12");
  await press("4"); await press("Enter");
  await expect(page.locator("#pallet.xray")).toHaveCount(1);
  await page.waitForTimeout(1200);
  await shot("09-livello-1-4-raggi-x");
  await press("Enter");
  await seeWin("10-evento-1-4");

  // 1-5 Le parole non si inventano, poi l'avviso di spedizione collegato all'evento
  await intro();
  await press("1");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4);
  await expect(page.locator("#qa2")).toContainText("avviso di spedizione");
  await shot("11b-livello-1-5-avviso-spedizione");
  await press("3"); await press("Enter");
  await seeWin("11-evento-1-5");

  // 1-6 Catena del freddo
  await intro();
  await press("2"); await press("Enter");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4, { timeout: 15_000 });
  await shot("12-livello-1-6");
  await press("4"); await press("Enter");
  await seeWin("13-evento-1-6");

  // 1-7 Ops, errore!
  await intro();
  await press("3"); await press("Enter");
  await seeWin("14-evento-1-7");

  // 1-8 Ritiro e richiamo
  await intro("20-intro-ritiro-richiamo");
  await press("Enter");
  await expect(page.locator("#new")).toBeVisible({ timeout: 20_000 });
  await press("Enter");
  await press("2");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4, { timeout: 10_000 });
  await press("1");
  await expect(page.locator("#block")).toBeVisible({ timeout: 10_000 });
  await press("Enter");
  await expect(page.locator("#reg")).toBeVisible({ timeout: 10_000 });
  await shot("21-ritiro-richiamo-seconda-prova");
  // Su desktop le ricerche nell'archivio stanno su una riga, intere: niente a capo e niente scorrimento.
  if (info.project.name !== "mobile") {
    for (const w of [1920, 1280]) {
      await page.setViewportSize({ width: w, height: 1080 });
      await page.waitForTimeout(200);
      const req = page.locator("#out2 .req");
      await expect(req).toContainText("MATCH_anyEPCClass=https://id.gs1.org/01/08000000001016/10/L123");
      const m = await req.evaluate(e => ({ sw: e.scrollWidth, cw: e.clientWidth, h: e.clientHeight, lh: parseFloat(getComputedStyle(e).lineHeight) }));
      expect(m.sw, `larghezza ${w}`).toBeLessThanOrEqual(m.cw + 1);
      expect(m.h, `larghezza ${w}: due ricerche, due righe`).toBeLessThan(m.lh * 3 + 24);
      await req.screenshot({ path: `docs/screenshots/${info.project.name}/21b-ricerche-${w}.png` });
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
  }
  await press("Enter");
  await seeWin("22-evento-ritiro-richiamo");

  await press("Enter");
  await expect(page.locator(".final h1")).toHaveText("Missione compiuta");
  await expect(page.locator(".pcell.on")).toHaveCount(8);
  await shot("23-finale");
  await page.locator(".benefits").scrollIntoViewIfNeeded();
  await shot("24-finale-vantaggi");
  await page.emulateMedia({ media: "print" });
  await shot("25-promemoria-stampa");

  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});
