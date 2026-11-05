// Oggetti in stile illustrazione isometrica vettoriale, costruiti con geometrie semplici condivise.
// Le geometrie condivise non si eliminano mai; quelle create per una scena hanno userData.own.
import {
  Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, IcosahedronGeometry, SphereGeometry,
  OctahedronGeometry, InstancedMesh, Object3D, Matrix4, TorusGeometry
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { toon } from "./materials.js";

const G = {};
const geo = (key, make) => G[key] || (G[key] = make());
export const BOX = () => geo("box", () => new BoxGeometry(1, 1, 1));
export const CYL = () => geo("cyl", () => new CylinderGeometry(0.5, 0.5, 1, 18));
export const CONE = () => geo("cone", () => new ConeGeometry(0.5, 1, 8));
export const BALL = () => geo("ball", () => new IcosahedronGeometry(0.5, 0));
export const DOME = () => geo("dome", () => new SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2));
export const GEM = () => geo("gem", () => new OctahedronGeometry(0.5, 0));

const mesh = (g, token, opts) => new Mesh(g, toon(token, opts));
const group = (...children) => { const g = new Group(); children.forEach(c => c && g.add(c)); return g; };
export const at = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };

/** Scatola: dimensioni (w, h, d), posizione del centro della base (x, y, z). */
export function box(token, w, h, d, x = 0, y = 0, z = 0) {
  const m = mesh(BOX(), token);
  m.scale.set(w, h, d);
  m.position.set(x, y + h / 2, z);
  return m;
}

/** Cilindro verticale: raggio, altezza, centro della base. */
export function cyl(token, r, h, x = 0, y = 0, z = 0) {
  const m = mesh(CYL(), token);
  m.scale.set(r * 2, h, r * 2);
  m.position.set(x, y + h / 2, z);
  return m;
}

/** Cilindro orizzontale lungo l'asse x. */
export function hcyl(token, r, len, x = 0, y = 0, z = 0) {
  const m = cyl(token, r, len, 0, 0, 0);
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y + r, z);
  return m;
}

function cone(token, r, h, x = 0, y = 0, z = 0) {
  const m = mesh(CONE(), token, { flat: true });
  m.scale.set(r * 2, h, r * 2);
  m.position.set(x, y + h / 2, z);
  return m;
}

function ball(token, r, x = 0, y = 0, z = 0) {
  const m = mesh(BALL(), token, { flat: true });
  m.scale.setScalar(r * 2);
  m.position.set(x, y + r, z);
  return m;
}

// ---------- Terreno ----------

/** Lastra di terreno: piano superiore nel colore indicato, bordo spesso nel tono più scuro. */
export function slab(w, d, top = "gs1-off-white", side = "gs1-light-gray", x = 0, z = 0, h = 0.3) {
  const g = group(box(side, w, h, d, x, -h, z), box(top, w, 0.04, d, x, -0.04, z));
  g.children[1].name = "slab-top";
  return g;
}

export const grass = (w, d, x = 0, z = 0) => slab(w, d, "gs1-forest-300", "gs1-forest", x, z);

/** Strada lungo x (o lungo z con along = "z"), con la linea tratteggiata. */
export function road(len, along = "x", x = 0, z = 0, w = 1.2) {
  const g = group(box("gs1-dark-gray", along === "x" ? len : w, 0.03, along === "x" ? w : len, x, 0, z));
  for (let i = -len / 2 + 0.4; i < len / 2; i += 0.9) {
    g.add(along === "x" ? box("gs1-white", 0.4, 0.01, 0.07, x + i, 0.03, z) : box("gs1-white", 0.07, 0.01, 0.4, x, 0.03, z + i));
  }
  return g;
}

export function tree(x = 0, z = 0, s = 1) {
  const g = group(cyl("gs1-warm-600", 0.07, 0.4), cone("gs1-forest", 0.35, 0.7, 0, 0.3), cone("gs1-forest-300", 0.27, 0.55, 0, 0.65));
  g.scale.setScalar(s);
  return at(g, x, 0, z);
}

export function bush(x = 0, z = 0, token = "gs1-forest") {
  return at(group(ball(token, 0.22), ball(token, 0.16, 0.2, 0, 0.08)), x, 0, z);
}

/** Recinto lungo x. */
export function fence(len, x = 0, z = 0) {
  const g = group(box("gs1-white", len, 0.05, 0.04, 0, 0.25, 0), box("gs1-white", len, 0.05, 0.04, 0, 0.12, 0));
  for (let i = -len / 2; i <= len / 2 + 0.01; i += 0.5) g.add(box("gs1-white", 0.06, 0.35, 0.06, i, 0, 0));
  return at(g, x, 0, z);
}

// ---------- Animali e persone ----------

export function cow(x = 0, z = 0, ry = 0) {
  const g = group(
    box("gs1-white", 0.7, 0.36, 0.36, 0, 0.28, 0),
    box("gs1-dark-gray", 0.2, 0.2, 0.37, -0.12, 0.38, 0),
    box("gs1-dark-gray", 0.14, 0.14, 0.37, 0.18, 0.3, 0),
    box("gs1-white", 0.24, 0.24, 0.26, 0.42, 0.42, 0),
    box("gs1-orange-100", 0.1, 0.12, 0.2, 0.56, 0.4, 0),
    box("gs1-light-gray", 0.04, 0.08, 0.04, 0.38, 0.66, -0.09),
    box("gs1-light-gray", 0.04, 0.08, 0.04, 0.38, 0.66, 0.09),
    ...[[-0.25, -0.12], [-0.25, 0.12], [0.25, -0.12], [0.25, 0.12]].map(([lx, lz]) => box("gs1-dark-gray", 0.08, 0.28, 0.08, lx, 0, lz))
  );
  g.rotation.y = ry;
  return at(g, x, 0, z);
}

// ---------- Prodotti ----------

// Vasetto: corpo un po' svasato (più largo in alto), come i vasetti di yogurt veri.
const JAR_H = 0.62, JAR_RB = 0.24, JAR_RT = 0.3;
const jarR = y => JAR_RB + (JAR_RT - JAR_RB) * (y / JAR_H);
/** Geometria condivisa ottenuta unendo più pezzi dello stesso colore: una sola chiamata di disegno. */
const merged = (key, parts) => geo(key, () => mergeGeometries(parts.map(([g, m]) => g.clone().applyMatrix4(m))));
const place = (x, y, z, sx = 1, sy = sx, sz = sx, rx = 0) => {
  const o = new Object3D(); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.x = rx; o.updateMatrix(); return o.matrix;
};

/** Il vasetto di yogurt del lotto L123: coperchio con linguetta, etichetta con codice a barre e una faccia simpatica. */
export function jar() {
  const front = y => jarR(y) + 0.004;
  const body = mesh(geo("jarBody", () => new CylinderGeometry(JAR_RT, JAR_RB, JAR_H, 28)), "gs1-white");
  body.position.y = JAR_H / 2;
  // Etichetta blu: una fascia che segue la forma del vasetto.
  const band = mesh(geo("jarBand", () => new CylinderGeometry(jarR(0.3) + 0.006, jarR(0.07) + 0.006, 0.23, 28)), "gs1-blue");
  band.position.y = 0.07 + 0.115;
  // Codice a barre bianco sull'etichetta.
  const bars = mesh(merged("jarBars", [0, 1, 2, 3, 4, 5, 6].map(i => [new BoxGeometry(1, 1, 1),
    place(-0.075 + i * 0.025, 0.185, front(0.185) + 0.006, [0.012, 0.022, 0.008, 0.016, 0.01, 0.02, 0.012][i], 0.12, 0.01)])), "gs1-white");
  // Coperchio arancione: bordo, foglio e linguetta da tirare.
  const lid = mesh(merged("jarLid", [
    [new CylinderGeometry(0.5, 0.5, 1, 28), place(0, JAR_H + 0.025, 0, 0.67, 0.05, 0.67)],
    [new BoxGeometry(1, 1, 1), place(0.33, JAR_H + 0.035, 0.12, 0.1, 0.012, 0.09)]
  ]), "gs1-orange");
  const foil = mesh(geo("jarFoil", () => new CylinderGeometry(0.31, 0.31, 0.012, 28)), "gs1-orange-300");
  foil.position.y = JAR_H + 0.056;
  // Faccia: occhi con riflesso, guance e sorriso.
  const eyes = mesh(merged("jarEyes", [-0.085, 0.085].map(x => [new SphereGeometry(0.5, 12, 10), place(x, 0.43, front(0.43) - 0.01, 0.06, 0.08, 0.04)])), "gs1-blue-950");
  const glints = mesh(merged("jarGlints", [-0.085, 0.085].map(x => [new SphereGeometry(0.5, 8, 6), place(x + 0.012, 0.448, front(0.43) + 0.008, 0.022)])), "gs1-white");
  const cheeks = mesh(merged("jarCheeks", [-0.15, 0.15].map(x => [new SphereGeometry(0.5, 10, 8), place(x, 0.375, front(0.375) - 0.025, 0.06, 0.035, 0.03)])), "gs1-orange-100");
  const smile = mesh(geo("jarSmile", () => new TorusGeometry(0.04, 0.009, 6, 14, Math.PI)), "gs1-blue-950");
  smile.position.set(0, 0.375, front(0.375) - 0.002);
  smile.rotation.z = Math.PI;
  const g = group(body, band, bars, lid, foil, eyes, glints, cheeks, smile);
  g.name = "jar";
  return g;
}

export const carton = () => group(box("gs1-warm-400", 0.9, 0.6, 0.62), box("gs1-white", 0.14, 0.01, 0.62, 0, 0.6));

export function pallet(w = 3.2, d = 2.2) {
  return group(
    box("gs1-warm-400", w, 0.08, d, 0, 0.16),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, -d / 2 + 0.11),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, 0),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, d / 2 - 0.11)
  );
}

export const sensor = () => group(box("gs1-blue-950", 0.34, 0.22, 0.24), box("gs1-forest", 0.08, 0.05, 0.02, 0.08, 0.12, 0.125));
export const spool = () => group(cyl("gs1-warm-600", 0.36, 0.06), cyl("gs1-white", 0.3, 0.5, 0, 0.06), cyl("gs1-warm-600", 0.36, 0.06, 0, 0.56));
export const fabricRoll = () => group(hcyl("gs1-white", 0.25, 1.4, 0, 0, 0), hcyl("gs1-light-gray", 0.08, 1.5, 0, 0.17, 0));

// ---------- Veicoli ----------

function wheels(xs, zs = [-0.5, 0.5]) {
  return xs.flatMap(x => zs.map(z => {
    const w = mesh(CYL(), "gs1-dark-gray");
    w.scale.set(0.44, 0.16, 0.44); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z);
    return w;
  }));
}

/** Camion: rimorchio bianco con banda Teal al centro, cabina Orange separata dal bianco da una fascia Blue. */
export function truck() {
  const ws = wheels([-1.1, 0.1, 1.3]);
  const g = group(
    box("gs1-white", 2.4, 1.1, 1.0, -0.45, 0.3),
    box("gs1-teal", 1.6, 0.12, 1.02, -0.45, 0.8),
    box("gs1-blue-700", 0.2, 0.2, 1.0, 0.85, 0.3),
    box("gs1-orange", 0.8, 0.9, 1.0, 1.3, 0.3),
    box("gs1-blue-200", 0.3, 0.3, 0.9, 1.56, 0.85),
    ...ws
  );
  g.userData.wheels = ws;
  g.name = "truck";
  return g;
}

/** Autocisterna del latte. */
export function tanker() {
  const ws = wheels([-1.0, 0.2, 1.3]);
  const g = group(
    hcyl("gs1-light-gray", 0.5, 2.3, -0.45, 0.3, 0),
    box("gs1-blue", 2.3, 0.08, 0.2, -0.45, 0.55, 0.45),
    box("gs1-blue-700", 0.2, 0.3, 0.9, 0.85, 0.3),
    box("gs1-orange", 0.8, 0.9, 1.0, 1.3, 0.3),
    box("gs1-blue-200", 0.3, 0.3, 0.9, 1.56, 0.85),
    ...ws
  );
  g.userData.wheels = ws;
  return g;
}

// ---------- Edifici e impianti ----------

export function factory() {
  return group(
    box("gs1-white", 2.6, 1.3, 1.8),
    box("gs1-blue", 2.7, 0.15, 1.9, 0, 1.3),
    ...[-0.9, -0.3, 0.3, 0.9].map(x => box("gs1-blue-200", 0.36, 0.36, 0.02, x, 0.7, 0.91)),
    box("gs1-orange", 0.5, 0.6, 0.02, 0.6, 0, 0.91),
    cyl("gs1-light-gray", 0.16, 1.1, -0.9, 1.45, -0.5),
    cyl("gs1-blue", 0.17, 0.12, -0.9, 2.4, -0.5)
  );
}

export function silo(x = 0, z = 0, h = 2.2) {
  return at(group(cyl("gs1-light-gray", 0.45, h), cyl("gs1-blue", 0.46, 0.15, 0, h * 0.7), dome("gs1-blue", 0.45, h)), x, 0, z);
}
function dome(token, r, y) { const m = mesh(DOME(), token); m.scale.setScalar(r * 2); m.position.y = y; return m; }

/** La vasca di acciaio del caseificio. */
export function tank() {
  return group(
    cyl("gs1-light-gray", 1.0, 1.3, 0, 0.4),
    cyl("gs1-white", 0.92, 0.04, 0, 1.7),
    ...[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z]) => box("gs1-dark-gray", 0.12, 0.4, 0.12, x, 0, z)),
    hcyl("gs1-light-gray", 0.08, 1.4, -1.4, 1.2, 0)
  );
}

/** Nastro trasportatore lungo x. */
export function conveyor(len) {
  const g = group(box("gs1-dark-gray", len, 0.12, 0.7, 0, 0.45, 0));
  for (let i = -len / 2 + 0.3; i < len / 2; i += 1.1) g.add(box("gs1-warm-600", 0.1, 0.45, 0.6, i, 0, 0));
  return g;
}

export function cedi() {
  return group(
    box("gs1-blue-600", 3.2, 1.4, 2.2),
    box("gs1-white", 3.3, 0.15, 2.3, 0, 1.4),
    box("gs1-white", 2.6, 0.14, 0.02, 0, 1.1, 1.11),
    ...[-0.9, 0, 0.9].map(x => box("gs1-light-gray", 0.7, 0.8, 0.02, x, 0, 1.11))
  );
}

export function store(awning = "gs1-orange") {
  const stripes = [-0.75, -0.25, 0.25, 0.75].map((x, i) => box(i % 2 ? "gs1-white" : awning, 0.5, 0.12, 0.5, x, 1.0, 0.75));
  return group(
    box("gs1-white", 2, 1.0, 1.4),
    box("gs1-blue", 2.1, 0.14, 1.5, 0, 1.0),
    box("gs1-blue-200", 0.5, 0.45, 0.02, -0.6, 0.3, 0.71),
    box("gs1-blue-200", 0.5, 0.45, 0.02, 0.6, 0.3, 0.71),
    box("gs1-blue", 0.4, 0.7, 0.02, 0, 0, 0.71),
    ...stripes
  );
}

export function house(x = 0, z = 0) {
  const roof = mesh(CONE(), "gs1-blue", { flat: true });
  roof.scale.set(1.25, 0.6, 1.25); roof.rotation.y = Math.PI / 4; roof.position.y = 0.95;
  return at(group(box("gs1-off-white", 0.9, 0.65, 0.9), roof, box("gs1-orange", 0.2, 0.36, 0.02, 0.15, 0, 0.46)), x, 0, z);
}

/** Scaffale a tre ripiani lungo x. */
export function shelf(len, h = 1.8) {
  const g = group(box("gs1-blue-600", 0.08, h, 0.5, -len / 2, 0, 0), box("gs1-blue-600", 0.08, h, 0.5, len / 2, 0, 0));
  for (const y of [0.1, h * 0.36, h * 0.68]) g.add(box("gs1-warm-400", len, 0.06, 0.5, 0, y, 0));
  return g;
}

export function loom() {
  return group(box("gs1-blue-600", 1.4, 0.8, 0.9), hcyl("gs1-light-gray", 0.12, 1.5, 0, 0.8, 0.25), hcyl("gs1-white", 0.18, 1.3, 0, 0.75, -0.2));
}

export function cottonField(w, d) {
  const g = group(slab(w, d, "gs1-forest-300", "gs1-forest"));
  for (let x = -w / 2 + 0.4; x < w / 2; x += 0.6) for (let z = -d / 2 + 0.4; z < d / 2; z += 0.6) {
    g.add(ball("gs1-forest", 0.14, x, 0, z), ball("gs1-white", 0.08, x, 0.2, z));
  }
  return g;
}

/** Lettore RFID / Bip: testa Blue, schermo Teal, occhi, manico. */
export function reader() {
  return group(
    box("gs1-blue", 0.18, 0.5, 0.18, 0, 0),
    box("gs1-blue", 0.6, 0.42, 0.3, 0, 0.5),
    box("gs1-teal", 0.48, 0.28, 0.02, 0, 0.57, 0.16),
    box("gs1-blue-950", 0.06, 0.1, 0.02, -0.1, 0.65, 0.175),
    box("gs1-blue-950", 0.06, 0.1, 0.02, 0.1, 0.65, 0.175)
  );
}

/** Spillo di mappa: segna una tappa o un luogo. */
export function marker(token = "gs1-orange") {
  const g = group(cone(token, 0.18, 0.5, 0, 0, 0), ball(token, 0.24, 0, 0.45, 0));
  g.children[0].rotation.x = Math.PI;
  return g;
}

// ---------- Oggetti ripetuti (InstancedMesh) ----------

const shirtGeo = () => geo("shirt", () => {
  const torso = new BoxGeometry(0.42, 0.52, 0.06);
  const left = new BoxGeometry(0.2, 0.16, 0.06).translate(-0.27, 0.16, 0);
  const right = new BoxGeometry(0.2, 0.16, 0.06).translate(0.27, 0.16, 0);
  return mergeGeometries([torso, left, right]);
});
const smallJarGeo = () => geo("smalljar", () => new CylinderGeometry(0.07, 0.07, 0.16, 8));

/** Tante copie dello stesso oggetto con un solo draw call. positions: array di [x, y, z]. */
export function instanced(kind, token, positions, opts = {}) {
  const g = kind === "shirt" ? shirtGeo() : kind === "smalljar" ? smallJarGeo() : kind === "carton" ? BOX() : CYL();
  const im = new InstancedMesh(g, opts.material || toon(token), positions.length);
  const o = new Object3D();
  positions.forEach(([x, y, z], i) => {
    o.position.set(x, y, z);
    if (opts.scale) o.scale.set(...opts.scale);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.userData.instanced = true;
  return im;
}

/** Un singolo capo (t-shirt Teal o giubbotto Orange) con la stessa sagoma degli InstancedMesh. */
export function garment(token, y = 0) {
  const m = new Mesh(shirtGeo(), toon(token));
  m.position.y = y + 0.32;
  return group(m);
}

/**
 * Unisce le parti ferme di una scena in una geometria per materiale: poche draw call anche con scene ricche.
 * Gli oggetti con userData.dynamic (animati o cliccabili) e gli InstancedMesh restano separati.
 */
export function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new Matrix4().copy(root.matrixWorld).invert();
  const byMat = new Map();
  const removable = [];
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    for (let p = o; p && p !== root; p = p.parent) if (p.userData.dynamic) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(new Matrix4().multiplyMatrices(inv, o.matrixWorld));
    for (const k of Object.keys(g.attributes)) if (!["position", "normal"].includes(k)) g.deleteAttribute(k);
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(g);
    removable.push(o);
  });
  removable.forEach(o => o.parent.remove(o));
  const merged = new Group();
  byMat.forEach((geos, mat) => {
    const g = mergeGeometries(geos);
    geos.forEach(x => x.dispose());
    g.userData.own = true;
    merged.add(new Mesh(g, mat));
  });
  root.add(merged);
  return root;
}
