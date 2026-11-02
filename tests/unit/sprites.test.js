// Regole di brand sugli sprite: righe della stessa larghezza, solo colori della palette, Orange e Teal mai a contatto.
import { describe, it, expect } from "vitest";
import { SPR, PAL, ORANGES, TEALS } from "../../src/render/two/sprites.js";
import { TOKENS } from "../../src/tokens.js";

describe("sprite", () => {
  it.each(Object.keys(SPR))("%s: righe regolari e colori della palette", name => {
    const rows = SPR[name];
    for (const r of rows) expect(r.length, `${name}: "${r}"`).toBe(rows[0].length);
    for (const ch of rows.join("")) if (ch !== ".") expect(TOKENS[PAL[ch]], `${name}: carattere ${ch}`).toBeDefined();
  });

  it.each(Object.keys(SPR))("%s: nessun pixel Orange tocca un pixel Teal", name => {
    const rows = SPR[name];
    const at = (x, y) => (rows[y] && rows[y][x]) || ".";
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (!ORANGES.has(at(x, y))) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        expect(TEALS.has(at(x + dx, y + dy)), `${name} (${x},${y})`).toBe(false);
      }
    }
  });
});
