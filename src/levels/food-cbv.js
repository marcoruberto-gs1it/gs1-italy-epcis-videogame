// Livello 1-3 · Le parole non si inventano: il vocabolario CBV.
import event from "../data/events/food-cbv.json";

export default {
  id: "1-3",
  world: "food",
  meta: { t: "Le parole non si inventano", c: "Vocabolario CBV · shipping", sp: "truck", place: "Fabbrica · baia 3" },
  intro: "Il pallet parte per il CeDi di Bologna. Il sistema del CeDi deve capire cosa sta succedendo, senza telefonate.",
  power: ["PARLA CON TUTTI", "Il vocabolario CBV: le stesse parole per ogni sistema della filiera."],
  event,
  fact: "Il CBV dà i verbi (<code>shipping</code>) e gli stati (<code>in_transit</code>). In più l'ordine d'acquisto viaggia agganciato all'evento: fisico e documenti insieme.",

  mount({ show, levelShell, ask, win, img, $, $$ }) {
    show(levelShell(this,
      `<div class="bubble" id="bub">Ciao, sono il CeDi di Bologna. Cosa mi state mandando?</div>${img("person", 64)}${img("truck", 150)}<span class="cap">IL SISTEMA DEL CeDi ASCOLTA</span>`,
      `<p class="story">Il pallet sale sul camion. Ogni azienda ha il suo gergo, ma il sistema del CeDi deve capire l'evento senza alzare il telefono.</p>
       <p class="q">Che parola usi per il bizStep della spedizione?</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    const confuse = () => { const b = $("#bub"); b.className = "bubble bad"; b.textContent = "??? Non conosco questa parola."; };
    const opts = [
      { t: "partito_col_camion", why: "Per il tuo ERP ha senso, per quello del CeDi no. Le parole inventate rompono l'interoperabilità." },
      { t: "SPED-OK", why: "È un codice interno: fuori dall'azienda nessuno sa cosa significa." },
      { t: "shipping", ok: true, why: "È il termine del vocabolario CBV. Ogni sistema conforme sa cosa vuol dire." },
      { t: "uscita_merce", why: "Sembra chiaro in italiano, ma il sistema del partner cerca un termine CBV." }
    ];
    const box = $("#opts");
    ask(box, opts, () => {
      const b = $("#bub"); b.className = "bubble good"; b.textContent = "Ricevuto! Pallet in transito, ordine collegato. Vi aspetto.";
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA EVENTO</button>`;
      $("#reg").onclick = () => win();
    });
    $$(".opt", box).forEach((b, i) => { if (!opts[i].ok) b.addEventListener("click", confuse); });
  }
};
