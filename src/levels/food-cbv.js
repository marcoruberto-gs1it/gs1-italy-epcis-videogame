// Livello 1-4 · Le parole non si inventano: il vocabolario CBV.
import events from "../data/events/food-cbv.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "food-cbv", id: "1-4", world: "food", sp: "truck", events,

  mount({ C, show, levelShell, ask, win, img, $, $$ }) {
    show(levelShell(this,
      `<div class="bubble" id="bub">${C.bubble}</div>${img("person", 64)}${img("truck", 150)}<span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <p class="q">${C.q}</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    const confuse = () => { const b = $("#bub"); b.className = "bubble bad"; b.textContent = C.bubbleBad; };
    const box = $("#opts");
    ask(box, C.opts, () => {
      const b = $("#bub"); b.className = "bubble good"; b.textContent = C.bubbleGood;
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
      $("#reg").onclick = () => win();
    });
    $$(".opt", box).forEach((b, i) => { if (!C.opts[i].ok) b.addEventListener("click", confuse); });
  }
});
