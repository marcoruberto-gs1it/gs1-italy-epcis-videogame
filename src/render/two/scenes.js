// Sfondi a strati per le scene 2D: cielo (CSS), sagome lontane (tile in pixel art), pavimento o strada (CSS).
import { drawMatrix } from "./sprites.js";

export const TILES = {
  hills: ["........................", "........................", "....dddd................", "..dddddddd.........ddd..", ".dddddddddddd....dddddd.", "dddddddddddddddddddddddd", "dddddddddddddddddddddddd", "dddddddddddddddddddddddd"],
  silos: ["..BB....................", ".BBBB...................", ".dddd..BB...............", ".dddd.BBBB..............", ".dddd.dddd....dddddddd..", ".dddd.dddd...dddddddddd.", ".dddd.dddd...dBBdBBdBBd.", ".dddd.dddd...dddddddddd.", "dddddddddddddddddddddddd", "dddddddddddddddddddddddd"],
  skyline: ["..........dd............", "..dd......dd.......ddd..", "..dd..ddd.dd..dd...dBd..", "dddd..dBd.dddddd...ddd.d", "dBdd..ddddddBddd.dddddBd", "dddddddBddddddddddBddddd", "dddddddddddddddddddddddd", "dddddddddddddddddddddddd"],
  racks: ["dddddddddddddddddddddddd", "d....d....d....d....d...", "dBBBBdBBBBdBBBBdBBBBdBBB", "d....d....d....d....d...", "dBBBBdBBBBdBBBBdBBBBdBBB", "d....d....d....d....d...", "dddddddddddddddddddddddd", "d....d....d....d....d..."],
  shelves: ["dddddddddddddddddddddddd", "d.BB.BB.d.BB.BB.d.BB.BB.", "dddddddddddddddddddddddd", "d..BBB..d..BBB..d..BBB..", "dddddddddddddddddddddddd", "d.B.B.B.d.B.B.B.d.B.B.B.", "dddddddddddddddddddddddd", "d.......d.......d......."],
  sawtooth: ["...d.....d.....d.....d..", "..dd....dd....dd....dd..", ".ddd...ddd...ddd...ddd..", "dddd..dddd..dddd..dddd..", "dddddddddddddddddddddddd", "dBBddBBddBBddBBddBBddBBd", "dddddddddddddddddddddddd", "dddddddddddddddddddddddd"]
};

const KINDS = {
  stalla: { far: "hills", ground: "grass" },
  caseificio: { far: "silos", ground: "floor" },
  autostrada: { far: "hills", ground: "road" },
  cedi: { far: "racks", ground: "floor" },
  negozio: { far: "shelves", ground: "floor" },
  tessile: { far: "sawtooth", ground: "floor" },
  allarme: { far: "skyline", ground: "floor" }
};

const cache = {};
const tile = name => cache[name] || (cache[name] = drawMatrix(TILES[name], 4));

/** HTML dello sfondo di una scena. Il genere ("caseificio", "autostrada"...) sceglie sagome e pavimento. */
export function backdrop(kind) {
  const k = KINDS[kind] || KINDS.caseificio;
  return `<div class="backdrop" data-kind="${kind}" aria-hidden="true">
    <div class="bd-sky"></div>
    <div class="bd-far" style="background-image:url(${tile(k.far)})"></div>
    <div class="bd-ground ${k.ground}"></div>
  </div>`;
}

export const SCENE_KINDS = Object.keys(KINDS);
