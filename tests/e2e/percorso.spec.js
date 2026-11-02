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

  const shot = name => page.screenshot({ path: `docs/screenshots/${info.project.name}/${name}.png` });
  const press = key => page.keyboard.press(key);
  const pressOn = sel => page.locator(sel).press("Enter");
  const seeWin = async name => {
    await expect(page.locator("#json")).toBeVisible();
    await page.waitForTimeout(1600);
    await shot(name);
  };

  await page.goto(GAME);
  await expect(page.locator("h1")).toHaveText("MISSIONE L123");
  await shot("01-titolo");

  await press("Enter");
  await expect(page.locator(".map")).toBeVisible();
  await shot("02-mappa");

  // 1-1 Nasce il vasetto
  await press("Enter");
  await shot("03-intro-1-1");
  await press("Enter");
  for (const [r, j] of [[0, 1], [1, 2], [2, 0], [3, 1]]) await pressOn(`.chip[data-r="${r}"][data-j="${j}"]`);
  await shot("04-livello-1-1");
  await pressOn("#reg");
  await seeWin("05-evento-1-1");

  // 1-2 Vista ai raggi X
  await press("Enter"); await press("Enter");
  await press("2");
  await press("Enter");
  await expect(page.locator("#pallet.xray")).toBeVisible();
  await page.waitForTimeout(1200);
  await shot("06-livello-1-2-raggi-x");
  await press("Enter");
  await seeWin("07-evento-1-2");

  // 1-3 Le parole non si inventano: prima un errore, per vedere il messaggio
  await press("Enter"); await press("Enter");
  await press("1");
  await expect(page.locator("#msg")).toBeVisible();
  await shot("08-livello-1-3-errore");
  await press("3");
  await press("Enter");
  await seeWin("09-evento-1-3");

  // 1-4 Catena del freddo
  await press("Enter"); await press("Enter");
  await press("Enter");
  await expect(page.locator("#opts .opt")).toHaveCount(3, { timeout: 15_000 });
  await shot("10-livello-1-4");
  await press("2"); await press("Enter");
  await seeWin("11-evento-1-4");

  // 1-5 Ops, errore!
  await press("Enter"); await press("Enter");
  await press("2"); await press("Enter");
  await seeWin("12-evento-1-5");

  // 2-1 Inventario lampo
  await press("Enter"); await press("Enter");
  await press("Enter");
  await press("Enter");
  await expect(page.locator("#opts .opt")).toHaveCount(3, { timeout: 15_000 });
  await shot("13-livello-2-1-rfid");
  await press("2"); await press("Enter");
  await seeWin("14-evento-2-1");

  // 2-2 Il reso sospetto
  await press("Enter"); await press("Enter");
  await press("8"); await press("9");
  await shot("15-livello-2-2");
  await press("1"); await press("Enter");
  await seeWin("16-evento-2-2");

  // Sfida finale
  await press("Enter");
  await shot("17-intro-sfida-finale");
  await press("Enter");
  await press("Enter");
  await expect(page.locator("#new")).toBeVisible({ timeout: 20_000 });
  await shot("18-sfida-finale-round-1");
  await press("Enter");
  await press("3");
  await expect(page.locator("#block")).toBeVisible({ timeout: 10_000 });
  await press("Enter");
  await expect(page.locator("#reg")).toBeVisible({ timeout: 10_000 });
  await shot("19-sfida-finale-round-2");
  await press("Enter");
  await seeWin("20-evento-sfida-finale");

  await press("Enter");
  await expect(page.locator(".final h1")).toHaveText("MISSIONE COMPIUTA");
  await expect(page.locator(".pcell.on")).toHaveCount(8);
  await shot("21-finale");

  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});
