// Livello 1-5 · Catena del freddo: AssociationEvent sensore-pallet, poi i dati del sensore nel COME.
import events from "../data/events/food-freddo.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "food-freddo", id: "1-5", world: "food", sp: "thermo", scene: "autostrada", events,

  mount({ C, show, levelShell, ask, setMsg, win, sfx, img, sprite, fx, later, reduced, $ }) {
    show(levelShell(this,
      `<div class="temp" id="temp">${img("thermo", 22)}<span id="tv">4,0 °C</span></div><div class="road" id="road">${img("truck", 110, "truck")}</div><span class="cap" id="link">${C.cap}</span>`,
      `<p class="story">${C.story}</p>
       <p class="q">${C.q1}</p>
       <div class="opts" id="opts1"></div>
       <div class="row" id="pre"></div>
       <div class="stack" id="qa"></div>`));
    ask($("#opts1"), C.opts1, () => {
      $("#link").textContent = C.linked;
      $("#opts1").querySelectorAll(".opt").forEach(b => b.removeAttribute("data-key"));
      $("#pre").innerHTML = `<button class="btn" data-primary id="drive">${C.drive}</button>`;
      $("#drive").onclick = drive;
    });

    function drive() {
      $("#pre").innerHTML = ""; setMsg("");
      fx.drive($("#road .truck"), $("#road"), 4);
      fx.frames($("#road .truck"), [sprite("truck"), sprite("truckB")], 0.15);
      $("#scene").classList.add("road-moving");
      let t = 40; const end = 90;
      const iv = later.every(() => {
        t += 2;
        $("#tv").textContent = (t / 10).toFixed(1).replace(".", ",") + " °C"; sfx.tick();
        if (t > 80) $("#temp").classList.add("hot");
        if (t < end) return;
        later.stop(iv); sfx.alarm();
        $("#scene").classList.remove("road-moving");
        $("#qa").innerHTML = `<p class="q">${C.q2}</p><div class="opts" id="opts2"></div><div class="row" id="after"></div>`;
        ask($("#opts2"), C.opts2, () => {
          $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
          $("#reg").onclick = () => win();
        });
      }, reduced() ? 20 : 160);
    }
  }
});
