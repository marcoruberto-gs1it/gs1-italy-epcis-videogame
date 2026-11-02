// Sprite in pixel art generati da matrici di caratteri. Ogni carattere è un token di colore GS1 Italy.
// Regola di brand: nessun pixel Orange tocca un pixel Teal (verificato da tests/unit/sprites.test.js).
import { color } from "../../tokens.js";

export const PAL = {
  o: "gs1-orange", O: "gs1-orange-700", p: "gs1-orange-300",
  b: "gs1-blue", B: "gs1-blue-600", d: "gs1-blue-800", k: "gs1-blue-950",
  s: "gs1-teal", t: "gs1-teal-300", T: "gs1-teal-700",
  f: "gs1-forest", F: "gs1-forest-700",
  w: "gs1-white", W: "gs1-off-white", L: "gs1-light-gray", G: "gs1-dark-gray",
  c: "gs1-warm-400", C: "gs1-warm-600", y: "gs1-light-gray", g: "gs1-warm-400"
};
export const ORANGES = new Set(["o", "O", "p"]);
export const TEALS = new Set(["s", "t", "T"]);

export const SPR = {
  jar: ["...oooooo...", "..oppppppo..", ".oooooooooo.", ".OOOOOOOOOO.", "..wwwwwwwL..", "..wkwwwwkL..", "..wkwwwwkL..", "..wwwoowwL..", "..wwwwwwwL..", "..bbbbbbbd..", "..bwbwbbwd..", "..bwbwbbwd..", "..bbbbbbbd..", "..wwwwwwwL..", "...wwwwwL...", "....LLLL...."],
  jarBlink: ["...oooooo...", "..oppppppo..", ".oooooooooo.", ".OOOOOOOOOO.", "..wwwwwwwL..", "..wwwwwwwL..", "..kkwwwkkL..", "..wwwoowwL..", "..wwwwwwwL..", "..bbbbbbbd..", "..bwbwbbwd..", "..bwbwbbwd..", "..bbbbbbbd..", "..wwwwwwwL..", "...wwwwwL...", "....LLLL...."],
  minijar: [".oooo.", "oooooo", ".wwww.", ".wkkw.", ".bbbb.", ".wwww."],
  bip: ["..bbbbbbbb..", ".bBBBBBBBBb.", ".bsttttttsd.", ".bstkttktsd.", ".bstkttktsd.", ".bsttttttsd.", ".bssssssssd.", ".bbbbbbbbbd.", "..dbbbbbbd..", "....bbbd....", "....bbbd....", "....bbbd....", "...dbbbbd...", "...dddddd..."],
  bipBlink: ["..bbbbbbbb..", ".bBBBBBBBBb.", ".bsttttttsd.", ".bsttttttsd.", ".bskkttkksd.", ".bsttttttsd.", ".bssssssssd.", ".bbbbbbbbbd.", "..dbbbbbbd..", "....bbbd....", "....bbbd....", "....bbbd....", "...dbbbbd...", "...dddddd..."],
  carton: ["CCCCCCCCCCCCCC", "CcccccLLcccccC", "CcccccLLcccccC", "CccccccccccccC", "CcwwwwwccccccC", "CckwkwkccccccC", "CckwkwkccccccC", "CcwwwwwccccccC", "CccccccccccccC", "CCCCCCCCCCCCCC"],
  pallet: ["cccccccccccccccccccccccccccccc", "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", "cc..........cccccc..........cc", "CC..........CCCCCC..........CC"],
  truck: ["bbbbbbbbbbbb......", "bwwwwwwwwwwd......", "bwsssssssswdooo...", "bwwwwwwwwwwdobkoo.", "bwwwwwwwwwwdobooo.", "bwwwwwwwwwwdoooooo", "bdddddddddddOOOOOO", "..kGk.....kGk.kGk.", "...k.......k...k.."],
  truckB: ["bbbbbbbbbbbb......", "bwwwwwwwwwwd......", "bwsssssssswdooo...", "bwwwwwwwwwwdobkoo.", "bwwwwwwwwwwdobooo.", "bwwwwwwwwwwdoooooo", "bdddddddddddOOOOOO", "..GkG.....GkG.GkG.", "...G.......G...G.."],
  shirt: ["...ss..ss...", ".ssssssssss.", "sstsssssssss", "stssssssssss", "..stssssss..", "..ssssssss..", "..sssLLsss..", "..ssssssss..", "..ssssssTT..", "..TTTTTTTT.."],
  jacket: ["...oo..oo...", ".oooowwoooo.", "ooooowwooooo", "opooowwooooo", "oo.oowwoo.oo", "oo.ookkoo.oo", "oo.ookkoo.oo", "...ookkoo...", "...ookkoo...", "...OOOOOO..."],
  heart: [".oo.oo.", "opooooo", "ooooooo", ".ooooo.", "..ooo..", "...o..."],
  thermo: [".www.", ".w.w.", ".w.w.", ".wow.", ".wow.", ".wow.", ".wow.", "wooow", "wooow", ".www."],
  store: ["oooooooooooooo", "owowowowowowow", "oooooooooooooo", "wwwwwwwwwwwwww", "wssswwwwwwsssw", "wstswwbbwwstsw", "wssswwbbwwsssw", "wwwwwwbbwwwwww", "LLLLLLbbLLLLLL", "GGGGGGGGGGGGGG"],
  factory: ["..LL..........", "..LL..........", "..LL...b...b..", "..LL..bb..bb..", "bbbbbbbbbbbbbd", "bwwbbwwbbwwbbd", "bwwbbwwbbwwbbd", "bbbbbbbbbbbbbd", "bbbbbooobbbbbd", "ddddoooodddddd"],
  cedi: ["....bbbbbb....", "..bbbbbbbbbb..", "bbbbbbbbbbbbbd", "bwwwwwwwwwwwwd", "bwccccccccccwd", "bwcCCCCCCCCcwd", "bwccccccccccwd", "bwcCCCCCCCCcwd", "bwccccccccccwd", "GGGGGGGGGGGGGG"],
  reader: ["..ss..", ".s..s.", "s.bb.s", "..bb..", ".bbbb.", ".bkkb.", ".bkkb.", ".bbbb.", "..bb..", "..bb.."],
  person: ["..LLLL..", ".LLLLLL.", ".wkwwkw.", ".wwwwww.", "..wwww..", ".bbbbbb.", "bbBbbbbb", "bbbbbbbd", ".bb..bd.", ".kk..kk."],
  alarm: ["...oo...", "..oooo..", ".oowwoo.", ".oowwoo.", ".oowwoo.", ".oooooo.", "ooowwooo", "OOOOOOOO"],
  tank: ["LLLLLLLLLLLLLLLL", "LwwwwwwwwwwwwwwL", "LWWWWWWWWWWWWWWL", "cLLLLLLLLLLLLLLc", "cLLLLLLLLLLLLLLc", "cLLLLLLLLLLLLLLc", "cLLLLLLLLLLLLLLc", "cccccccccccccccc", ".C..C......C..C.", ".C..C......C..C."],
  sensor: [".kkkk.", "kbbbbk", "kbffbk", "kbffbk", "kbbbbk", ".kkkk."],
  spool: ["CCCCCCCCCC", ".wwwwwwww.", ".WwwwwwwW.", ".wwwwwwww.", ".WwwwwwwW.", ".wwwwwwww.", "CCCCCCCCCC"],
  fabric: ["..LLLLLLLLLLLL", ".LwwwwwwwwwwwL", "LwWwwwwwwwwwwL", "LwwwwwwwwwwwwL", "LwWwwwwwwwwwwL", ".LwwwwwwwwwwwL", "..LLLLLLLLLLLL"]
};

const cache = {};

/** Disegna una matrice di caratteri e la restituisce come data URL PNG. */
export function drawMatrix(rows, scale = 4) {
  const cv = document.createElement("canvas");
  cv.width = rows[0].length * scale; cv.height = rows.length * scale;
  const ctx = cv.getContext("2d");
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (PAL[ch]) { ctx.fillStyle = color(PAL[ch]); ctx.fillRect(x * scale, y * scale, scale, scale); }
  }));
  return cv.toDataURL();
}

/** Restituisce lo sprite come data URL PNG, alla scala indicata. */
export function sprite(name, scale = 4) {
  const key = name + scale;
  return cache[key] || (cache[key] = drawMatrix(SPR[name], scale));
}

/** HTML di un'immagine sprite larga w pixel. */
export const img = (name, w, cls = "", alt = "") =>
  `<img class="px ${cls}" src="${sprite(name)}" style="width:${w}px" alt="${alt}" data-sprite="${name}">`;

export const SPRITE_NAMES = Object.keys(SPR);
