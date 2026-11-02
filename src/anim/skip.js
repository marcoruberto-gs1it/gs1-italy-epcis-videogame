// Animazioni saltabili: Invio le porta subito allo stato finale (timeline.progress(1)).
// Finché ce n'è una attiva, <body data-anim> lo segnala (utile ai test e a chi presenta).
const active = new Set();

const mark = () => {
  if (active.size) document.body.dataset.anim = "running";
  else delete document.body.dataset.anim;
};

/** Registra una tween o timeline come saltabile e la restituisce. */
export function skippable(tl) {
  if (!tl) return tl;
  active.add(tl);
  mark();
  tl.then(() => { active.delete(tl); mark(); });
  return tl;
}

/** Porta alla fine tutte le animazioni saltabili, anche quelle che partono a catena. true se ne ha saltata almeno una. */
export function skipAll() {
  let skipped = false;
  for (let guard = 0; active.size && guard < 50; guard++) {
    for (const tl of [...active]) { active.delete(tl); tl.progress(1); skipped = true; }
  }
  mark();
  return skipped;
}

/** Dimentica le animazioni della schermata precedente (il router le ha già annullate). */
export function clearSkippable() { active.clear(); mark(); }
