// Stato del gioco: un solo oggetto, salvato a ogni cambio e osservabile da HUD e schermate.
import { CONFIG } from "../config.js";
import * as storage from "./save.js";

const PERSISTED = ["score", "lives", "done", "powers", "muted", "view"];
const fresh = () => ({
  score: 0, lives: 3, done: {}, powers: [], muted: !CONFIG.audioOnStart,
  view: "title", level: null
});

export const state = fresh();
const listeners = new Set();

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function commit() {
  storage.save(Object.fromEntries(PERSISTED.map(k => [k, state[k]])));
  listeners.forEach(fn => fn(state));
}

export function restore() {
  const saved = storage.load();
  if (saved) { delete saved.mode; delete saved.teams; Object.assign(state, saved); }
}

/** Azzera la partita. Resta la preferenza dell'audio. */
export function resetState() {
  const keep = { muted: state.muted };
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh(), keep);
  commit();
}
