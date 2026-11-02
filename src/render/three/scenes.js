// Scene 3D dei livelli e diorama della mappa. Ogni scena espone gli stessi agganci (hooks) della versione 2D.
import { Group, Mesh, Object3D, RingGeometry, DoubleSide, MeshBasicMaterial, Vector3 } from "three";
import * as P from "./props.js";
import { toon, flat, own, brandColor } from "./materials.js";

const at = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };
const hide = o => { o.scale.setScalar(0.001); o.visible = false; return o; };
const POP = { duration: 0.45, ease: "back.out(2)" };

/** Fa comparire un oggetto con un rimbalzo. */
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

/** Piccolo marcatore che compare sopra un oggetto (✓ Forest, allarme Orange). */
function flag(api, root, x, y, z, token = "gs1-forest") {
  const m = hide(at(P.marker(token), x, y, z));
  root.add(m);
  popIn(api, m);
  return m;
}

function bobber(objs) {
  return (dt, time) => { objs.forEach((o, i) => { o.position.y = o.userData.baseY + Math.abs(Math.sin(time * 3 + i)) * 0.12; }); return true; };
}

// ---------- Livelli ----------

const LEVELS = {
  "food-latte"(api, ctx) {
    const root = new Group();
    root.add(P.island(9, 6));
    const tank = at(P.tank(), 0, 0, -0.5);
    root.add(tank);
    const items = {
      latte: at(new Group().add(P.cyl("gs1-white", 0.35, 0.9), P.cyl("gs1-blue", 0.36, 0.2, 0, 0.5)), -3, 0, 1.5),
      fermenti: at(new Group().add(P.box("gs1-white", 0.6, 0.4, 0.5), P.box("gs1-forest", 0.62, 0.12, 0.52, 0, 0.14)), -3, 0, -1),
      pallet: at(P.pallet(1.4, 1), 3, 0, 1.5),
      detergente: at(new Group().add(P.cyl("gs1-light-gray", 0.25, 0.8), P.cyl("gs1-blue", 0.12, 0.2, 0, 0.8)), 3, 0, -1)
    };
    Object.entries(items).forEach(([id, o]) => { o.userData.onClick = () => ctx.clickHtml(`.ingr[data-id="${id}"]`); root.add(o); });
    const born = hide(at(P.jar(), 0, 0, 1.8));
    root.add(born);
    born.userData.baseY = 0;
    let bob = false;
    return {
      root, view: { size: 6.8, target: new Vector3(0, 0.8, 0) }, clickables: Object.values(items),
      update: (dt, t) => bob && bobber([born])(dt, t),
      hooks: {
        put(id) {
          const o = items[id];
          api.tween(o.position, { x: 0, y: 2.6, z: -0.5, duration: 0.6, ease: "power2.out" });
          api.tween(o.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.3, delay: 0.55, onComplete: () => { o.visible = false; } });
        },
        reject(id) { const o = items[id]; api.tween(o.rotation, { z: 0.4, duration: 0.08, yoyo: true, repeat: 5 }); },
        born() {
          swarm(api, root, new Vector3(0, 2, -0.5), new Vector3(0, 0.4, 1.8), "gs1-white", 14);
          popIn(api, born, 1.6, 0.6);
          bob = !api.reduced;
          api.camTo({ x: 0, y: 0.6, z: 0.8, size: 6.5 });
        }
      }
    };
  },

  "food-nascita"(api) {
    const root = new Group();
    root.add(P.island(10, 6), at(P.factory(), 0, 0, -1.8));
    root.add(P.box("gs1-dark-gray", 7, 0.4, 0.8, 0, 0, 1));
    const gate = new Group().add(P.box("gs1-blue-600", 0.15, 1.4, 0.15, 1.5, 0, 0.5), P.box("gs1-blue-600", 0.15, 1.4, 0.15, 1.5, 0, 1.5), P.box("gs1-blue-600", 0.15, 0.15, 1.15, 1.5, 1.4, 1));
    root.add(gate);
    const jar = at(P.jar(), -2.5, 0.4, 1);
    jar.userData.baseY = 0.4;
    root.add(jar);
    let bob = true;
    return {
      root, view: { size: 6.4, target: new Vector3(0, 0.6, 0) },
      update: (dt, t) => bob && !api.reduced && bobber([jar])(dt, t),
      hooks: {
        built() {
          bob = false;
          api.tween(jar.position, { x: 1.5, y: 0.4, duration: 1.2, ease: "steps(8)", onComplete: () => flag(api, root, 1.5, 2.1, 1) });
        }
      }
    };
  },

  "food-raggi-x"(api) {
    const root = new Group();
    root.add(P.island(9, 7), at(P.pallet(3.2, 2.2), 0, 0, 0));
    const cartonMat = own("gs1-warm-400", { transparent: true, opacity: 1 });
    // 12 cartoni su due strati (3 x 2 x 2), 24 vasetti in ognuno.
    const spots = [];
    for (let layer = 0; layer < 2; layer++) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) spots.push([-1 + c * 1.0, 0.24 + layer * 0.64 + 0.3, -0.5 + r * 1.0]);
    const cartons = P.instanced("carton", "gs1-warm-400", spots, { scale: [0.94, 0.6, 0.94], material: cartonMat, castShadow: true });
    cartons.count = 0;
    root.add(cartons);
    const jarSpots = [];
    spots.forEach(([x, y, z]) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) jarSpots.push([x - 0.37 + i * 0.148, y - 0.22, z - 0.33 + j * 0.22]); });
    const jars = P.instanced("smalljar", "gs1-white", jarSpots);
    jars.visible = false;
    root.add(jars);
    const scan = new Mesh(P.BOX(), own("gs1-teal", { basic: true, transparent: true, opacity: 0.55 }));
    scan.scale.set(3.6, 0.04, 2.6); scan.visible = false;
    root.add(scan);
    const o = new Object3D();
    const drop = { y: 0 };
    return {
      root, view: { size: 6.0, target: new Vector3(0, 0.8, 0) },
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
        xray() {
          jars.visible = true; scan.visible = true;
          scan.position.set(0, 2, 0);
          api.tween(cartonMat, { opacity: 0.14, duration: 0.6 });
          api.tween(scan.position, { y: 0.2, duration: 1, ease: "steps(10)", onComplete: () => { scan.visible = false; } });
          api.camTo({ size: 5, y: 0.7 });
        }
      }
    };
  },

  "food-cbv"(api) {
    const root = new Group();
    root.add(P.island(12, 6), at(P.factory(), -3, 0, -1.5), at(P.cedi(), 4.5, 0, -1.5));
    const truck = at(P.truck(), -2, 0, 1.2);
    root.add(truck);
    return {
      root, view: { size: 7.2, target: new Vector3(0, 0.6, 0) },
      hooks: {
        confused() { api.tween(truck.position, { z: 1.35, duration: 0.06, yoyo: true, repeat: 5 }); },
        depart() {
          truck.userData.wheels.forEach(w => api.tween(w.rotation, { y: -Math.PI * 6, duration: 1.4, ease: "none" }));
          api.tween(truck.position, { x: 3.5, duration: 1.4, ease: "power1.inOut", onComplete: () => flag(api, root, 4.5, 2, -0.3) });
        }
      }
    };
  },

  "food-freddo"(api) {
    const root = new Group();
    root.add(P.island(12, 6, "gs1-blue-800"));
    const lanes = new Group();
    for (let i = -3; i <= 3; i++) lanes.add(at(P.road(4), i * 4, 0, 0.6));
    root.add(lanes);
    const truck = at(P.truck(), 0, 0.05, 0.6);
    root.add(truck);
    const pal = at(P.pallet(0.9, 0.7), -2.5, 0, -1.6);
    const sens = at(P.sensor(), -2.5, 1.4, -1.6);
    root.add(pal, sens);
    let driving = false;
    return {
      root, view: { size: 6.4, target: new Vector3(0, 0.6, 0) },
      update(dt) {
        if (!driving) return false;
        lanes.position.x = ((lanes.position.x - dt * 6) % 4);
        truck.userData.wheels.forEach(w => { w.rotation.y -= dt * 12; });
        return true;
      },
      hooks: {
        link() {
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
    root.add(P.island(9, 6), at(P.cedi(), 0, 0, -1.4));
    const pal = at(new Group().add(P.pallet(1.4, 1), at(P.carton(), 0, 0.24, 0)), 0, 0, 1.4);
    root.add(pal);
    return {
      root, view: { size: 6.0, target: new Vector3(0, 0.6, 0) },
      hooks: { fixed() { flag(api, root, 0, 1.8, 1.4); } }
    };
  },

  "tessile-filo"(api) {
    const root = new Group();
    root.add(P.island(12, 5));
    const stations = [P.spool(), P.fabricRoll(), P.garment("gs1-teal")];
    stations.forEach((s, i) => { root.add(at(P.box("gs1-blue-600", 2, 0.3, 1.6), -4 + i * 4, 0, 0)); root.add(hide(at(s, -4 + i * 4, 0.3, 0))); });
    return {
      root, view: { size: 7.2, target: new Vector3(0, 0.6, 0) },
      hooks: {
        step(i) {
          if (i > 0) swarm(api, root, new Vector3(-4 + (i - 1) * 4, 1, 0), new Vector3(-4 + i * 4, 0.8, 0), "gs1-white", 8);
          popIn(api, stations[i], i === 2 ? 1.6 : 1.4, i > 0 ? 0.6 : 0);
          flag(api, root, -4 + i * 4, 2, 0);
        }
      }
    };
  },

  "tessile-inventario"(api, ctx) {
    const root = new Group();
    root.add(P.island(10, 6), at(P.box("gs1-warm-600", 6.6, 2.6, 0.3), 0, 0, -1.2));
    const spots = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) spots.push([-2.8 + c * 0.8, 0.5 + r * 0.8, -0.95]);
    const shirts = P.instanced("shirt", "gs1-teal", spots, { material: toon("gs1-white") });
    const teal = brandColor("gs1-teal"), lit = brandColor("gs1-forest");
    spots.forEach((_, i) => shirts.setColorAt(i, teal));
    shirts.userData.onClick = i => { if (i != null) ctx.clickHtml(`.shirt[data-i="${i}"]`); };
    root.add(shirts);
    const reader = at(P.reader(), 0, 0, 1.8);
    root.add(reader);
    const ring = new Mesh(new RingGeometry(0.9, 1.05, 40), new MeshBasicMaterial({ color: brandColor("gs1-teal"), transparent: true, opacity: 0.8, side: DoubleSide, depthWrite: false }));
    ring.geometry.userData.own = true; ring.material.userData.own = true;
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.6, 1.8); ring.visible = false;
    root.add(ring);
    const paint = (i, c) => { shirts.setColorAt(i, c); shirts.instanceColor.needsUpdate = true; api.invalidate(); };
    return {
      root, view: { size: 6.0, target: new Vector3(0, 1, 0) }, clickables: [shirts],
      hooks: {
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
    root.add(P.island(11, 6), at(P.box("gs1-warm-400", 3.4, 0.9, 1), -2.6, 0, 1));
    const jacket = x => { const j = at(P.garment("gs1-orange"), x, 0.9, 1); j.scale.setScalar(1.4); return j; };
    root.add(jacket(-3.4), jacket(-1.8));
    const path = [[0.5, -1.8], [1.6, -1.2], [2.6, -1.9], [3.4, -0.9], [4.2, -0.2], [4.6, 1.2]];
    path.forEach(([x, z]) => root.add(at(P.box("gs1-blue-600", 0.5, 0.1, 0.5), x, 0, z)));
    return {
      root, view: { size: 6.8, target: new Vector3(0.5, 0.6, 0) },
      hooks: {
        historyA() { path.forEach(([x, z], i) => { const m = hide(at(P.marker("gs1-forest"), x, 0.6, z)); root.add(m); popIn(api, m, 0.8, i * 0.15); }); },
        historyB() { const m = at(P.marker("gs1-dark-gray"), -1.8, 2.6, 1); root.add(m); api.tween(m.position, { y: 0.4, duration: 0.6, ease: "bounce.out" }); }
      }
    };
  },

  "sfida-finale"(api) {
    const root = new Group();
    root.add(P.island(14, 8, "gs1-blue-800"));
    root.add(at(P.road(10), 0, 0, 0.4));
    const places = {
      caseificio: at(P.factory(), -5.5, 0, -1.5),
      cedi: at(P.cedi(), -1.5, 0, -1.8),
      camion: at(P.truck(), 1.8, 0.05, 0.4),
      milano: at(P.store(), 4.8, 0, -2.4),
      monza: at(P.store(), 4.8, 0, 2.6),
      casa: at(P.box("gs1-white", 1, 0.8, 1), 0.5, 0, 2.8)
    };
    places.camion.scale.setScalar(0.8);
    Object.values(places).forEach(o => root.add(o));
    const marks = {};
    return {
      root, view: { size: 8.8, target: new Vector3(0, 0.5, 0) },
      hooks: {
        dark() { api.tween(api.stage.scene.children[0], { intensity: Math.PI * 0.12, duration: 0.8 }); },
        found() { const p = places.caseificio.position; marks.caseificio = flag(api, root, p.x, 2.6, p.z, "gs1-white"); api.camTo({ x: -3, size: 9 }); },
        results(lit, notice) {
          api.camTo({ x: 0, size: 11 });
          [...lit, ...notice].forEach((id, i) => {
            const p = places[id].position;
            const m = hide(at(P.marker(notice.includes(id) ? "gs1-white" : "gs1-orange"), p.x, 2.4, p.z));
            root.add(m); marks[id] = m; popIn(api, m, 1.2, i * 0.15);
          });
        },
        block() { Object.values(marks).forEach((m, i) => api.tween(m.rotation, { y: Math.PI * 2, duration: 0.6, delay: i * 0.1 })); }
      }
    };
  }
};

/** Costruttore della scena 3D di un livello, oppure null se il livello non ne ha. */
export const levelScene = slug => LEVELS[slug] || null;

// ---------- Diorama della mappa ----------

const PROP = {
  factory: P.factory, jar: P.jar, carton: () => P.carton(), truck: P.truck, thermo: P.sensor, cedi: P.cedi,
  shirt: () => P.spool(), reader: P.reader, jacket: () => P.garment("gs1-orange"), alarm: () => P.marker("gs1-orange")
};

/**
 * Diorama isometrico: un'isola per livello lungo un sentiero, il vasetto che salta da una tappa all'altra.
 * nodes: [{ id, sp, done, row, col }], here: id della tappa corrente, from: tappa precedente.
 */
export function mapScene({ nodes, here, from }, ctx) {
  return api => {
    const root = new Group();
    const pos = n => new Vector3(n.col * 3.4, 0, n.row * 3.6);
    nodes.forEach(n => {
      const p = pos(n);
      const isl = at(P.island(2.4, 2.4), p.x, 0, p.z);
      isl.userData.onClick = () => ctx.clickHtml(`.node[data-lv="${n.id}"]`);
      isl.name = "island-" + n.id;
      const prop = at((PROP[n.sp] || P.carton)(), p.x - 0.35, 0, p.z - 0.35);
      const s = n.sp === "cedi" || n.sp === "factory" ? 0.45 : n.sp === "truck" ? 0.5 : 1;
      prop.scale.setScalar(s);
      root.add(isl, prop);
      if (n.done) root.add(at(P.marker("gs1-forest"), p.x + 0.7, 1, p.z + 0.7));
    });
    for (let i = 1; i < nodes.length; i++) {
      const a = pos(nodes[i - 1]), b = pos(nodes[i]);
      const mid = a.clone().lerp(b, 0.5), len = a.distanceTo(b) - 2.2;
      if (len <= 0) continue;
      const seg = at(P.box("gs1-light-gray", len, 0.05, 0.25), mid.x, -0.04, mid.z);
      seg.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      root.add(seg);
    }
    // Centro del diorama: media delle posizioni delle isole.
    const center = nodes.reduce((c, n) => c.add(pos(n)), new Vector3()).divideScalar(Math.max(1, nodes.length));
    const jar = P.jar();
    jar.scale.setScalar(0.9);
    const target = nodes.find(n => n.id === here);
    const start = nodes.find(n => n.id === from) || target;
    let hopping = false;
    if (target) {
      const p0 = pos(start), p1 = pos(target);
      at(jar, p0.x + 0.5, 0, p0.z + 0.5);
      jar.userData.baseY = 0;
      root.add(jar);
      if (start !== target) {
        const hop = { t: 0 };
        hopping = true;
        api.tween(hop, {
          t: 1, duration: 1.1, delay: 0.3, ease: "power1.inOut", onComplete: () => { hopping = false; },
          onUpdate: () => { jar.position.set(p0.x + 0.5 + (p1.x - p0.x) * hop.t, Math.sin(hop.t * Math.PI) * 2, p0.z + 0.5 + (p1.z - p0.z) * hop.t); }
        });
        api.camTo({ x: center.x + (p1.x - center.x) * 0.4, z: center.z + (p1.z - center.z) * 0.4, duration: 1.4 });
      }
    }
    return {
      root,
      view: { size: 11, target: center },
      clickables: root.children.filter(o => o.userData.onClick),
      update: (dt, t) => (!hopping && target && !api.reduced ? bobber([jar])(dt, t) : false),
      probe: () => { const n = nodes[0], p = pos(n); return new Vector3(p.x + 0.9, 0, p.z + 0.9); }
    };
  };
}
