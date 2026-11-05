// Scene 3D in stile illustrazione isometrica vettoriale: un diorama per livello e la mappa della filiera.
// Ogni scena espone gli stessi agganci (hooks) della versione 2D. Le parti ferme vengono unite (mergeStatic).
import { Group, Mesh, Object3D, RingGeometry, DoubleSide, MeshBasicMaterial, Vector3 } from "three";
import * as P from "./props.js";
import { flat, own, brandColor, toon } from "./materials.js";

const { at } = P;
const dyn = o => { o.userData.dynamic = true; return o; };
const hide = o => { o.scale.setScalar(0.001); o.visible = false; return o; };
const group = (...c) => { const g = new Group(); c.forEach(o => o && g.add(o)); return g; };
const scaled = (o, s) => { o.scale.setScalar(s); return o; };
const POP = { duration: 0.45, ease: "back.out(2)" };

function popIn(api, o, s = 1, delay = 0) {
  o.visible = true;
  return api.tween(o.scale, { x: s, y: s, z: s, delay, ...POP });
}

/** Sciame di cubetti che vola da un punto a un altro (trasformazioni, ingredienti che entrano). */
function swarm(api, root, from, to, token = "gs1-white", n = 12) {
  for (let i = 0; i < n; i++) {
    const c = new Mesh(P.BOX(), flat(token));
    c.scale.setScalar(0.12);
    c.position.set(from.x + (Math.random() - 0.5), from.y + Math.random(), from.z + (Math.random() - 0.5));
    root.add(c);
    api.tween(c.position, { x: to.x, y: to.y, z: to.z, duration: 0.7, delay: i * 0.03, ease: "power2.in", onComplete: () => root.remove(c) });
  }
}

/** Spillo che compare sopra un punto (Forest = fatto, Orange = allarme, White = avviso). */
function flag(api, root, x, y, z, token = "gs1-forest") {
  const m = dyn(hide(at(P.marker(token), x, y, z)));
  root.add(m);
  popIn(api, m);
  return m;
}

/** Zoom sul punto che interessa la domanda: ogni scena indica dove guardare per ciascuna domanda. */
const focusOn = (api, spots) => key => { const f = spots[key]; if (f) api.camTo({ duration: 1.1, ...f }); };

const bobber = objs => (dt, time) => { objs.forEach((o, i) => { o.position.y = o.userData.baseY + Math.abs(Math.sin(time * 3 + i)) * 0.12; }); return true; };

/** Fondale comune: lastra chiara su un prato, con qualche albero ai margini. */
function base(root, w, d, top = "gs1-off-white") {
  root.add(P.grass(w + 1.6, d + 1.6, 0, 0));
  root.add(at(P.slab(w, d, top, "gs1-light-gray", 0, 0, 0.12), 0, 0.05, 0));
  const tx = w / 2 + 0.45, tz = d / 2 + 0.45;
  [[-tx, -tz], [tx, -tz], [-tx, tz * 0.2], [tx * 0.4, -tz]].forEach(([x, z], i) => root.add(P.tree(x, z, 0.8 + (i % 2) * 0.2)));
}

// ---------- Livelli ----------

const LEVELS = {
  "food-latte"(api, ctx) {
    const root = new Group();
    base(root, 9, 6);
    root.add(at(P.factory(), -1.2, 0.05, -2.3), P.silo(-3.6, -2.2), P.silo(-2.9, -1.4, 1.8), at(P.tank(), 0.6, 0.05, -0.4));
    root.add(P.fence(2.6, 3.4, -2.6), P.cow(3.0, -2.0, 0.6), P.cow(3.9, -1.6, -0.4));
    const items = {
      latte: scaled(at(P.tanker(), -2.6, 0.05, 1.9), 0.75),
      fermenti: at(group(P.box("gs1-white", 0.6, 0.4, 0.5), P.box("gs1-forest", 0.62, 0.12, 0.52, 0, 0.14)), 3.3, 0.05, 0.5),
      pallet: at(P.pallet(1.2, 0.9), 3.3, 0.05, 2.0),
      detergente: at(group(P.cyl("gs1-light-gray", 0.22, 0.7), P.cyl("gs1-blue", 0.11, 0.2, 0, 0.7)), 1.9, 0.05, 2.1)
    };
    Object.entries(items).forEach(([id, o]) => { dyn(o); o.userData.onClick = () => ctx.clickHtml(`.ingr[data-id="${id}"]`); root.add(o); });
    const born = dyn(hide(at(P.jar(), 0.6, 0.05, 1.6)));
    born.userData.baseY = 0.05;
    root.add(born);
    let bob = false;
    return {
      root: P.mergeStatic(root), view: { size: 9.2, target: new Vector3(0.3, 0.7, 0) }, clickables: Object.values(items),
      update: (dt, t) => bob && bobber([born])(dt, t),
      hooks: {
        put(id) {
          const o = items[id];
          if (id === "latte") { swarm(api, root, new Vector3(-2.6, 1, 1.9), new Vector3(0.6, 1.8, -0.4), "gs1-white", 14); return; }
          api.tween(o.position, { x: 0.6, y: 2.4, z: -0.4, duration: 0.6, ease: "power2.out" });
          api.tween(o.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3, delay: 0.55, onComplete: () => { o.visible = false; } });
        },
        reject(id) { const o = items[id]; api.tween(o.rotation, { z: 0.3, duration: 0.08, yoyo: true, repeat: 5 }); },
        focus: focusOn(api, { q: { x: 0.6, y: 0.7, z: 0.5, size: 5.6 } }),
        born() {
          swarm(api, root, new Vector3(0.6, 1.8, -0.4), new Vector3(0.6, 0.4, 1.6), "gs1-white", 14);
          popIn(api, born, 1.5, 0.6);
          bob = !api.reduced;
          api.camTo({ x: 0.6, y: 0.6, z: 0.6, size: 6.5 });
        }
      }
    };
  },

  "food-nascita"(api) {
    const root = new Group();
    base(root, 10, 6);
    root.add(at(P.factory(), -2.6, 0.05, -1.8), P.silo(-4.3, -1.9), at(P.conveyor(7), 0, 0.05, 1));
    root.add(group(P.box("gs1-blue-600", 0.15, 1.5, 0.15, 1.8, 0.05, 0.5), P.box("gs1-blue-600", 0.15, 1.5, 0.15, 1.8, 0.05, 1.5), P.box("gs1-teal", 0.15, 0.15, 1.15, 1.8, 1.55, 1)));
    // Vasetti già prodotti che scorrono sul nastro, e il vasetto protagonista.
    const others = [-3.2, -1.2, 3.0].map(x => dyn(scaled(at(P.jar(), x, 0.62, 1), 0.7)));
    const jar = dyn(at(P.jar(), -2.2, 0.62, 1));
    jar.userData.baseY = 0.62;
    root.add(jar, ...others);
    let bob = true;
    return {
      root: P.mergeStatic(root), view: { size: 8.6, target: new Vector3(0, 0.7, 0.2) },
      update(dt, t) {
        if (api.reduced) return false;
        others.forEach(o => { o.position.x += dt * 0.6; if (o.position.x > 3.3) o.position.x = -3.3; });
        if (bob) bobber([jar])(dt, t);
        return true;
      },
      hooks: {
        built() {
          bob = false;
          api.tween(jar.position, { x: 1.8, y: 0.62, duration: 1.2, ease: "power1.inOut", onComplete: () => flag(api, root, 1.8, 2.1, 1) });
        }
      }
    };
  },

  "food-raggi-x"(api) {
    const root = new Group();
    base(root, 9, 7);
    root.add(at(P.shelf(5), 0, 0.05, -2.6), at(P.pallet(3.2, 2.2), 0, 0.05, 0));
    for (const x of [-1.6, 0, 1.6]) root.add(at(P.carton(), x, 0.17, -2.6), at(P.carton(), x, 0.85, -2.6));
    const cartonMat = own("gs1-warm-400", { transparent: true, opacity: 1 });
    const spots = [];
    for (let layer = 0; layer < 2; layer++) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) spots.push([-1 + c * 1.0, 0.29 + layer * 0.64 + 0.3, -0.5 + r * 1.0]);
    const cartons = P.instanced("carton", "gs1-warm-400", spots, { scale: [0.94, 0.6, 0.94], material: cartonMat });
    cartons.count = 0;
    const jarSpots = [];
    spots.forEach(([x, y, z]) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) jarSpots.push([x - 0.37 + i * 0.148, y - 0.22, z - 0.33 + j * 0.22]); });
    const jars = P.instanced("smalljar", "gs1-white", jarSpots);
    jars.visible = false;
    const scan = dyn(new Mesh(P.BOX(), own("gs1-teal", { basic: true, transparent: true, opacity: 0.5 })));
    scan.scale.set(3.6, 0.04, 2.6); scan.visible = false;
    root.add(cartons, jars, scan);
    const o = new Object3D();
    const drop = { y: 0 };
    return {
      root: P.mergeStatic(root), view: { size: 8.0, target: new Vector3(0, 0.8, -0.3) },
      hooks: {
        stack(n) {
          const i = n - 1, [x, y, z] = spots[i];
          cartons.count = n;
          drop.y = y + 2.5;
          api.tween(drop, {
            y, duration: 0.35, ease: "bounce.out",
            onUpdate: () => { o.position.set(x, drop.y, z); o.scale.set(0.94, 0.6, 0.94); o.updateMatrix(); cartons.setMatrixAt(i, o.matrix); cartons.instanceMatrix.needsUpdate = true; }
          });
        },
        focus: focusOn(api, { q: { x: 0, y: 0.9, z: 0, size: 5.4 } }),
        xray() {
          jars.visible = true; scan.visible = true;
          scan.position.set(0, 2, 0);
          api.tween(cartonMat, { opacity: 0.14, duration: 0.6 });
          api.tween(scan.position, { y: 0.25, duration: 1, ease: "steps(10)", onComplete: () => { scan.visible = false; } });
          api.camTo({ size: 5, y: 0.8, z: 0 });
        }
      }
    };
  },

  "food-cbv"(api) {
    const root = new Group();
    base(root, 12, 6);
    root.add(at(P.factory(), -3.6, 0.05, -1.6), P.silo(-5.2, -1.7), at(P.cedi(), 4.0, 0.05, -1.6), at(P.road(11), 0, 0.06, 1.3));
    const truck = dyn(at(P.truck(), -3, 0.06, 1.3));
    root.add(truck);
    return {
      root: P.mergeStatic(root), view: { size: 9.8, target: new Vector3(0, 0.6, 0) },
      hooks: {
        focus: focusOn(api, { q: { x: -2.4, y: 0.8, z: 0.8, size: 5.4 } }),
        confused() { api.tween(truck.position, { z: 1.45, duration: 0.06, yoyo: true, repeat: 5 }); },
        depart() {
          truck.userData.wheels.forEach(w => api.tween(w.rotation, { y: -Math.PI * 6, duration: 1.6, ease: "none" }));
          api.tween(truck.position, { x: 3.2, duration: 1.6, ease: "power1.inOut", onComplete: () => flag(api, root, 4.0, 2.4, -0.3) });
        }
      }
    };
  },

  "food-freddo"(api) {
    const root = new Group();
    root.add(P.grass(14, 7));
    const lanes = dyn(new Group());
    for (let i = -3; i <= 3; i++) lanes.add(at(P.road(4), i * 4, 0.02, 0.6));
    const scenery = dyn(new Group());
    for (let i = -6; i <= 6; i++) { scenery.add(P.tree(i * 1.6, -2.2, 0.9)); if (i % 2) scenery.add(P.bush(i * 1.6 + 0.6, 2.6)); }
    root.add(lanes, scenery);
    const truck = dyn(at(P.truck(), 0, 0.05, 0.6));
    const pal = dyn(at(P.pallet(0.9, 0.7), -3, 0.02, -1.0));
    const sens = dyn(at(P.sensor(), -3, 1.4, -1.0));
    root.add(truck, pal, sens);
    let driving = false;
    return {
      root: P.mergeStatic(root), view: { size: 8.6, target: new Vector3(0, 0.6, 0) },
      update(dt) {
        if (!driving) return false;
        lanes.position.x = (lanes.position.x - dt * 6) % 4;
        scenery.position.x = (scenery.position.x - dt * 3) % 3.2;
        truck.userData.wheels.forEach(w => { w.rotation.y -= dt * 12; });
        return true;
      },
      hooks: {
        focus: focusOn(api, { q1: { x: -2.6, y: 0.9, z: -0.7, size: 4.8 }, q2: { x: 0, y: 0.9, z: 0.5, size: 5.2 } }),
        link() {
          api.camTo({ x: 0, y: 0.6, z: 0, size: 8.6 });
          api.tween(sens.position, { y: 0.3, duration: 0.4, ease: "bounce.out" });
          api.tween(pal.position, { x: -0.6, y: 0.4, z: 0.6, duration: 0.6, delay: 0.5 });
          api.tween(sens.position, { x: -0.6, y: 0.7, z: 0.6, duration: 0.6, delay: 0.5 });
        },
        drive() { driving = !api.reduced; },
        alarm() { driving = false; flag(api, root, 0, 2.4, 0.6, "gs1-orange"); }
      }
    };
  },

  "food-errore"(api) {
    const root = new Group();
    base(root, 9, 6);
    root.add(at(P.cedi(), 0, 0.05, -1.6), at(P.truck(), -3.0, 0.05, 1.6));
    for (const x of [2.6, 3.4]) root.add(at(P.pallet(0.7, 0.6), x, 0.05, 1.6), at(P.carton(), x, 0.29, 1.6));
    const pal = dyn(at(group(P.pallet(1.4, 1), at(P.carton(), 0, 0.24, 0)), 0, 0.05, 1.4));
    root.add(pal);
    return {
      root: P.mergeStatic(root), view: { size: 8.6, target: new Vector3(0, 0.6, 0) },
      hooks: { focus: focusOn(api, { q: { x: 0, y: 0.6, z: 1.2, size: 5.2 } }), fixed() { flag(api, root, 0, 1.8, 1.4); } }
    };
  },

  "tessile-filo"(api) {
    const root = new Group();
    base(root, 13, 5);
    root.add(at(P.cottonField(2.6, 2), -5.2, 0.05, -0.8), at(P.road(12), 0, 0.06, 1.6));
    root.add(...[-1.7, 1.7, 5.1].map(x => scaled(at(P.factory(), x, 0.05, -1.4), 0.7)), at(P.loom(), 1.7, 0.05, 0.2));
    const stations = [P.spool(), P.fabricRoll(), P.garment("gs1-teal")].map((s, i) => dyn(hide(at(s, -1.7 + i * 3.4, 0.05, 0.4))));
    root.add(...stations);
    return {
      root: P.mergeStatic(root), view: { size: 10.3, target: new Vector3(0, 0.6, 0) },
      hooks: {
        step(i) {
          const x = -1.7 + i * 3.4;
          swarm(api, root, new Vector3(i ? x - 3.4 : -5.2, 1, i ? 0.4 : -0.8), new Vector3(x, 0.8, 0.4), "gs1-white", 8);
          popIn(api, stations[i], i === 2 ? 1.6 : 1.4, 0.6);
          flag(api, root, x, 2.2, 0.4);
        }
      }
    };
  },

  "tessile-inventario"(api, ctx) {
    const root = new Group();
    base(root, 10, 6, "gs1-blue-50");
    root.add(at(P.shelf(6.6, 2.6), 0, 0.05, -1.4), at(P.box("gs1-blue", 1.6, 0.9, 0.7), 3.6, 0.05, 1.6));
    const spots = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) spots.push([-2.8 + c * 0.8, 0.6 + r * 0.82, -1.15]);
    const shirts = P.instanced("shirt", "gs1-teal", spots, { material: toon("gs1-white") });
    const teal = brandColor("gs1-teal"), lit = brandColor("gs1-forest");
    spots.forEach((_, i) => shirts.setColorAt(i, teal));
    shirts.userData.onClick = i => { if (i != null) ctx.clickHtml(`.shirt[data-i="${i}"]`); };
    const reader = dyn(at(P.reader(), 0, 0.05, 1.8));
    const ring = dyn(new Mesh(new RingGeometry(0.9, 1.05, 40), new MeshBasicMaterial({ color: brandColor("gs1-teal"), transparent: true, opacity: 0.8, side: DoubleSide, depthWrite: false })));
    ring.geometry.userData.own = true; ring.material.userData.own = true;
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.6, 1.8); ring.visible = false;
    root.add(shirts, reader, ring);
    const paint = (i, c) => { shirts.setColorAt(i, c); shirts.instanceColor.needsUpdate = true; api.invalidate(); };
    return {
      root: P.mergeStatic(root), view: { size: 8.6, target: new Vector3(0, 1, 0) }, clickables: [shirts],
      hooks: {
        focus: focusOn(api, { q3: { x: 0, y: 1.3, z: -0.9, size: 6.2 } }),
        read(i) { paint(i, lit); },
        reset() { spots.forEach((_, i) => shirts.setColorAt(i, teal)); shirts.instanceColor.needsUpdate = true; api.invalidate(); },
        rfid() {
          ring.visible = true; ring.scale.setScalar(0.2); ring.material.opacity = 0.8;
          api.tween(ring.scale, { x: 7, y: 7, z: 7, duration: 1, ease: "power1.out" });
          api.tween(ring.material, { opacity: 0, duration: 1, onComplete: () => { ring.visible = false; } });
          spots.forEach((s, i) => { const d = { v: 0 }; api.tween(d, { v: 1, duration: 0.01, delay: 0.1 + Math.hypot(s[0], s[2] - 1.8) * 0.12, onComplete: () => paint(i, lit) }); });
        }
      }
    };
  },

  "tessile-reso"(api) {
    const root = new Group();
    base(root, 11, 6);
    root.add(at(P.box("gs1-warm-400", 3.4, 0.9, 1), -3, 0.05, 1.2), at(P.store("gs1-orange"), -3, 0.05, -1.6));
    const jacket = x => scaled(at(P.garment("gs1-orange"), x, 0.95, 1.2), 1.4);
    root.add(jacket(-3.8), jacket(-2.2));
    // Il percorso del capo A: fabbrica, CeDi, negozio.
    root.add(scaled(at(P.factory(), 2.0, 0.05, -2.0), 0.55), scaled(at(P.cedi(), 4.6, 0.05, 0.2), 0.55));
    const path = [[1.2, -0.9], [2.2, -0.6], [3.0, -0.2], [3.4, 0.9], [2.4, 1.6], [0.8, 1.8]];
    path.forEach(([x, z]) => root.add(at(P.box("gs1-blue-200", 0.5, 0.06, 0.5), x, 0.05, z)));
    return {
      root: P.mergeStatic(root), view: { size: 9.8, target: new Vector3(0, 0.6, 0) },
      hooks: {
        focus: focusOn(api, { q: { x: -3, y: 1, z: 1, size: 5.4 } }),
        historyA() { api.camTo({ x: 2.2, y: 0.6, z: 0.4, size: 6.4 }); path.forEach(([x, z], i) => { const m = dyn(hide(at(P.marker("gs1-forest"), x, 0.2, z))); root.add(m); popIn(api, m, 0.8, i * 0.15); }); },
        historyB() { api.camTo({ x: -2.6, y: 1, z: 1, size: 5.4 }); const m = dyn(at(P.marker("gs1-dark-gray"), -2.2, 2.8, 1.2)); root.add(m); api.tween(m.position, { y: 1.0, duration: 0.6, ease: "bounce.out" }); }
      }
    };
  },

  "sfida-finale"(api) {
    const root = new Group();
    base(root, 14, 8);
    root.add(at(P.road(13), 0, 0.06, 0.6));
    const places = {
      caseificio: at(P.factory(), -5.4, 0.05, -1.8),
      cedi: at(P.cedi(), -1.5, 0.05, -1.9),
      camion: dyn(scaled(at(P.truck(), 1.6, 0.06, 0.6), 0.8)),
      milano: at(P.store(), 4.8, 0.05, -2.3),
      monza: at(P.store(), 4.8, 0.05, 2.6),
      casa: P.house(0.6, 2.8)
    };
    Object.values(places).forEach(o => root.add(o));
    root.add(P.silo(-6.6, -2.4, 1.8), P.house(-0.8, 3.2), P.house(1.9, 3.3));
    const marks = {};
    return {
      root: P.mergeStatic(root), view: { size: 12.1, target: new Vector3(0, 0.5, 0) },
      hooks: {
        focus: focusOn(api, { q1: { x: -4.6, y: 0.8, z: -1.4, size: 6.2 }, q2: { x: 0, y: 0.5, z: 0, size: 11.5 } }),
        dark() { api.tween(api.stage.scene.children[0], { intensity: Math.PI * 0.35, duration: 0.8 }); },
        found() { const p = places.caseificio.position; marks.caseificio = flag(api, root, p.x, 2.8, p.z, "gs1-white"); api.camTo({ x: -3, size: 9 }); },
        results(lit, notice) {
          api.camTo({ x: 0, size: 10.5 });
          [...lit, ...notice].forEach((id, i) => {
            const p = places[id].position;
            const m = dyn(hide(at(P.marker(notice.includes(id) ? "gs1-white" : "gs1-orange"), p.x, 2.4, p.z)));
            root.add(m); marks[id] = m; popIn(api, m, 1.4, i * 0.15);
          });
        },
        block() { Object.values(marks).forEach((m, i) => api.tween(m.rotation, { y: Math.PI * 2, duration: 0.6, delay: i * 0.1 })); }
      }
    };
  }
};

/** Costruttore della scena 3D di un livello, oppure null se il livello non ne ha. */
export const levelScene = slug => LEVELS[slug] || null;

// ---------- Mappa della filiera ----------

// L'illustrazione di ogni tappa sulla mappa.
const STOP_ART = {
  "1-1": () => group(P.silo(-0.5, -0.3, 1.6), P.cow(0.4, 0.3, 0.5)),
  "1-2": () => scaled(P.factory(), 0.5),
  "1-3": () => group(P.pallet(1, 0.8), at(P.carton(), 0, 0.24, 0)),
  "1-4": () => scaled(P.truck(), 0.45),
  "1-5": () => group(scaled(P.tanker(), 0.45), at(P.sensor(), 0.5, 0, 0.4)),
  "1-6": () => scaled(P.cedi(), 0.45),
  "2-1": () => group(at(scaled(P.factory(), 0.45), 0.2, 0, -0.1), at(P.spool(), -0.6, 0, 0.5)),
  "2-2": () => group(scaled(P.store("gs1-teal"), 0.5), at(P.reader(), 0.6, 0, 0.6)),
  "2-3": () => group(scaled(P.store("gs1-orange"), 0.5), at(P.garment("gs1-orange"), 0.6, 0, 0.6)),
  finale: () => group(scaled(P.cedi(), 0.45), at(scaled(P.marker("gs1-orange"), 1.4), 0, 1.2, 0))
};

// La mappa è una striscia che scorre da sinistra a destra sullo schermo, come l'elenco delle tappe sotto.
// L(a, c): a = lungo la striscia (verso destra), c = verso chi guarda. Gli edifici restano in vista isometrica.
const R2 = Math.SQRT1_2;
const L = (a, c = 0) => new Vector3((a + c) * R2, 0, (c - a) * R2);
const on = (o, a, c, y = 0) => { const v = L(a, c); return at(o, v.x, y, v.z); };
const turned = o => { o.rotation.y = Math.PI / 4; return o; };

// Disposizione di ogni filiera: tappe in fila lungo una strada, con il paesaggio intorno.
const WORLD_MAP = {
  food: {
    gap: 2.95, len: 22,
    decor: root => {
      for (let a = -9; a <= 9; a += 2.4) root.add(on(P.tree(), a, -2.7, 0.12));
      root.add(on(P.fence(2.4), -8.6, -1.7, 0.12), on(P.cow(0, 0, 0.3), -9.2, -0.4, 0.12), on(P.bush(), -2, 2.9, 0.12), on(P.bush(), 5, 2.9, 0.12));
    }
  },
  textile: {
    gap: 3.6, len: 15,
    decor: root => {
      root.add(on(P.cottonField(1.6, 1.6), -6.2, -0.6, 0.12));
      [-3.4, 0, 3.4, 6.4].forEach((a, i) => root.add(on(P.tree(0, 0, 0.8 + (i % 2) * 0.2), a, -2.7, 0.12)));
      root.add(on(P.bush(), -1.6, 2.9, 0.12), on(P.bush(), 4.8, 2.9, 0.12));
    }
  },
  finale: {
    gap: 0, len: 13,
    decor: root => {
      root.add(on(scaled(P.truck(), 0.45), -3.8, -0.3, 0.12), on(scaled(P.store("gs1-orange"), 0.5), 3.6, -0.5, 0.12));
      [-5, -1.8, 1.8, 5.4].forEach(a => root.add(on(P.tree(), a, -2.7, 0.12)));
    }
  }
};

/**
 * Mappa di una filiera: le sue tappe in fila lungo una strada, numerate da etichette HTML (pins).
 * nodes: [{ id, done }] della filiera, here: tappa da giocare, from: tappa mostrata la volta prima.
 * Il clic sulla mappa sceglie la tappa più vicina (equivale al pulsante HTML della tappa).
 */
export function mapScene({ world = "food", nodes, here, from }, ctx) {
  return api => {
    const W = WORLD_MAP[world] || WORLD_MAP.food;
    const root = new Group();
    const pos = n => L((nodes.indexOf(n) - (nodes.length - 1) / 2) * W.gap, -0.3);
    root.add(turned(P.grass(W.len, 6.6)));
    root.add(on(turned(P.road(W.len - 1)), 0, 1.9, 0.02));
    W.decor(root);
    nodes.forEach(n => {
      const p = pos(n);
      root.add(at(P.slab(2.2, 1.8, "gs1-off-white", "gs1-light-gray", 0, 0, 0.12), p.x, 0.12, p.z));
      root.add(at((STOP_ART[n.id] || P.carton)(), p.x, 0.12, p.z - 0.2));
    });
    // Segnaposto della tappa da giocare: un vasetto nel food, una t-shirt nel tessile.
    const token = dyn(world === "textile" ? P.garment("gs1-teal") : scaled(P.jar(), 0.8));
    root.add(token);
    const target = nodes.find(n => n.id === here);
    const start = nodes.find(n => n.id === from) || target;
    const spot = n => pos(n).add(L(0, 1.1));
    let hopping = false;
    if (target && world !== "finale") {
      const p0 = spot(start), p1 = spot(target);
      at(token, p0.x, 0.12, p0.z);
      token.userData.baseY = 0.12;
      if (start !== target) {
        const hop = { t: 0 };
        hopping = true;
        api.tween(hop, {
          t: 1, duration: 1.1, delay: 0.3, ease: "power1.inOut", onComplete: () => { hopping = false; },
          onUpdate: () => { token.position.set(p0.x + (p1.x - p0.x) * hop.t, 0.12 + Math.sin(hop.t * Math.PI) * 2, p0.z + (p1.z - p0.z) * hop.t); }
        });
      }
    } else token.visible = false;
    return {
      root: P.mergeStatic(root),
      // La striscia entra sempre per intero in larghezza; in altezza resta lo spazio per le etichette.
      view: { size: 5.6, width: W.len + 1, target: new Vector3(0, 0.9, 0) },
      // Le etichette numerate stanno sopra ogni tappa.
      pins: nodes.map(n => ({ id: n.id, pos: pos(n).add(new Vector3(0, 1.9, 0)) })),
      /** Clic sul terreno: sceglie la tappa più vicina al punto (x, z). */
      pick(x, z) {
        let best = null, d = 1.6;
        nodes.forEach(n => { const p = pos(n); const dd = Math.hypot(p.x - x, p.z - z); if (dd < d) { d = dd; best = n; } });
        if (best) ctx.clickHtml(`.stop[data-lv="${best.id}"]`);
      },
      update: (dt, t) => (!hopping && target && !api.reduced ? bobber([token])(dt, t) : false),
      // Punto per il test del colore: il tetto in GS1 Blue del caseificio (tappa 1-2), in piena luce.
      probe: () => { const p = pos(nodes[1] || nodes[0]); return new Vector3(p.x + 0.15, 0.12 + 1.45 * 0.5, p.z - 0.05); }
    };
  };
}
