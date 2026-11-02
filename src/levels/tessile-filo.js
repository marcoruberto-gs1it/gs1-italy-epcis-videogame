// Livello 2-1 · Dal filo al capo: tre TransformationEvent in fila, la base del Passaporto Digitale di Prodotto.
import events from "../data/events/tessile-filo.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "tessile-filo", id: "2-1", world: "textile", sp: "shirt", scene: "tessile", events,

  mount({ C, show, levelShell, fail, setMsg, win, sfx, img, fx, $, $$ }) {
    const chain = [];
    show(levelShell(this,
      `<div class="chain"><span class="cap">${C.chainTitle}</span><ol id="chain"><li class="empty">${C.chainEmpty}</li></ol></div><div class="row center">${img("spool", 44)}${img("fabric", 60)}${img("shirt", 52)}</div>`,
      `<p class="story">${C.story}</p>
       <p class="q">${C.q}</p>
       <div class="opts" id="steps">${C.steps.map((s, i) => `<button class="opt" data-key="${i + 1}" data-i="${i}"><span class="k">${i + 1}</span><span>${s.t}</span></button>`).join("")}</div>
       <div class="row" id="after"></div>`));
    $$("#steps .opt").forEach(b => b.onclick = () => {
      const s = C.steps[+b.dataset.i];
      if (s.pos !== chain.length) { b.classList.add("no"); fail(C.wrong); setTimeout(() => b.classList.remove("no"), 600); return; }
      chain.push(s); b.disabled = true; b.classList.add("ok"); sfx.ok();
      $("#chain").innerHTML = chain.map(x => `<li>✓ ${x.t}</li>`).join("");
      fx.popIn($("#chain li:last-child"));
      if (chain.length < C.steps.length) return;
      setMsg(C.done, true);
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
      $("#reg").onclick = () => win();
    });
  }
});
