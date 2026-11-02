// Livello 1-4 · Catena del freddo: i dati del sensore entrano nel COME dell'evento.
import event from "../data/events/food-freddo.json";

export default {
  id: "1-4",
  world: "food",
  meta: { t: "Catena del freddo", c: "Sensori · il COME", sp: "thermo", place: "In viaggio verso Bologna" },
  intro: "Due ore di autostrada. Il pallet viaggia con un sensore di temperatura a bordo.",
  power: ["CATENA DEL FREDDO", "I dati dei sensori viaggiano dentro l'evento: minimo, massimo, allarmi."],
  event,
  fact: "Minimo e massimo viaggiano dentro l'evento, con unità di misura standard (<code>CEL</code>). Chi riceve il pallet sa subito se la catena del freddo ha tenuto.",

  mount({ show, levelShell, ask, win, sfx, img, fx, later, reduced, $ }) {
    show(levelShell(this,
      `<div class="temp" id="temp">${img("thermo", 22)}<span id="tv">4,0 °C</span></div><div class="road" id="road">${img("truck", 110, "truck")}</div><span class="cap">SOGLIA YOGURT · MAX 8 °C</span>`,
      `<p class="story">Il pallet viaggia verso Bologna con un sensore di temperatura a bordo. Lo yogurt deve restare sotto gli 8 °C.</p>
       <div class="row" id="pre"><button class="btn" data-primary id="drive">AVVIA IL VIAGGIO</button></div>
       <div class="stack" id="qa"></div>`));
    $("#drive").onclick = () => {
      $("#pre").innerHTML = "";
      fx.drive($("#road .truck"), $("#road"), 4);
      let t = 40; const end = 90;
      const iv = later.every(() => {
        t += 2; const v = (t / 10).toFixed(1).replace(".", ",");
        $("#tv").textContent = v + " °C"; sfx.tick();
        if (t > 80) $("#temp").classList.add("hot");
        if (t >= end) {
          later.stop(iv); sfx.alarm();
          $("#qa").innerHTML = `<p class="q">Il sensore ha registrato fino a 9 °C. Dove va questa informazione?</p><div class="opts" id="opts"></div><div class="row" id="after"></div>`;
          ask($("#opts"), [
            { t: "In un'email al responsabile qualità", why: "L'email arriva a una persona sola e non è legata al pallet: in caso di problema nessuno la ritrova." },
            { t: "Nel COME dell'evento: <code>sensorElementList</code>", ok: true, why: "Il dato del sensore entra nell'evento ed è collegato a quel pallet, in quel momento, in quel luogo." },
            { t: "In un campo note libero", why: "Un testo libero non si può interrogare né confrontare tra partner." }
          ], () => {
            $("#after").innerHTML = `<button class="btn" data-primary id="reg">REGISTRA EVENTO</button>`;
            $("#reg").onclick = () => win();
          });
        }
      }, reduced() ? 20 : 160);
    };
  }
};
