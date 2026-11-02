// Livello 2-3 · Il reso sospetto: la storia del capo (pedigree) interrogando il repository EPCIS.
import events from "../data/events/tessile-reso.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "tessile-reso", id: "2-3", world: "textile", sp: "jacket", scene: "negozio", events,

  mount({ C, hook, show, levelShell, ask, win, sfx, img, fx, $, $$ }) {
    show(levelShell(this,
      `<div class="jackets">
         <div class="jk">${img("jacket", 64)}<span class="sn">${C.jacketA}</span><button class="btn alt" data-key="8" id="qa1">${C.query} (8)</button><div class="tl" id="tlA"></div></div>
         <div class="jk">${img("jacket", 64)}<span class="sn">${C.jacketB}</span><button class="btn alt" data-key="9" id="qb1">${C.query} (9)</button><div class="tl" id="tlB"></div></div>
       </div><span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <p class="q">${C.q}</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    const showA = () => {
      if ($("#tlA").children.length) return;
      $("#tlA").innerHTML = C.historyA.map(([d, e]) => `<div><span>${d}</span><span>${e}</span></div>`).join("");
      fx.staggerIn($$("#tlA > div"));
      hook("historyA");
    };
    const showB = () => { if ($("#tlB").children.length) return; $("#tlB").innerHTML = `<div class="none"><span>${C.historyB}</span></div>`; hook("historyB"); };
    $("#qa1").onclick = () => { sfx.sel(); showA(); };
    $("#qb1").onclick = () => { sfx.no(); showB(); };
    ask($("#opts"), C.opts, () => {
      showA(); showB();
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
      $("#reg").onclick = () => win();
    });
  }
});
