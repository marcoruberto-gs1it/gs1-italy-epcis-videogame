// Livello 2-1 · Inventario lampo: stesso EPC, vettori diversi (barcode contro RAIN RFID).
import event from "../data/events/tessile-inventario.json";

export default {
  id: "2-1",
  world: "textile",
  meta: { t: "Inventario lampo", c: "EPC + RAIN RFID", sp: "shirt", place: "Negozio di Milano" },
  intro: "Cambio di mondo: stesso standard, altro settore. Ore 8:55, tra cinque minuti apre il negozio.",
  power: ["LETTURA LAMPO", "Stessa identità EPC, vettore RAIN RFID: uno scaffale intero in un colpo."],
  event,
  fact: "Qui ne vedi 3, nella lista vera ci sono tutti e 24 i seriali. Con questi eventi Decathlon ha portato l'accuratezza dell'inventario dal 70% al 95%.",

  mount({ show, levelShell, ask, setMsg, win, sfx, img, sprite, fx, later, reduced, $, $$ }) {
    const shirts = Array.from({ length: 24 }, (_, i) => `<button class="shirt" data-i="${i}" aria-label="T-shirt ${i + 1}"><img class="px" src="${sprite("shirt")}" alt=""></button>`).join("");
    show(levelShell(this,
      `<div class="reader" id="reader">${img("reader", 36)}<div class="wave"></div></div><div class="shelf" id="shelf">${shirts}</div><div class="shelf-plank"></div><span class="counter" id="cnt">LETTI 00/24 · 00:00</span>`,
      `<p class="story">Ogni t-shirt ha un cartellino con barcode e tag RAIN RFID. Dentro c'è la stessa identità: l'EPC del capo.</p>
       <p class="q">Round 1 · barcode. Clicca le t-shirt una alla volta, come con la pistola ottica.</p>
       <div class="row" id="ctl"><button class="btn" data-primary id="rfid">BASTA, PASSA ALL'RFID</button></div>
       <div class="stack" id="qa"></div>`));
    let read = 0, start = null, timer = null, mode = "bar";
    const cnt = $("#cnt");
    const fmt = s => `LETTI ${String(read).padStart(2, "0")}/24 · 00:${String(s).padStart(2, "0")}`;
    $$(".shirt").forEach(b => b.onclick = () => {
      if (mode !== "bar" || b.classList.contains("lit")) return;
      if (!start) { start = Date.now(); timer = later.every(() => cnt.textContent = fmt(Math.floor((Date.now() - start) / 1000)), 250); }
      b.classList.add("lit"); read++; sfx.sel(); cnt.textContent = fmt(Math.floor((Date.now() - start) / 1000));
    });
    $("#rfid").onclick = () => {
      if (timer) later.stop(timer);
      const barSec = start ? Math.max(1, Math.round((Date.now() - start) / 1000)) : 0;
      const barRead = read;
      mode = "rfid"; read = 0;
      $$(".shirt").forEach(b => b.classList.remove("lit"));
      cnt.textContent = fmt(0);
      $("#ctl").innerHTML = `<button class="btn" data-primary id="scan">LETTURA RAIN RFID</button>`;
      $(".q").textContent = "Round 2 · RAIN RFID. Un solo comando, a distanza, senza vedere i capi.";
      $("#scan").onclick = () => {
        $("#ctl").innerHTML = ""; fx.wave($("#reader .wave")); sfx.power();
        const all = $$(".shirt");
        all.forEach((b, i) => later.after(() => {
          b.classList.add("lit"); read++; cnt.textContent = fmt(1);
          if (i % 4 === 0) sfx.tick();
          if (i === all.length - 1) after();
        }, reduced() ? 0 : 40 * i));
        function after() {
          setMsg(`Barcode: ${barRead} capi in ${barSec} secondi. RAIN RFID: 24 capi in un secondo.`, true);
          $("#qa").innerHTML = `<p class="q">Domanda trabocchetto: cosa ha letto davvero il lettore?</p><div class="opts" id="opts"></div><div class="row" id="after"></div>`;
          ask($("#opts"), [
            { t: "L'RFID: è lui l'identità del capo", why: "L'RFID è il vettore, come la tessera su cui è stampato il codice fiscale. L'identità è un'altra cosa." },
            { t: "L'EPC del capo, trasportato dal tag RFID", ok: true, why: "Giusto. L'EPC è il dato, l'RFID il mezzo. Lo stesso EPC può stare in un barcode, in un tag NFC o in un database." },
            { t: "Il prezzo del capo", why: "Il prezzo non sta nel banco EPC del tag: lì c'è l'identità del capo." }
          ], () => {
            $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA INVENTARIO</button>`;
            $("#reg").onclick = () => win();
          });
        }
      };
    };
  }
};
