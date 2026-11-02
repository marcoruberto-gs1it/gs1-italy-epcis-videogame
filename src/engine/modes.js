// Modalità di gioco: "sala" (con chi presenta: note e squadre) o "individuale" (suggerimenti).
import { state, commit } from "./state.js";

const listeners = new Set();
export const onModes = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach(fn => fn(state));

/** Stato non salvato: note e suggerimento aperti. */
export const ui = { notes: false, hint: false };

export const isSala = () => state.mode === "sala";
export const teamsOn = () => isSala() && state.teams.on;

export function setMode(mode) {
  state.mode = mode;
  if (mode !== "sala") ui.notes = false;
  commit(); notify();
}

export function toggleTeams() {
  state.teams.on = !state.teams.on;
  state.teams.turn = null;
  commit(); notify();
}

/** A o B: sceglie chi risponde alla prossima domanda. Ripremere lo stesso tasto annulla. */
export function setTurn(team) {
  if (!teamsOn()) return;
  state.teams.turn = state.teams.turn === team ? null : team;
  commit(); notify();
}

/** Risposta giusta: un punto alla squadra di turno, poi il turno si azzera. Restituisce la squadra premiata. */
export function award() {
  if (!teamsOn() || !state.teams.turn) return null;
  const t = state.teams.turn;
  state.teams[t] += 1;
  state.teams.turn = null;
  commit(); notify();
  return t;
}

/** Risposta sbagliata: nessun punto, il turno passa di mano a chi presenta. */
export function clearTurn() {
  if (!teamsOn() || !state.teams.turn) return;
  state.teams.turn = null;
  commit(); notify();
}

export function toggleNotes() {
  if (!isSala()) return;
  ui.notes = !ui.notes;
  notify();
}

export function toggleHint() {
  if (isSala()) return;
  ui.hint = !ui.hint;
  notify();
}
