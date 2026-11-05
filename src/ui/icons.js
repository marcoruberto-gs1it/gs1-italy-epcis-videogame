// Icone a tratto (24×24, colore del testo), nello stile dell'app GS1 Italy «Verified by GS1».
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  map: '<path d="m9 4-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  sound: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.7-2.8 2.7"/><path d="M12 17h.01"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M10 12.5c-1 0-1.2.6-1.2 1.2v.3c0 .5-.3.8-.8.8.5 0 .8.3.8.8v.3c0 .6.2 1.2 1.2 1.2M14 12.5c1 0 1.2.6 1.2 1.2v.3c0 .5.3.8.8.8-.5 0-.8.3-.8.8v.3c0 .6-.2 1.2-1.2 1.2"/>',
  reset: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 3.5v5h5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  prev: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>'
};

/** SVG decorativo: il nome accessibile lo dà il testo del pulsante. */
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name]}</svg>`;
