// Il vasetto di yogurt del lotto L123 come illustrazione vettoriale (titolo, tappe, finale), solo colori GS1 Italy.
import { color } from "../../tokens.js";

const c = color;

/** SVG del vasetto: occhi aperti o chiusi (per farlo sbattere le palpebre). */
function jarSvg(blink) {
  const eyes = blink
    ? `<path d="M41 66q7 5 14 0M65 66q7 5 14 0" fill="none" stroke="${c("gs1-blue-950")}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<ellipse cx="48" cy="64" rx="5.5" ry="7.5" fill="${c("gs1-blue-950")}"/><ellipse cx="72" cy="64" rx="5.5" ry="7.5" fill="${c("gs1-blue-950")}"/>
       <circle cx="50" cy="61" r="2" fill="${c("gs1-white")}"/><circle cx="74" cy="61" r="2" fill="${c("gs1-white")}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150">
  <ellipse cx="60" cy="143" rx="34" ry="5" fill="${c("gs1-blue-950")}" fill-opacity=".12"/>
  <path d="M19 38h82l-10 96a8 8 0 0 1-8 7H37a8 8 0 0 1-8-7z" fill="${c("gs1-white")}" stroke="${c("gs1-light-gray")}" stroke-width="2"/>
  <path d="M86 38h15l-10 96a8 8 0 0 1-8 7h-5z" fill="${c("gs1-blue-50")}"/>
  <path d="M26 44h6l-2 26h-5z" fill="${c("gs1-blue-50")}"/>
  <path d="M24.3 92h71.4l-3 30H27.3z" fill="${c("gs1-blue")}"/>
  <path d="M84 92h11.7l-3 30H82z" fill="${c("gs1-blue-800")}"/>
  <text x="31" y="112" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="12" fill="${c("gs1-white")}">L123</text>
  <g fill="${c("gs1-white")}"><rect x="72" y="99" width="2" height="15"/><rect x="75.5" y="99" width="1" height="15"/><rect x="78" y="99" width="2.5" height="15"/><rect x="82" y="99" width="1" height="15"/><rect x="84.5" y="99" width="2" height="15"/></g>
  <rect x="12" y="27" width="96" height="14" rx="7" fill="${c("gs1-orange")}"/>
  <path d="M16 27a44 9 0 0 1 88 0z" fill="${c("gs1-orange-300")}"/>
  <path d="M100 33l13-4a3 3 0 0 1 3.5 3.8l-3 6.4-13.5-1.2z" fill="${c("gs1-orange")}"/>
  <rect x="20" y="37" width="80" height="3" fill="${c("gs1-orange-700")}" fill-opacity=".35"/>
  ${eyes}
  <ellipse cx="38" cy="77" rx="6" ry="3.5" fill="${c("gs1-orange-100")}"/><ellipse cx="82" cy="77" rx="6" ry="3.5" fill="${c("gs1-orange-100")}"/>
  <path d="M53 75q7 7 14 0" fill="none" stroke="${c("gs1-blue-950")}" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;
}

const uri = svg => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace(/\s*\n\s*/g, " "));

/** Illustrazioni vettoriali disponibili come sprite: nome → data URL. */
export const VECTOR = {
  jar: () => uri(jarSvg(false)),
  jarBlink: () => uri(jarSvg(true))
};
