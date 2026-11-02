// Configurazione della sessione. Si cambia qui, senza toccare il resto del codice.
export const CONFIG = {
  /** Mondi attivi sulla mappa: togli "textile" per una sessione solo food. */
  worlds: ["food", "textile"],
  /** Renderer delle scene: "auto", "3d" o "2d". Nella Fase 1 esiste solo il 2D. */
  renderer: "auto",
  /** Qualità del 3D: "alta", "media" o "bassa". */
  quality: "media",
  /** Modalità predefinita: "sala" (con chi presenta) o "individuale". */
  mode: "sala",
  /** Audio attivo all'avvio. */
  audioOnStart: true
};
