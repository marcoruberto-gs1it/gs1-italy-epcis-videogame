// Livello 2-2 · Il reso sospetto: la storia del capo (pedigree) interrogando il repository EPCIS.
import event from "../data/events/tessile-reso.json";

export default {
  id: "2-2",
  world: "textile",
  meta: { t: "Il reso sospetto", c: "Storia del capo · pedigree", sp: "jacket", place: "Negozio di Roma" },
  intro: "Due clienti riportano lo stesso modello di giubbotto. Nessuno dei due ha lo scontrino.",
  power: ["PEDIGREE", "La storia del capo dice se è autentico: resi, anticontraffazione, DPP."],
  event,
  fact: "La sequenza di eventi è il pedigree del capo: chi l'ha prodotto, dove è passato, dove è stato venduto. È la base per resi, anticontraffazione e Passaporto Digitale di Prodotto.",

  mount({ show, levelShell, ask, win, sfx, img, $ }) {
    const histA = [["03/09", "commissioning · Fabbrica di Biella"], ["10/09", "shipping · Biella → CeDi"], ["11/09", "receiving · CeDi di Piacenza"], ["19/09", "shipping · CeDi → negozio"], ["20/09", "receiving · Negozio di Milano"], ["12/10", "retail_selling · Negozio di Milano"]];
    show(levelShell(this,
      `<div class="jackets">
         <div class="jk">${img("jacket", 64)}<span class="sn">CAPO A<br>JK-0457</span><button class="btn alt" data-key="8" id="qa1">INTERROGA</button><div class="tl" id="tlA"></div></div>
         <div class="jk">${img("jacket", 64)}<span class="sn">CAPO B<br>JK-9999</span><button class="btn alt" data-key="9" id="qb1">INTERROGA</button><div class="tl" id="tlB"></div></div>
       </div><span class="cap">STESSO GTIN 09506000134369 · SERIALI DIVERSI</span>`,
      `<p class="story">Negozio di Roma. Due giubbotti identici tornano indietro senza scontrino. Interroga il repository EPCIS e leggi la storia di ciascun seriale.</p>
       <p class="q">Quale reso accetti?</p>
       <div class="opts" id="opts"></div><div class="row" id="after"></div>`));
    const showA = () => { $("#tlA").innerHTML = histA.map(([d, e]) => `<div><span>${d}</span><span>${e}</span></div>`).join(""); };
    const showB = () => { $("#tlB").innerHTML = `<div class="none"><span>0 eventi trovati. Nessuna fabbrica del brand ha mai creato questo seriale.</span></div>`; };
    $("#qa1").onclick = () => { sfx.sel(); showA(); };
    $("#qb1").onclick = () => { sfx.no(); showB(); };
    ask($("#opts"), [
      { t: "Capo A · JK-0457", ok: true, why: "Il capo A ha una storia completa: prodotto a Biella, venduto a Milano il 12/10. Reso accettato." },
      { t: "Capo B · JK-9999", why: "Il capo B non ha storia: quel seriale non è mai nato. Probabile contraffazione." },
      { t: "Entrambi, sembrano uguali", why: "Visti da fuori sì. Ma solo uno dei due ha un passato verificabile." }
    ], () => {
      showA(); showB();
      $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA IL RESO</button>`;
      $("#reg").onclick = () => win();
    });
  }
};
