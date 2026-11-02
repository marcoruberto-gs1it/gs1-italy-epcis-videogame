// Salvataggio dei progressi in localStorage. Il gioco funziona anche se lo storage non è disponibile.
const KEY = "missione-l123";
const VERSION = 3;

export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.v === VERSION ? data.state : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: VERSION, state }));
  } catch {}
}

export function clear() {
  try { window.localStorage.removeItem(KEY); } catch {}
}
