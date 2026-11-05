// Livello 1-3 · Vista ai raggi X: vasetti nei cartoni, cartoni sul pallet (due AggregationEvent).
import events from "../data/events/food-raggi-x.json";
import { defineLevel } from "./define.js";
import { question } from "../ui/kit.js";

const CARTONS = 12, PER_CARTON = 24;

export default defineLevel({
  slug: "food-raggi-x", id: "1-3", world: "food", sp: "carton", scene: "caseificio", events,

  mount({ C, hook, show, levelShell, ask, setMsg, win, sfx, sprite, fx, $, $$ }) {
    const jars = Array.from({ length: PER_CARTON }, () => `<img class="px" src="${sprite("minijar")}" alt="">`).join("");
    const cartons = Array.from({ length: CARTONS }, () => `<div class="carton" hidden><img class="px" src="${sprite("carton")}" alt=""><div class="jars">${jars}</div></div>`).join("");
    show(levelShell(this,
      `<div class="beam" id="beam"></div><div class="pallet" id="pallet"><div class="cartons">${cartons}</div><img class="px palletbase" src="${sprite("pallet")}" alt=""></div><span class="counter" id="cnt"></span><span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <div class="row" id="ctl"><button class="btn" data-primary id="stack">${C.stack}</button><button class="btn alt" id="stackAll">${C.stackAll}</button></div>
       <div class="stack" id="qa"></div>
       <div class="row" id="after"></div>`));
    let stacked = 0;
    const count = () => { $("#cnt").textContent = C.count.replace("{n}", stacked).replace("{j}", stacked * PER_CARTON); };
    count();
    const stackOne = () => {
      if (stacked >= CARTONS) return;
      const box = $$(".carton")[stacked];
      box.hidden = false;
      fx.dropIn(box);
      stacked++; sfx.sel(); count(); hook("stack", stacked);
      if (stacked === CARTONS) ready();
    };
    $("#stack").onclick = stackOne;
    $("#stackAll").onclick = () => { while (stacked < CARTONS) stackOne(); };

    function ready() {
      $("#ctl").innerHTML = "";
      $("#qa").innerHTML = `${question(C.q, C.qCtx, "q")}<div class="opts" id="opts"></div>`;
      ask($("#opts"), C.opts, () => {
        $("#after").innerHTML = `<button class="btn" data-primary id="scan">${C.scan}</button>`;
        $("#scan").onclick = () => {
          sfx.power(); fx.beam($("#beam")); $("#pallet").classList.add("xray"); hook("xray");
          $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
          setMsg(C.scanned, true);
          $("#reg").onclick = () => win();
        };
      });
    }
  }
});
