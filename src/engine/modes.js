// Gioco individuale: l'unico stato di interfaccia condiviso è il suggerimento aperto o chiuso.
const listeners = new Set();
export const onModes = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach(fn => fn());

/** Stato non salvato: suggerimento aperto. */
export const ui = { hint: false };

export function toggleHint() {
  ui.hint = !ui.hint;
  notify();
}
