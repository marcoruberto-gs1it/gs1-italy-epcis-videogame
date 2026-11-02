// Livello 1-1 · Dal latte allo yogurt: il TransformationEvent collega gli ingredienti al prodotto.
import events from "../data/events/food-latte.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "food-latte", id: "1-1", world: "food", sp: "factory", scene: "caseificio", events,

  mount({ C, hook, show, levelShell, ask, fail, setMsg, win, sfx, img, fx, $, $$ }) {
    const inTank = [];
    const needed = C.ingredients.filter(i => i.ok).length;
    show(levelShell(this,
      `<div class="tank" id="tank" aria-label="${C.tankLabel}"><span class="cap">${C.tankLabel}</span><ul id="tankList"><li class="empty">${C.tankEmpty}</li></ul></div>${img("tank", 128, "vat")}
       <div class="born" id="born" hidden>${img("jar", 56)}<span class="cap">${C.born}</span></div>`,
      `<p class="story">${C.story}</p>
       <div class="opts" id="ingredients">${C.ingredients.map((g, i) => `<button class="opt ingr" draggable="true" data-key="${i + 1}" data-id="${g.id}"><span class="k">${i + 1}</span><span>${g.t}</span></button>`).join("")}</div>
       <div class="stack" id="qa"></div>
       <div class="row" id="after"></div>`));

    const put = id => {
      const g = C.ingredients.find(x => x.id === id);
      const b = $(`.ingr[data-id="${id}"]`);
      if (!g || !b || b.disabled) return;
      b.disabled = true;
      if (!g.ok) { b.classList.add("no"); hook("reject", id); fail(g.why); return; }
      b.classList.add("ok"); sfx.ok(); hook("put", id);
      fx.burst($(".vat"), ["var(--gs1-white)", "var(--gs1-blue-200)"], 10);
      inTank.push(g);
      $("#tankList").innerHTML = inTank.map(x => `<li>✓ ${x.t}</li>`).join("");
      if (inTank.length < needed) return;
      // Vasca piena: gli ingredienti escono di scena e i tasti 1-9 passano alla domanda.
      $$(".ingr").forEach(x => { x.disabled = true; x.removeAttribute("data-key"); });
      setMsg(C.tankFull, true);
      // Trasformazione: gli ingredienti spariscono, nasce il vasetto.
      $("#born").hidden = false;
      hook("born");
      fx.popIn($("#born"), 0.2);
      fx.burst($("#born"), ["var(--gs1-white)", "var(--gs1-forest-300)", "var(--gs1-blue-200)"], 18);
      $("#qa").innerHTML = `<p class="q">${C.q}</p><div class="opts" id="opts"></div>`;
      ask($("#opts"), C.opts, () => {
        $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
        $("#reg").onclick = () => win();
      });
    };

    $$(".ingr").forEach(b => {
      b.onclick = () => put(b.dataset.id);
      b.ondragstart = e => e.dataTransfer.setData("text/plain", b.dataset.id);
    });
    const tank = $("#tank");
    tank.ondragover = e => { e.preventDefault(); tank.classList.add("over"); };
    tank.ondragleave = () => tank.classList.remove("over");
    tank.ondrop = e => { e.preventDefault(); tank.classList.remove("over"); put(e.dataTransfer.getData("text/plain")); };
  }
});
