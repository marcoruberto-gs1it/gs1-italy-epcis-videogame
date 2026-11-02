// Stato del gioco: un solo oggetto, salvato a ogni cambio e osservabile da HUD e schermate.
import { CONFIG } from "../config.js";
import * as storage from "./save.js";

const PERSISTED = ["score", "lives", "done", "powers", "muted", "crt", "view"];
const fresh = () => ({ score: 0, lives: 3, done: {}, powers: [], muted: !CONFIG.audioOnStart, crt: true, view: "title", level: null });

export const state = fresh();
const listeners = new Set();

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function commit() {
  storage.save(Object.fromEntries(PERSISTED.map(k => [k, state[k]])));
  listeners.forEach(fn => fn(state));
}

export function restore() {
  const saved = storage.load();
  if (saved) Object.assign(state, saved);
}

/** Azzera la partita, mantenendo le preferenze indicate (ad esempio l'audio). */
export function resetState(keep = {}) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh(), keep);
  commit();
}
