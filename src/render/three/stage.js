// Stage Three.js: un solo renderer per tutto il gioco, che si sposta nel pannello della scena corrente.
import {
  WebGLRenderer, Scene, OrthographicCamera, AmbientLight, DirectionalLight, Vector3, Vector2, Raycaster,
  SRGBColorSpace, NoToneMapping, PCFShadowMap, ColorManagement
} from "three";
import { gsap, reduced } from "../../anim/gsap-setup.js";
import { lowerQuality } from "../detect.js";

ColorManagement.enabled = true;

export const QUALITY = {
  alta: { dpr: 2, shadow: 1024 },
  media: { dpr: 1.5, shadow: 512 },
  bassa: { dpr: 1, shadow: 0 }
};
// Ambiente + direzionale tarati perché una faccia rivolta in alto in piena luce valga 1,0:
// i materiali Lambert/Toon dividono per π, quindi le intensità sono moltiplicate per π.
const AMBIENT = 0.35;

export class Stage {
  constructor({ quality = "media", onFail = () => {}, onQuality = () => {} } = {}) {
    this.quality = quality;
    this.onFail = onFail;
    this.onQuality = onQuality;
    this.pixelated = false;
    this.renderer = new WebGLRenderer({ antialias: quality !== "bassa", alpha: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.type = PCFShadowMap;
    this.canvas = this.renderer.domElement;
    this.canvas.className = "stage3d";
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); this.fail("contesto WebGL perso"); });
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    this.view = { size: 8, target: new Vector3() };
    this.tweens = new Set();
    this.dirty = true;
    this.fps = { frames: 0, time: 0, slow: 0 };
    this.raycaster = new Raycaster();
    this.tick = this.tick.bind(this);
    this.resize = this.resize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.applyQuality();
  }

  applyQuality() {
    const q = QUALITY[this.quality];
    this.renderer.setPixelRatio(this.pixelated ? 0.34 : Math.min(window.devicePixelRatio || 1, q.dpr));
    this.renderer.shadowMap.enabled = q.shadow > 0;
    if (this.light) {
      this.light.castShadow = q.shadow > 0;
      this.light.shadow.mapSize.set(q.shadow || 1, q.shadow || 1);
      if (this.light.shadow.map) { this.light.shadow.map.dispose(); this.light.shadow.map = null; }
    }
    this.canvas.classList.toggle("pixelated", this.pixelated);
    this.resize();
  }

  setQuality(q) { this.quality = q; this.applyQuality(); this.onQuality(q); }
  togglePixel() { this.pixelated = !this.pixelated && this.quality !== "bassa"; this.applyQuality(); return this.pixelated; }

  /** Mostra una scena costruita da build(api) dentro container. */
  show(container, build) {
    this.clear();
    this.container = container;
    container.prepend(this.canvas);
    this.scene = new Scene();
    const amb = new AmbientLight(0xffffff, Math.PI * AMBIENT);
    this.light = new DirectionalLight(0xffffff, Math.PI * (1 - AMBIENT));
    this.light.position.set(3, 10, 4);
    const s = this.light.shadow.camera;
    s.left = s.bottom = -9; s.right = s.top = 9; s.near = 0.5; s.far = 40;
    this.scene.add(amb, this.light, this.light.target);
    this.content = build(this.api());
    this.scene.add(this.content.root);
    if (this.content.view) Object.assign(this.view, this.content.view);
    this.applyQuality();
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(container);
    this.canvas.addEventListener("pointerdown", this.onPointer);
    gsap.ticker.add(this.tick);
    this.dirty = true;
    return this.content;
  }

  /** Strumenti a disposizione delle scene. */
  api() {
    const stage = this;
    return {
      stage,
      reduced: reduced(),
      /** Tween GSAP che tiene vivo il rendering finché dura. */
      tween(target, vars) {
        // Movimento ridotto o ripresa a metà livello: si salta direttamente allo stato finale.
        if (reduced() || stage.instant) {
          const { duration, delay, ease, yoyo, repeat, stagger, onUpdate, onComplete, ...props } = vars;
          if (!yoyo) gsap.set(target, props);
          if (onUpdate) onUpdate();
          if (onComplete) onComplete();
          stage.dirty = true;
          return null;
        }
        const t = gsap.to(target, { ...vars, onComplete() { stage.tweens.delete(t); if (vars.onComplete) vars.onComplete(); } });
        stage.tweens.add(t);
        return t;
      },
      /** Sposta la telecamera: centro inquadrato e ampiezza della vista. */
      camTo({ x = stage.view.target.x, y = stage.view.target.y, z = stage.view.target.z, size = stage.view.size, duration = 1, ease = "power2.inOut" } = {}) {
        this.tween(stage.view, { size, duration, ease, onUpdate: () => stage.place() });
        return this.tween(stage.view.target, { x, y, z, duration, ease, onUpdate: () => stage.place() });
      },
      invalidate() { stage.dirty = true; }
    };
  }

  place() {
    const { size, target } = this.view;
    const r = this.container ? this.container.getBoundingClientRect() : { width: 4, height: 3 };
    const aspect = r.width / Math.max(1, r.height);
    const h = aspect >= 1 ? size : size / aspect;
    const w = h * aspect;
    Object.assign(this.camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    // Vista isometrica: la telecamera guarda il centro da un angolo, dall'alto.
    this.camera.position.set(target.x + 12, target.y + 11, target.z + 12);
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
    this.light.target.position.copy(target);
    this.light.position.set(target.x + 3, target.y + 10, target.z + 4);
    this.dirty = true;
  }

  resize() {
    if (!this.container || !this.light) return;
    const r = this.container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.renderer.setSize(r.width, r.height, false);
    this.place();
  }

  onPointer(e) {
    const hits = this.content && this.content.clickables;
    if (!hits || !hits.length) return;
    const r = this.canvas.getBoundingClientRect();
    const p = new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(p, this.camera);
    const hit = this.raycaster.intersectObjects(hits, true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o && !o.userData.onClick) o = o.parent;
    if (o) o.userData.onClick(hit.instanceId);
  }

  tick(time, dt) {
    if (!this.scene || document.hidden) return;
    const animating = this.tweens.size > 0 || (this.content.update && this.content.update(dt / 1000, time));
    if (!animating && !this.dirty) return;
    this.renderer.render(this.scene, this.camera);
    this.dirty = false;
    if (animating) this.measure(dt);
  }

  /** Se gli fps restano bassi per qualche secondo abbassa la qualità; in qualità bassa passa al 2D. */
  measure(dt) {
    const f = this.fps;
    f.frames++; f.time += dt;
    if (f.time < 1000) return;
    const fps = (f.frames * 1000) / f.time;
    f.frames = 0; f.time = 0;
    f.slow = fps < (this.quality === "bassa" ? 28 : 45) ? f.slow + 1 : 0;
    if (f.slow < 3) return;
    f.slow = 0;
    if (this.quality === "bassa") this.fail("prestazioni insufficienti");
    else this.setQuality(lowerQuality(this.quality));
  }

  fail(reason) { this.onFail(reason); }

  /** Smonta la scena corrente ed elimina geometrie, materiali e texture creati per lei. */
  clear() {
    gsap.ticker.remove(this.tick);
    this.tweens.forEach(t => t.kill());
    this.tweens.clear();
    if (this.ro) { this.ro.disconnect(); this.ro = null; }
    this.canvas.removeEventListener("pointerdown", this.onPointer);
    if (this.content && this.content.dispose) this.content.dispose();
    if (this.scene) {
      this.scene.traverse(o => {
        if (o.isInstancedMesh) o.dispose();
        if (o.geometry && o.geometry.userData.own) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach(m => { if (m.userData.own) m.dispose(); });
      });
    }
    if (this.light && this.light.shadow.map) { this.light.shadow.map.dispose(); this.light.shadow.map = null; }
    this.renderer.renderLists.dispose();
    this.scene = null; this.content = null; this.light = null;
    if (this.canvas.parentNode) this.canvas.remove();
    this.container = null;
  }

  info() { return this.renderer.info.memory; }

  /** Coordinate di schermo (rispetto al canvas) di un punto della scena. Usato dai test sul colore. */
  project(v) {
    const p = v.clone().project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
  }

  /** Colore [r, g, b, a] del pixel alle coordinate di pagina (x, y), letto subito dopo un rendering. */
  sample(x, y) {
    if (!this.scene) return null;
    const r = this.canvas.getBoundingClientRect(), dpr = this.renderer.getPixelRatio();
    this.renderer.render(this.scene, this.camera);
    const gl = this.renderer.getContext(), buf = new Uint8Array(4);
    gl.readPixels(Math.round((x - r.left) * dpr), Math.round((r.bottom - y) * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    return [...buf];
  }

  destroy() { this.clear(); this.renderer.dispose(); }
}
