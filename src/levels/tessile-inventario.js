// Livello 2-2 · Inventario lampo: stesso EPC, vettori diversi (barcode contro RAIN RFID).
import events from "../data/events/tessile-inventario.json";
import { defineLevel } from "./define.js";

export default defineLevel({
  slug: "tessile-inventario", id: "2-2", world: "textile", sp: "reader", scene: "negozio", events,

  mount({ C, hook, show, levelShell, ask, setMsg, win, sfx, img, sprite, fx, later, reduced, $, $$ }) {
    const shirts = Array.from({ length: 24 }, (_, i) => `<button class="shirt" data-i="${i}" aria-label="T-shirt ${i + 1}"><img class="px" src="${sprite("shirt")}" alt=""></button>`).join("");
    show(levelShell(this,
      `<div class="reader" id="reader">${img("reader", 36)}<div class="wave"></div></div><div class="shelf" id="shelf">${shirts}</div><div class="shelf-plank"></div><span class="counter" id="cnt"></span>`,
      `<p class="story">${C.story}</p>
       <p class="q" id="q">${C.q}</p>
       <div class="row" id="ctl"><button class="btn" data-primary id="rfid">${C.toRfid}</button></div>
       <div class="stack" id="qa"></div>`));
    let read = 0, start = null, timer = null, mode = "bar";
    const cnt = $("#cnt");
    const fmt = s => C.counter.replace("{n}", String(read).padStart(2, "0")).replace("{s}", String(s).padStart(2, "0"));
    cnt.textContent = fmt(0);
    $$(".shirt").forEach(b => b.onclick = () => {
      if (mode !== "bar" || b.classList.contains("lit")) return;
      if (!start) { start = Date.now(); timer = later.every(() => cnt.textContent = fmt(Math.floor((Date.now() - start) / 1000)), 250); }
      b.classList.add("lit"); read++; sfx.sel(); hook("read", +b.dataset.i); cnt.textContent = fmt(Math.floor((Date.now() - start) / 1000));
    });
    $("#rfid").onclick = () => {
      if (timer) later.stop(timer);
      const barSec = start ? Math.max(1, Math.round((Date.now() - start) / 1000)) : 0;
      const barRead = read;
      mode = "rfid"; read = 0;
      $$(".shirt").forEach(b => b.classList.remove("lit")); hook("reset");
      cnt.textContent = fmt(0);
      $("#ctl").innerHTML = `<button class="btn" data-primary id="scan">${C.scan}</button>`;
      $("#q").textContent = C.q2;
      $("#scan").onclick = () => {
        $("#ctl").innerHTML = ""; fx.wave($("#reader .wave")); sfx.power(); hook("rfid");
        const all = $$(".shirt");
        all.forEach((b, i) => later.after(() => {
          b.classList.add("lit"); read++; cnt.textContent = fmt(1);
          if (i % 4 === 0) sfx.tick();
          if (i === all.length - 1) after();
        }, reduced() ? 0 : 40 * i));
        function after() {
          setMsg(C.result.replace("{n}", barRead).replace("{s}", barSec), true);
          $("#qa").innerHTML = `<p class="q">${C.q3}</p><div class="opts" id="opts"></div><div class="row" id="after"></div>`;
          ask($("#opts"), C.opts, () => {
            $("#after").innerHTML = `<button class="btn" data-primary id="reg">${C.register}</button>`;
            $("#reg").onclick = () => win();
          });
        }
      };
    };
  }
});
