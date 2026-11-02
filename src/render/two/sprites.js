// Sprite in pixel art generati da matrici di caratteri. Ogni carattere è un token di colore GS1 Italy.
import { color } from "../../tokens.js";

const PAL = {
  o: color("gs1-orange"), O: color("gs1-orange-700"), w: color("gs1-white"), k: color("gs1-blue-950"),
  b: color("gs1-blue"), s: color("gs1-teal"), l: color("gs1-forest"), c: color("gs1-warm-400"),
  C: color("gs1-warm-600"), y: color("gs1-light-gray"), g: color("gs1-warm-400"), G: color("gs1-dark-gray")
};

const SPR = {
  jar: ["...oooooo...", ".oooooooooo.", ".OOOOOOOOOO.", "..wwwwwwww..", "..wkwwwwkw..", "..wkwwwwkw..", "..wwwoowww..", "..wwwwwwww..", "..bbbbbbbb..", "..bwbwbbwb..", "..bwbwbbwb..", "..bbbbbbbb..", "..wwwwwwww..", "...wwwwww..."],
  minijar: [".oooo.", "oooooo", ".wwww.", ".wkkw.", ".bbbb.", ".wwww."],
  carton: ["CCCCCCCCCCCCCC", "CcccccyycccccC", "CcccccyycccccC", "CccccccccccccC", "CcwwwwwccccccC", "CckwkwkccccccC", "CckwkwkccccccC", "CcwwwwwccccccC", "CccccccccccccC", "CCCCCCCCCCCCCC"],
  pallet: ["cccccccccccccccccccccccccccccc", "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", "cc..........cccccc..........cc", "CC..........CCCCCC..........CC"],
  truck: ["bbbbbbbbbbbb......", "bwwwwwwwwwwb......", "bwsssssssswbooo...", "bwwwwwwwwwwbobkoo.", "bwwwwwwwwwwbobooo.", "bwwwwwwwwwwboooooo", "bbbbbbbbbbbboooooo", "..kgk.....kgk.kgk.", "...k.......k...k.."],
  shirt: ["...ss..ss...", ".ssssssssss.", "ssssssssssss", "ssssssssssss", "..ssssssss..", "..ssssssss..", "..sssyysss..", "..ssssssss..", "..ssssssss..", "..ssssssss.."],
  jacket: ["...oo..oo...", ".oooowwoooo.", "ooooowwooooo", "ooooowwooooo", "oo.oowwoo.oo", "oo.ookkoo.oo", "oo.ookkoo.oo", "...ookkoo...", "...ookkoo...", "...oooooo..."],
  heart: [".oo.oo.", "ooooooo", "ooooooo", ".ooooo.", "..ooo..", "...o..."],
  thermo: [".www.", ".w.w.", ".w.w.", ".wow.", ".wow.", ".wow.", ".wow.", "wooow", "wooow", ".www."],
  store: ["oooooooooooooo", "owowowowowowow", "oooooooooooooo", "wwwwwwwwwwwwww", "wssswwwwwwsssw", "wssswwbbwwsssw", "wssswwbbwwsssw", "wwwwwwbbwwwwww", "wwwwwwbbwwwwww", "GGGGGGGGGGGGGG"],
  factory: ["..gg..........", "..gg..........", "..gg...b...b..", "..gg..bb..bb..", "bbbbbbbbbbbbbb", "bwwbbwwbbwwbbb", "bwwbbwwbbwwbbb", "bbbbbbbbbbbbbb", "bbbbbooobbbbbb", "bbbbbooobbbbbb"],
  cedi: ["....bbbbbb....", "..bbbbbbbbbb..", "bbbbbbbbbbbbbb", "bwwwwwwwwwwwwb", "bwggggggggggwb", "bwgGGGGGGGGgwb", "bwggggggggggwb", "bwgGGGGGGGGgwb", "bwggggggggggwb", "GGGGGGGGGGGGGG"],
  reader: ["..ss..", ".s..s.", "s.bb.s", "..bb..", ".bbbb.", ".bkkb.", ".bkkb.", ".bbbb.", "..bb..", "..bb.."],
  person: ["..yyyy..", ".yyyyyy.", ".wkwwkw.", ".wwwwww.", "..wwww..", ".bbbbbb.", "bbbbbbbb", "bbbbbbbb", ".bb..bb.", ".kk..kk."],
  alarm: ["...oo...", "..oooo..", ".oowwoo.", ".oowwoo.", ".oowwoo.", ".oooooo.", "ooowwooo", "oooooooo"]
};

const cache = {};

/** Restituisce lo sprite come data URL PNG, alla scala indicata. */
export function sprite(name, scale = 4) {
  const key = name + scale;
  if (cache[key]) return cache[key];
  const rows = SPR[name];
  const cv = document.createElement("canvas");
  cv.width = rows[0].length * scale; cv.height = rows.length * scale;
  const ctx = cv.getContext("2d");
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (PAL[ch]) { ctx.fillStyle = PAL[ch]; ctx.fillRect(x * scale, y * scale, scale, scale); }
  }));
  return (cache[key] = cv.toDataURL());
}

/** HTML di un'immagine sprite larga w pixel. */
export const img = (name, w, cls = "", alt = "") =>
  `<img class="px ${cls}" src="${sprite(name)}" style="width:${w}px" alt="${alt}">`;

export const SPRITE_NAMES = Object.keys(SPR);
