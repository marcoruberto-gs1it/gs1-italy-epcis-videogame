// Livello 1-6 · Ops, errore!: gli eventi non si cancellano, si correggono con una dichiarazione di errore.
import events from "../data/events/food-errore.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "food-errore", id: "1-6", world: "food", sp: "cedi", scene: "cedi", events,

  mount({ C, show, levelShell, ask, win, img, $ }) {
    show(levelShell(this,
      `${img("cedi", 150)}<div class="req">${C.req}</div><span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <p class="q">${C.q}</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    ask($("#opts"), C.opts, () => {
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
      $("#reg").onclick = () => win();
    });
  }
});
