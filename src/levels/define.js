// Unisce la logica di un livello ai suoi testi in it.json e ai suoi eventi EPCIS.
import { t } from "../content/index.js";

export function defineLevel({ slug, id, world, sp, events, mount }) {
  const C = t(`levels.${slug}`);
  return {
    slug, id, world, C, events, mount,
    meta: { ...C.meta, sp },
    intro: C.intro,
    power: C.power,
    fact: C.fact,
    why: C.why,
    captions: C.events
  };
}
