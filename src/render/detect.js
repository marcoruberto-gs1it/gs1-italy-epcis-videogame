// Scelta del renderer (3D o 2D) e della qualità all'avvio.
import { CONFIG } from "../config.js";

const QUALITIES = ["bassa", "media", "alta"];

/** true se il browser può creare un contesto WebGL. */
export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

const isSmallScreen = () => Math.min(window.innerWidth, window.innerHeight) < 600 || matchMedia("(pointer: coarse)").matches;

/** Renderer iniziale: ?render=2d|3d nell'URL, poi config.js, poi rilevamento automatico. */
export function initialRenderer() {
  let wanted = CONFIG.renderer;
  try {
    const p = new URLSearchParams(location.search).get("render");
    if (p === "2d" || p === "3d") wanted = p;
  } catch {}
  if (wanted === "2d") return "2d";
  return webglAvailable() ? "3d" : "2d";
}

/** Qualità iniziale del 3D: su smartphone e schermi piccoli si parte in qualità bassa. */
export function initialQuality() {
  let q = QUALITIES.includes(CONFIG.quality) ? CONFIG.quality : "media";
  try {
    const p = new URLSearchParams(location.search).get("quality");
    if (QUALITIES.includes(p)) q = p;
  } catch {}
  return isSmallScreen() ? "bassa" : q;
}

export const lowerQuality = q => QUALITIES[Math.max(0, QUALITIES.indexOf(q) - 1)];
