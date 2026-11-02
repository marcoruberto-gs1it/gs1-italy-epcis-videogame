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

  await page.goto(GAME);
  await expect(page.locator("h1")).toHaveText("MISSIONE L123");
  await expect(page.locator(".title img.logo")).toBeVisible();
  await shot("01-titolo");

  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await shot("02-mappa");

  // Invio durante l'intro animata la porta alla fine senza cambiare schermata.
  await press("Enter");
  await expect(page.locator(".narrator")).toBeVisible();
  if (info.project.name === "desktop") {
    // Con le animazioni attive, Invio porta l'intro alla fine e resta sulla stessa schermata.
    await page.keyboard.press("Enter");
    await idle();
    await expect(page.locator("#go")).toBeVisible();
  }
  await expect(page.locator(".speech .txt")).toContainText("Si comincia dal latte.");
  await shot("03-intro-1-1");
  // Il tasto C spegne e riaccende l'effetto CRT.
  // Con prefers-reduced-motion il CRT resta sempre spento.
  if (info.project.name === "desktop") {
    await expect(page.locator("#bezel.crt")).toHaveCount(1);
    await page.keyboard.press("c");
    await expect(page.locator("#bezel.crt")).toHaveCount(0);
    await page.keyboard.press("c");
  } else await expect(page.locator("#bezel.crt")).toHaveCount(0);
  await press("Enter");

  // 1-1 Dal latte allo yogurt: prima un ingrediente sbagliato
  await press("2");
  await expect(page.locator("#msg")).toBeVisible();
  await press("1"); await press("3");
  await expect(page.locator("#opts .opt")).toHaveCount(3);
  await shot("04-livello-1-1");
  await press("2"); await press("Enter");
  await seeWin("05-evento-1-1");

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

  // 1-2 Nasce il vasetto
  await intro();
  for (const [r, j] of [[0, 1], [1, 2], [2, 0], [3, 1]]) await pressOn(`.chip[data-r="${r}"][data-j="${j}"]`);
  await pressOn("#reg");
  await seeWin("08-evento-1-2");

  // 1-3 Vista ai raggi X: 12 cartoni da impilare
  await intro();
  for (let i = 0; i < 12; i++) await press("Enter");
  await expect(page.locator("#cnt")).toContainText("12/12");
  await press("2"); await press("Enter");
  await expect(page.locator("#pallet.xray")).toBeVisible();
  await page.waitForTimeout(1200);
  await shot("09-livello-1-3-raggi-x");
  await press("Enter");
  await seeWin("10-evento-1-3");

  // 1-4 Le parole non si inventano
  await intro();
  await press("3"); await press("Enter");
  await seeWin("11-evento-1-4");

  // 1-5 Catena del freddo
  await intro();
  await press("1"); await press("Enter");
  await expect(page.locator("#opts2 .opt")).toHaveCount(3, { timeout: 15_000 });
  await shot("12-livello-1-5");
  await press("2"); await press("Enter");
  await seeWin("13-evento-1-5");

  // 1-6 Ops, errore!
  await intro();
  await press("2"); await press("Enter");
  await seeWin("14-evento-1-6");

  // 2-1 Dal filo al capo
  await intro("15-intro-2-1");
  await press("2"); await press("1"); await press("3");
  await shot("16-livello-2-1");
  await press("Enter");
  await seeWin("17-evento-2-1");

  // 2-2 Inventario lampo
  await intro();
  await press("Enter"); await press("Enter");
  await expect(page.locator("#opts .opt")).toHaveCount(3, { timeout: 15_000 });
  await press("2"); await press("Enter");
  await seeWin("18-evento-2-2");

  // 2-3 Il reso sospetto
  await intro();
  await press("8"); await press("9");
  await press("1"); await press("Enter");
  await seeWin("19-evento-2-3");

  // Sfida finale
  await intro("20-intro-sfida-finale");
  await press("Enter");
  await expect(page.locator("#new")).toBeVisible({ timeout: 20_000 });
  await press("Enter");
  await press("1");
  await expect(page.locator("#opts2 .opt")).toHaveCount(4, { timeout: 10_000 });
  await press("3");
  await expect(page.locator("#block")).toBeVisible({ timeout: 10_000 });
  await press("Enter");
  await expect(page.locator("#reg")).toBeVisible({ timeout: 10_000 });
  await shot("21-sfida-finale-round-2");
  await press("Enter");
  await seeWin("22-evento-sfida-finale");

  await press("Enter");
  await expect(page.locator(".final h1")).toHaveText("MISSIONE COMPIUTA");
  await expect(page.locator(".pcell.on")).toHaveCount(10);
  await shot("23-finale");
  await page.locator(".benefits").scrollIntoViewIfNeeded();
  await shot("24-finale-vantaggi");
  await page.emulateMedia({ media: "print" });
  await shot("25-promemoria-stampa");

  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});
