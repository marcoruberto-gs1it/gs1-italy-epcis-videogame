// Livello 1-1 · Nasce il vasetto: le dimensioni COSA, QUANDO, DOVE, PERCHÉ di un evento.
import event from "../data/events/food-nascita.json";

export default {
  id: "1-1",
  world: "food",
  meta: { t: "Nasce il vasetto", c: "Le dimensioni di un evento", sp: "factory", place: "Fabbrica · linea 2" },
  intro: "Il lotto L123 di yogurt bianco esce dalla linea 2. È il momento di scrivere la prima pagina del suo diario.",
  power: ["DNA DIGITALE", "Ogni lotto ha un'identità GS1 che tutti i partner leggono allo stesso modo."],
  event,
  fact: "Prima pagina scritta: COSA, QUANDO, DOVE e PERCHÉ, ognuno con un identificativo o un termine standard. <code>action: ADD</code> dice che il lotto entra nel mondo adesso.",

  mount({ show, levelShell, fail, win, sfx, img, $, $$ }) {
    const rows = [
      { d: "COSA", o: ["Vasetto bianco 125 g", "GTIN 09506000134352 + lotto L123", "Codice interno YG-47"], ok: 1, why: "Il COSA è una chiave GS1: descrizioni e codici interni non escono dall'azienda." },
      { d: "QUANDO", o: ["Stamattina presto", "Prima della pausa caffè", "2026-11-02T08:15:00+01:00"], ok: 2, why: "Il QUANDO è un timestamp ISO 8601 con fuso orario: nessun partner può fraintenderlo." },
      { d: "DOVE", o: ["GLN 0614141007776 · linea 2", "Il capannone dietro", "Chiedi a Mario"], ok: 0, why: "Il DOVE usa un GLN: un indirizzo di sede che ogni partner sa interpretare." },
      { d: "PERCHÉ", o: ["shipping", "commissioning", "retail_selling"], ok: 1, why: "Il lotto sta nascendo adesso: il bizStep CBV giusto è commissioning." }
    ];
    const pick = {};
    show(levelShell(this,
      `<div data-bob>${img("jar", 110)}</div>${img("factory", 140)}<span class="cap">LOTTO L123 · 288 VASETTI · SCADENZA 30/11</span>`,
      `<p class="story">Ogni evento EPCIS è una frase che risponde a poche domande. Componi la prima pagina del diario: scegli una risposta per ogni riga.</p>
       <div class="slots">${rows.map((r, i) => `<div class="slot" id="slot${i}"><span class="dim">${r.d}</span><div class="chips">${r.o.map((t, j) => `<button class="chip" data-r="${i}" data-j="${j}">${t}</button>`).join("")}</div><span class="why" id="why${i}"></span></div>`).join("")}</div>
       <span class="err" id="err"></span>
       <div class="row"><button class="btn" data-primary id="reg">REGISTRA EVENTO</button></div>`));
    $$(".chip").forEach(c => c.onclick = () => {
      const r = c.dataset.r; pick[r] = +c.dataset.j; sfx.sel();
      $("#err").textContent = "";
      $$(`.chip[data-r="${r}"]`).forEach(x => x.classList.toggle("sel", x === c));
      $("#slot" + r).classList.remove("bad", "good"); $("#why" + r).textContent = "";
    });
    $("#reg").onclick = () => {
      if (Object.keys(pick).length < rows.length) { $("#err").textContent = "Scegli una risposta per ogni riga."; return; }
      let wrong = 0;
      rows.forEach((r, i) => {
        const good = pick[i] === r.ok;
        $("#slot" + i).classList.toggle("good", good); $("#slot" + i).classList.toggle("bad", !good);
        $("#why" + i).textContent = good ? "" : r.why;
        if (!good) wrong++;
      });
      if (wrong) fail(`${wrong} ${wrong === 1 ? "riga non è" : "righe non sono"} comprensibili per gli altri partner. Correggi e riprova.`);
      else win();
    };
  }
};
