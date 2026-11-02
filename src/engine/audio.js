// Effetti chiptune con Web Audio API. Nessun file audio: solo oscillatori.
import { state } from "./state.js";

let actx = null;

function beep(f, d, type = "square", delay = 0, vol = 0.06) {
  if (state.muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + delay;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d);
  } catch {}
}

export const sfx = {
  sel: () => beep(660, 0.06),
  ok: () => { beep(523, .09); beep(659, .09, "square", .09); beep(784, .09, "square", .18); beep(1047, .18, "square", .27); },
  no: () => { beep(220, .14, "sawtooth"); beep(160, .22, "sawtooth", .13); },
  coin: () => { beep(988, .07); beep(1319, .2, "square", .07); },
  power: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, .08, "triangle", i * .06, .08)); },
  tick: () => beep(1200, .02, "square", 0, .03),
  alarm: () => { beep(880, .15, "sawtooth"); beep(660, .15, "sawtooth", .17); beep(880, .15, "sawtooth", .34); }
};
