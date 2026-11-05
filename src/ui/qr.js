// QR code come SVG: un unico tracciato nel colore del testo (currentColor), con il margine bianco richiesto.
import qrcode from "qrcode-generator";

/** Disegna il QR code del testo. Correzione d'errore M: si legge bene anche proiettato o stampato piccolo. */
export function qrSvg(text, { label = "", margin = 4 } = {}) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount(), size = n + margin * 2;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
  return `<svg class="qr" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" class="qr-bg"/><path d="${d}" fill="currentColor"/></svg>`;
}
