// Livello 1-2 · Nasce il vasetto: le dimensioni COSA, QUANDO, DOVE, PERCHÉ di un evento.
import events from "../data/events/food-nascita.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "food-nascita", id: "1-2", world: "food", sp: "jar", scene: "caseificio", events,

  mount({ C, hook, show, levelShell, fail, win, sfx, img, later, reduced, $, $$ }) {
    const rows = C.rows;
    const pick = {};
    show(levelShell(this,
      `<div data-bob>${img("jar", 110)}</div>${img("factory", 140)}<span class="cap">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <div class="slots">${rows.map((r, i) => `<div class="slot" id="slot${i}"><span class="dim">${r.d}</span><div class="chips">${r.o.map((o, j) => `<button class="chip" data-r="${i}" data-j="${j}">${o}</button>`).join("")}</div><span class="why" id="why${i}"></span></div>`).join("")}</div>
       <span class="err" id="err"></span>
       <div class="row"><button class="btn" data-primary id="reg">${C.register}</button></div>`));
    $$(".chip").forEach(c => c.onclick = () => {
      const r = c.dataset.r; pick[r] = +c.dataset.j; sfx.sel();
      $("#err").textContent = "";
      $$(`.chip[data-r="${r}"]`).forEach(x => x.classList.toggle("sel", x === c));
      $("#slot" + r).classList.remove("bad", "good"); $("#why" + r).textContent = "";
    });
    $("#reg").onclick = () => {
      if (Object.keys(pick).length < rows.length) { $("#err").textContent = C.needAll; return; }
      let wrong = 0;
      rows.forEach((r, i) => {
        const good = pick[i] === r.ok;
        $("#slot" + i).classList.toggle("good", good); $("#slot" + i).classList.toggle("bad", !good);
        $("#why" + i).textContent = good ? "" : r.why;
        if (!good) wrong++;
      });
      if (wrong) fail(wrong === 1 ? C.wrongOne : C.wrongMany.replace("{n}", wrong));
      else {
        // Il vasetto passa il controllo qualità, poi si registra l'evento.
        hook("built");
        $("#reg").disabled = true;
        later.after(win, reduced() ? 0 : 1500);
      }
    };
  }
});
