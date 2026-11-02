// Sfida finale · Il grande richiamo: prima "come una volta", poi con una query EPCIS.
import event from "../data/events/sfida-finale.json";

const LOT = "https://id.gs1.org/01/09506000134352/10/L123";

export default {
  id: "finale",
  world: "finale",
  meta: { t: "Il grande richiamo", c: "Query EPCIS · recalled", sp: "alarm", place: "Tutta la filiera" },
  intro: "ALLERTA! Il laboratorio segnala un problema sul lotto L123. Dove sono adesso tutti i vasetti?",
  power: ["RICHIAMO CHIRURGICO", "Solo il lotto coinvolto, e si sa dov'è adesso. Secondi, non giorni."],
  event,
  fact: "Una domanda, una risposta in 2,2 secondi, solo i 288 vasetti del lotto L123. Funziona perché ogni pagina del diario era stata scritta bene, passo dopo passo.",

  mount({ show, levelShell, ask, setMsg, win, sfx, img, sprite, fx, later, reduced, state, commit, $ }) {
    show(levelShell(this,
      `<div data-blink>${img("alarm", 64)}</div><div class="clock" id="clock">0 g 00 h</div><div class="feed" id="feed"></div><span class="cap" id="fcap">ROUND 1 · COME UNA VOLTA</span>`,
      `<p class="story">Il laboratorio segnala un problema sul lotto L123. Bisogna bloccare tutti i vasetti, ovunque siano. Prima prova come si faceva senza EPCIS.</p>
       <div class="row" id="ctl"><button class="btn" data-primary id="old">PROVA COME UNA VOLTA</button></div>
       <div class="stack" id="phase2"></div>`));
    const steps = ["Telefono al CeDi: «vi richiamo domattina»", "Email al trasportatore: risposta automatica, fuori ufficio", "Apro lotti_DEF_v3_finale(2).xlsx", "Il negozio di Monza non trova il DDT", "Per sicurezza: richiamo tutta la produzione della settimana"];
    $("#old").onclick = () => {
      $("#ctl").innerHTML = "";
      let h = 0; const total = 6 * 24 + 18; let s = 0;
      const iv = later.every(() => {
        h = Math.min(total, h + 4);
        $("#clock").textContent = `${Math.floor(h / 24)} g ${String(h % 24).padStart(2, "0")} h`;
        if (h >= (s + 1) * (total / steps.length) && s < steps.length) { $("#feed").insertAdjacentHTML("beforeend", `<div>${steps[s++]}</div>`); sfx.no(); }
        if (h >= total) {
          later.stop(iv); state.lives = Math.max(1, state.lives - 1); commit(); fx.shake($("#screen"));
          setMsg("Troppo tardi: 6 giorni e 18 ore per rispondere (il tempo misurato da Walmart prima della tracciabilità a eventi). Riprova con i tuoi poteri.");
          $("#ctl").innerHTML = `<button class="btn" data-primary id="new">USA I SUPERPOTERI</button>`;
          $("#new").onclick = phase2;
        }
      }, reduced() ? 10 : 120);
    };
    function phase2() {
      setMsg("");
      $("#ctl").innerHTML = ""; $("#feed").innerHTML = ""; $("#clock").textContent = "0,0 s"; $("#clock").classList.add("fast"); $("#fcap").textContent = "ROUND 2 · CON EPCIS";
      $("#phase2").innerHTML = `<p class="q">Componi la domanda al repository EPCIS. Quale lotto cerchi?</p><div class="opts" id="opts"></div><div class="stack" id="out"></div>`;
      ask($("#opts"), [
        { t: "Tutti i lotti di quel GTIN", why: "Funzionerebbe, ma richiameresti anche i lotti sani. Il superpotere è il richiamo chirurgico." },
        { t: "Lotto L132", why: "Attenzione: L132 era l'errore di battitura corretto al CeDi. Il lotto con il problema è L123." },
        { t: "GTIN 09506000134352 · lotto L123", ok: true, why: "Proprio quello. Invio la query." }
      ], run);
    }
    function run() {
      const rows = [["cedi", "CeDi di Bologna · in magazzino", 96], ["truck", "Camion TR-22 · in viaggio verso Monza", 48], ["store", "Negozio di Milano · a scaffale", 72], ["store", "Negozio di Monza · in retro", 48], ["person", "Già venduti ai consumatori", 24]];
      $("#out").innerHTML = `<div class="req">GET /events?MATCH_anyEPCClass=${LOT}</div><div class="results" id="res"></div><div class="row" id="ctl2"></div>`;
      let t = 0;
      const iv = later.every(() => {
        t = Math.min(22, t + 2);
        $("#clock").textContent = (t / 10).toFixed(1).replace(".", ",") + " s";
        if (t >= 22) { later.stop(iv); results(); }
      }, reduced() ? 5 : 60);
      function results() {
        sfx.coin();
        $("#res").innerHTML = rows.map((r, i) => `<div class="res" id="r${i}"><img class="px" src="${sprite(r[0])}" alt=""><span>${r[1]}</span><span class="n">${r[2]} PZ</span></div>`).join("");
        $("#feed").innerHTML = `<div class="good">288 vasetti trovati in 5 posizioni</div>`;
        $("#ctl2").innerHTML = `<button class="btn" data-primary id="block">BLOCCA IL LOTTO · RECALLED</button>`;
        $("#block").onclick = () => {
          sfx.alarm();
          rows.forEach((r, i) => later.after(() => {
            const el = $("#r" + i);
            el.classList.add("blocked");
            el.querySelector(".n").textContent = i === 4 ? "AVVISO" : "BLOCCATI";
          }, reduced() ? 0 : 200 * i));
          later.after(() => {
            $("#ctl2").innerHTML = `<button class="btn" data-primary id="reg">SFIDA SUPERATA ▶</button>`;
            $("#reg").onclick = () => win();
          }, reduced() ? 0 : 1100);
        };
      }
    }
  }
};
