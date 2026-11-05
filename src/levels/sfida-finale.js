// Sfida finale · Il grande richiamo: dal latte ai lotti di yogurt (trasformazione), poi dove sono adesso.
import events from "../data/events/sfida-finale.json";
import { defineLevel } from "./define.js";
import { question } from "../ui/kit.js";

const DL = "https://id.gs1.org/01";
const MILK = `${DL}/09506000134314/10/C0471`;
const lotUri = lot => `${DL}/09506000134352/10/${lot}`;

export default defineLevel({
  slug: "sfida-finale", id: "finale", world: "food", sp: "alarm", scene: "allarme", events,

  mount({ C, hook, show, levelShell, ask, setMsg, win, sfx, sprite, img, fx, later, reduced, state, commit, $ }) {
    show(levelShell(this,
      `<div data-blink>${img("alarm", 64)}</div><div class="clock" id="clock">0 g 00 h</div>
       <div class="minimap" id="minimap" role="img" aria-label="${C.mapAria}"><div class="route"></div>${C.map.map(p => `<span class="pt" data-pt="${p.id}" style="left:${p.x}%;top:${p.y}%"><i></i>${p.t}</span>`).join("")}</div>
       <div class="feed" id="feed"></div><span class="cap" id="fcap">${C.round1}</span>`,
      `<p class="story">${C.story}</p>
       <div class="row" id="ctl"><button class="btn" data-primary id="old">${C.old}</button></div>
       <div class="stack" id="phase2"></div>`));

    $("#old").onclick = () => {
      $("#ctl").innerHTML = "";
      let h = 0, s = 0; const total = 6 * 24 + 18;
      const iv = later.every(() => {
        h = Math.min(total, h + 4);
        $("#clock").textContent = `${Math.floor(h / 24)} g ${String(h % 24).padStart(2, "0")} h`;
        if (h >= (s + 1) * (total / C.steps.length) && s < C.steps.length) { $("#feed").insertAdjacentHTML("beforeend", `<div>${C.steps[s++]}</div>`); sfx.no(); }
        if (h < total) return;
        later.stop(iv); state.lives = Math.max(1, state.lives - 1); commit(); fx.shake($("#screen"));
        setMsg(C.tooLate);
        $("#ctl").innerHTML = `<button class="btn" data-primary id="new">${C.usePowers}</button>`;
        $("#new").onclick = phase2;
      }, reduced() ? 10 : 120);
    };

    // Un orologio veloce che simula la risposta del repository.
    const tick = (to, done) => {
      let t = 0;
      const iv = later.every(() => {
        t = Math.min(to, t + 2);
        $("#clock").textContent = (t / 10).toFixed(1).replace(".", ",") + " s";
        if (t >= to) { later.stop(iv); done(); }
      }, reduced() ? 5 : 60);
    };

    function phase2() {
      setMsg("");
      $("#ctl").innerHTML = ""; $("#feed").innerHTML = ""; $("#clock").textContent = "0,0 s"; $("#clock").classList.add("fast"); $("#fcap").textContent = C.round2;
      $("#minimap").classList.add("dark"); hook("dark");
      $("#phase2").innerHTML = `${question(C.q1, C.q1Ctx, "q1")}<div class="opts" id="opts1"></div><div class="stack" id="out1"></div>`;
      ask($("#opts1"), C.opts1, () => {
        $("#out1").innerHTML = `<div class="req">GET /events?MATCH_inputEPCClass=${MILK}</div>`;
        tick(6, () => {
          sfx.coin();
          $("#feed").innerHTML = `<div class="good">${C.found}</div>`;
          const origin = $('[data-pt="caseificio"]');
          origin.classList.add("notice"); fx.pulse(origin, 1.8); hook("found");
          $("#phase2").insertAdjacentHTML("beforeend", `${question(C.q2, C.q2Ctx, "q2")}<div class="opts" id="opts2"></div><div class="stack" id="out2"></div>`);
          ask($("#opts2"), C.opts2, run);
        });
      });
    }

    function run() {
      $("#out2").innerHTML = `<div class="req">GET /events?MATCH_anyEPCClass=${lotUri("L123")}<br>GET /events?MATCH_anyEPCClass=${lotUri("L124")}</div><div class="results" id="res"></div><div class="row" id="ctl2"></div>`;
      tick(16, () => {
        sfx.coin();
        $("#res").innerHTML = C.rows.map((r, i) => `<div class="res" id="r${i}"><img class="px" src="${sprite(r.sp)}" alt=""><span>${r.t} · ${r.lot}</span><span class="n">${r.n}</span></div>`).join("");
        $("#feed").insertAdjacentHTML("beforeend", `<div class="good">${C.summary}</div>`);
        // La mappa resta scura e si accendono solo i punti dove si trovano i lotti coinvolti.
        hook("results", C.mapLit, C.mapNotice);
        [...C.mapLit, ...C.mapNotice].forEach((id, i) => later.after(() => {
          const pt = $(`[data-pt="${id}"]`);
          pt.classList.add(C.mapNotice.includes(id) ? "notice" : "lit");
          fx.pulse(pt, 1.8);
        }, reduced() ? 0 : 150 * i));
        $("#ctl2").innerHTML = `<button class="btn" data-primary id="block">${C.block}</button>`;
        $("#block").onclick = () => {
          sfx.alarm(); hook("block");
          const last = C.rows.length - 1;
          C.rows.forEach((r, i) => later.after(() => {
            const el = $("#r" + i);
            el.classList.add("blocked");
            el.querySelector(".n").textContent = i === last ? C.notice : C.blocked;
          }, reduced() ? 0 : 200 * i));
          later.after(() => {
            setMsg(C.recap, true);
            $("#ctl2").innerHTML = `<button class="btn" data-primary id="reg">${C.done}</button>`;
            $("#reg").onclick = () => win();
          }, reduced() ? 0 : 1100);
        };
      });
    }
  }
});
