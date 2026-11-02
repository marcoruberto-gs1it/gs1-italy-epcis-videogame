// Livello 1-2 · Vista ai raggi X: l'AggregationEvent lega il contenuto al contenitore.
import event from "../data/events/food-raggi-x.json";

export default {
  id: "1-2",
  world: "food",
  meta: { t: "Vista ai raggi X", c: "AggregationEvent · packing", sp: "carton", place: "Fabbrica · fine linea" },
  intro: "288 vasetti, 12 cartoni, 1 pallet. Al CeDi nessuno avrà voglia di aprirlo.",
  power: ["VISTA AI RAGGI X", "Con l'aggregazione leggi il pallet e sai cosa c'è dentro, senza aprirlo."],
  event,
  fact: "Il <code>parentID</code> è il pallet, i figli sono i vasetti del lotto L123. Da qui in poi basta leggere l'SSCC per sapere cosa viaggia.",

  mount({ show, levelShell, ask, setMsg, win, sfx, sprite, fx, $ }) {
    const cartons = Array.from({ length: 12 }, () => `<div class="carton"><img class="px" src="${sprite("carton")}" alt=""><div class="jars">${Array.from({ length: 6 }, () => `<img class="px" src="${sprite("minijar")}" alt="">`).join("")}</div></div>`).join("");
    show(levelShell(this,
      `<div class="beam" id="beam"></div><div class="pallet" id="pallet"><div class="cartons">${cartons}</div><img class="px palletbase" src="${sprite("pallet")}" alt=""></div><span class="cap">PALLET SSCC 106141411234567897</span>`,
      `<p class="story">I vasetti finiscono nei cartoni, i cartoni sul pallet. Il CeDi riceverà un blocco filmato: dall'esterno vede solo l'etichetta del pallet.</p>
       <p class="q">Come fa il CeDi a sapere cosa c'è dentro, senza aprirlo?</p>
       <div class="opts" id="opts"></div>
       <div class="row" id="after"></div>`));
    ask($("#opts"), [
      { t: "Apre il pallet e conta i vasetti", why: "Funziona, ma costa tempo e rompe la filmatura. Non è questo il superpotere." },
      { t: "In fabbrica registro un <code>AggregationEvent</code>: i cartoni (figli) entrano nel pallet (padre)", ok: true, why: "Esatto. L'aggregazione lega il contenuto al contenitore. Ora prova lo scanner." },
      { t: "Lo scrivo a mano sul DDT", why: "Un DDT cartaceo non arriva in automatico nei sistemi del CeDi." }
    ], () => {
      $("#after").innerHTML = `<button class="btn" data-primary id="scan">SCANSIONA IL PALLET</button>`;
      $("#scan").onclick = () => {
        sfx.power(); fx.beam($("#beam")); $("#pallet").classList.add("xray");
        $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA EVENTO</button>`;
        setMsg("Una sola lettura, 12 cartoni e 288 vasetti visibili. Ecco la vista ai raggi X.", true);
        $("#reg").onclick = () => win();
      };
    });
  }
};
