// Oggetti low-poly del gioco, costruiti con geometrie semplici condivise (box, cilindri).
// Le geometrie condivise non si eliminano mai; quelle create per una scena hanno userData.own.
import { Group, Mesh, BoxGeometry, CylinderGeometry, OctahedronGeometry, InstancedMesh, Object3D } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { toon } from "./materials.js";

const G = {};
const geo = (key, make) => G[key] || (G[key] = make());
export const BOX = () => geo("box", () => new BoxGeometry(1, 1, 1));
export const CYL = () => geo("cyl", () => new CylinderGeometry(0.5, 0.5, 1, 14));
export const GEM = () => geo("gem", () => new OctahedronGeometry(0.5, 0));

/** Scatola colorata: dimensioni (w, h, d), posizione del centro della base (x, y, z). */
export function box(token, w, h, d, x = 0, y = 0, z = 0, mat) {
  const m = new Mesh(BOX(), mat || toon(token));
  m.scale.set(w, h, d);
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Cilindro verticale: raggio, altezza, posizione del centro della base. */
export function cyl(token, r, h, x = 0, y = 0, z = 0, mat) {
  const m = new Mesh(CYL(), mat || toon(token));
  m.scale.set(r * 2, h, r * 2);
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

const group = (...children) => { const g = new Group(); children.forEach(c => g.add(c)); return g; };

/** Il vasetto di yogurt del lotto L123, con occhi. */
export function jar() {
  const g = group(
    cyl("gs1-white", 0.3, 0.62),
    cyl("gs1-blue", 0.305, 0.2, 0, 0.12),
    cyl("gs1-orange", 0.33, 0.12, 0, 0.62),
    box("gs1-blue-950", 0.06, 0.1, 0.02, -0.1, 0.4, 0.3),
    box("gs1-blue-950", 0.06, 0.1, 0.02, 0.1, 0.4, 0.3)
  );
  g.name = "jar";
  return g;
}

export const carton = () => group(box("gs1-warm-400", 0.9, 0.6, 0.62), box("gs1-light-gray", 0.14, 0.01, 0.62, 0, 0.6));

export function pallet(w = 3.2, d = 2.2) {
  return group(
    box("gs1-warm-400", w, 0.08, d, 0, 0.16),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, -d / 2 + 0.11),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, 0),
    box("gs1-warm-600", w, 0.16, 0.22, 0, 0, d / 2 - 0.11)
  );
}

/** Camion: rimorchio bianco con banda Teal al centro, cabina Orange separata dal bianco, ruote che girano. */
export function truck() {
  const wheels = [-1.1, 0.1, 1.3].flatMap(x => [-0.5, 0.5].map(z => {
    const w = new Mesh(CYL(), toon("gs1-dark-gray"));
    w.scale.set(0.44, 0.16, 0.44); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z);
    return w;
  }));
  const g = group(
    box("gs1-white", 2.4, 1.1, 1.0, -0.45, 0.3),
    box("gs1-teal", 1.6, 0.12, 1.02, -0.45, 0.8),
    box("gs1-blue-800", 0.2, 0.2, 1.0, 0.85, 0.3),
    box("gs1-orange", 0.8, 0.9, 1.0, 1.3, 0.3),
    box("gs1-blue", 0.3, 0.3, 0.9, 1.56, 0.85),
    ...wheels
  );
  g.userData.wheels = wheels;
  g.name = "truck";
  return g;
}

export function factory() {
  return group(
    box("gs1-blue", 2.4, 1.2, 1.6),
    box("gs1-blue-800", 2.5, 0.12, 1.7, 0, 1.2),
    cyl("gs1-light-gray", 0.18, 1.0, -0.8, 1.3, -0.3),
    box("gs1-white", 0.4, 0.3, 0.02, -0.6, 0.6, 0.8),
    box("gs1-white", 0.4, 0.3, 0.02, 0.6, 0.6, 0.8),
    box("gs1-orange", 0.5, 0.6, 0.02, 0, 0, 0.81)
  );
}

export function cedi() {
  return group(
    box("gs1-blue-600", 3, 1.2, 2),
    box("gs1-blue-800", 3.1, 0.15, 2.1, 0, 1.2),
    box("gs1-white", 2.6, 0.12, 0.02, 0, 0.9, 1.01),
    box("gs1-light-gray", 0.7, 0.7, 0.02, -0.7, 0, 1.01),
    box("gs1-light-gray", 0.7, 0.7, 0.02, 0.7, 0, 1.01)
  );
}

export function store(awning = "gs1-orange") {
  const stripes = [-0.75, -0.25, 0.25, 0.75].map((x, i) => box(i % 2 ? "gs1-white" : awning, 0.5, 0.1, 0.5, x, 1.0, 0.75));
  return group(
    box("gs1-white", 2, 1.0, 1.4),
    box("gs1-blue", 2.1, 0.12, 1.5, 0, 1.0),
    box("gs1-blue-200", 0.5, 0.45, 0.02, -0.6, 0.3, 0.71),
    box("gs1-blue-200", 0.5, 0.45, 0.02, 0.6, 0.3, 0.71),
    box("gs1-blue", 0.4, 0.7, 0.02, 0, 0, 0.71),
    ...stripes
  );
}

export function tank() {
  return group(
    cyl("gs1-light-gray", 1.0, 1.3, 0, 0.4),
    cyl("gs1-white", 0.92, 0.04, 0, 1.7),
    ...[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z]) => box("gs1-warm-600", 0.12, 0.4, 0.12, x, 0, z))
  );
}

export const sensor = () => group(box("gs1-blue-950", 0.34, 0.22, 0.24), box("gs1-forest", 0.08, 0.05, 0.02, 0.08, 0.12, 0.125));

export const spool = () => group(cyl("gs1-warm-600", 0.36, 0.06), cyl("gs1-white", 0.3, 0.5, 0, 0.06), cyl("gs1-warm-600", 0.36, 0.06, 0, 0.56));

export function fabricRoll() {
  const roll = new Mesh(CYL(), toon("gs1-white"));
  roll.scale.set(0.5, 1.4, 0.5); roll.rotation.z = Math.PI / 2; roll.position.y = 0.25; roll.castShadow = true;
  return group(roll);
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

/** Piattaforma di un'isola del diorama, con il piano superiore in GS1 Blue. */
export function island(w, d, top = "gs1-blue") {
  const g = group(box("gs1-blue-800", w, 0.5, d, 0, -0.5), box(top, w, 0.06, d, 0, -0.06));
  g.children[1].name = "island-top";
  return g;
}

export function road(length, w = 1.2) {
  const g = group(box("gs1-dark-gray", length, 0.04, w));
  for (let x = -length / 2 + 0.4; x < length / 2; x += 0.9) g.add(box("gs1-light-gray", 0.4, 0.01, 0.08, x, 0.04));
  return g;
}

export function marker(token = "gs1-orange") {
  const m = new Mesh(GEM(), toon(token));
  m.scale.set(0.4, 0.6, 0.4);
  m.castShadow = true;
  return m;
}

// Geometrie unite per gli oggetti ripetuti (InstancedMesh).
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
  const mesh = new InstancedMesh(g, opts.material || toon(token), positions.length);
  const o = new Object3D();
  positions.forEach(([x, y, z], i) => {
    o.position.set(x, y, z);
    if (opts.scale) o.scale.set(...opts.scale);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.castShadow = !!opts.castShadow;
  mesh.receiveShadow = true;
  mesh.userData.instanced = true;
  return mesh;
}

/** Un singolo capo (t-shirt Teal o giubbotto Orange) con la stessa sagoma usata negli InstancedMesh. */
export function garment(token, y = 0) {
  const m = new Mesh(shirtGeo(), toon(token));
  m.position.y = y + 0.32;
  m.castShadow = true;
  return group(m);
}
