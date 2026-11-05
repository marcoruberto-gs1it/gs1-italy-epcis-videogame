// Livello 1-1 · Alla stalla nasce il lotto del latte crudo, che poi arriva al caseificio.
// Due eventi di oggetto: la nascita del lotto (commissioning) e il ricevimento (receiving).
import events from "../data/events/food-stalla.json";
import { defineLevel } from "./define.js";
import { question } from "../ui/kit.js";

export default defineLevel({
  slug: "food-stalla", id: "1-1", world: "food", sp: "cow", scene: "stalla", events,

  mount({ C, hook, show, levelShell, ask, win, img, $ }) {
    show(levelShell(this,
      `<div class="row">${img("cow", 96)}${img("tank", 110)}</div>${img("truck", 130)}<span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       ${question(C.q, C.qCtx, "q")}
       <div class="opts" id="opts"></div><div class="stack" id="qa2"></div><div class="row" id="after"></div>`));
    ask($("#opts"), C.opts, () => {
      // Il lotto C0471 è nato: l'autocisterna parte per il caseificio.
      hook("depart");
      $("#qa2").innerHTML = `${question(C.q2, C.q2Ctx, "q2")}<div class="opts" id="opts2"></div>`;
      $("#qa2").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      ask($("#opts2"), C.opts2, () => {
        hook("arrived");
        $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
        $("#reg").onclick = () => win();
      });
    });
  }
});
