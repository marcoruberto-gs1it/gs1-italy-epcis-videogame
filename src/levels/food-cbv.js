// Livello 1-4 · Le parole non si inventano: il vocabolario CBV e l'avviso di spedizione collegato all'evento.
import events from "../data/events/food-cbv.json";
import { defineLevel } from "./define.js";
import { question } from "../ui/kit.js";

export default defineLevel({
  slug: "food-cbv", id: "1-4", world: "food", sp: "truck", scene: "caseificio", events,

  mount({ C, hook, show, levelShell, ask, win, img, $, $$ }) {
    show(levelShell(this,
      `<div class="bubble" id="bub">${C.bubble}</div>${img("person", 64)}${img("truck", 150)}<span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       ${question(C.q, C.qCtx, "q")}
       <div class="opts" id="opts"></div><div class="stack" id="qa2"></div><div class="row" id="after"></div>`));
    const confuse = () => { const b = $("#bub"); b.className = "bubble bad"; b.textContent = C.bubbleBad; hook("confused"); };
    const box = $("#opts");
    ask(box, C.opts, () => {
      const b = $("#bub"); b.className = "bubble good"; b.textContent = C.bubbleGood; hook("depart");
      // Seconda domanda: l'evento di spedizione e l'avviso di spedizione già ricevuto dal CeDi.
      $("#qa2").innerHTML = `${question(C.q2, C.q2Ctx, "q2")}<div class="opts" id="opts2"></div>`;
      $("#qa2").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      ask($("#opts2"), C.opts2, () => {
        $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
        $("#reg").onclick = () => win();
      });
    });
    $$(".opt", box).forEach((b, i) => { if (!C.opts[i].ok) b.addEventListener("click", confuse); });
  }
});
