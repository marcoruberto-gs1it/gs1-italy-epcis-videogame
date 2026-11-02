// Livello 1-5 · Ops, errore!: gli eventi non si cancellano, si correggono con una dichiarazione di errore.
import event from "../data/events/food-errore.json";

export default {
  id: "1-5",
  world: "food",
  meta: { t: "Ops, errore!", c: "Dichiarazione di errore", sp: "cedi", place: "CeDi di Bologna" },
  intro: "Il pallet arriva al CeDi. Un operatore stanco registra il ricevimento...",
  power: ["MEMORIA ONESTA", "Gli errori si correggono con una dichiarazione, mai cancellando."],
  event,
  fact: "La correzione ripete l'evento sbagliato con un <code>errorDeclaration</code>: motivo standard (<code>incorrect_data</code>) e puntatore all'evento corretto. Niente sparisce, tutto si spiega.",

  mount({ show, levelShell, ask, win, img, $ }) {
    show(levelShell(this,
      `${img("cedi", 150)}<div class="req">receiving · lotto <span class="bad">L132</span> · 288 pz</div><span class="cap">EVENTO GIÀ LETTO DA 3 PARTNER</span>`,
      `<p class="story">Il pallet arriva al CeDi. L'operatore registra il ricevimento ma digita <code>L132</code> invece di <code>L123</code>. L'evento è già stato letto dal produttore, dal trasportatore e dalla sede.</p>
       <p class="q">Che cosa fai?</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    ask($("#opts"), [
      { t: "Cancello l'evento e lo riscrivo giusto", why: "<b>Fine partita per la fiducia.</b> In EPCIS gli eventi non si cancellano: altri sistemi li hanno già letti. Cancellare vuol dire riscrivere la storia di nascosto." },
      { t: "Pubblico una dichiarazione di errore e un evento corretto", ok: true, why: "Così la storia resta onesta: si vedono sia l'errore sia la correzione, con l'ora in cui è stata fatta." },
      { t: "Faccio finta di niente, tanto è una cifra", why: "Il lotto L132 risulterebbe al CeDi. In caso di richiamo cercheresti i vasetti nel posto sbagliato." }
    ], () => {
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA CORREZIONE</button>`;
      $("#reg").onclick = () => win();
    });
  }
};
