// Elenco dei livelli nell'ordine di gioco. I mondi spenti in config.js non compaiono.
import { CONFIG } from "../config.js";
import { t } from "../content/index.js";
import latte from "./food-latte.js";
import nascita from "./food-nascita.js";
import raggiX from "./food-raggi-x.js";
import cbv from "./food-cbv.js";
import freddo from "./food-freddo.js";
import errore from "./food-errore.js";
import filo from "./tessile-filo.js";
import inventario from "./tessile-inventario.js";
import reso from "./tessile-reso.js";
import finale from "./sfida-finale.js";

const ALL = [latte, nascita, raggiX, cbv, freddo, errore, filo, inventario, reso, finale];

export const WORLDS = { food: 1, textile: 2 };

export const LEVELS = ALL.filter(l => l.world === "finale" || CONFIG.worlds.includes(l.world));

export const byId = id => LEVELS.find(l => l.id === id);

export const nextOf = id => LEVELS[LEVELS.findIndex(l => l.id === id) + 1];

/** Carte del Codex dei livelli attivi, con il livello che le sblocca. */
export const CODEX = t("codex.cards")
  .map(card => ({ ...card, level: LEVELS.find(l => l.slug === card.unlock) }))
  .filter(card => card.level);

export const codexOf = level => CODEX.filter(c => c.level === level);

/** Tappe per la mappa 3D: mondo e stato di completamento. */
export const mapNodes = done => LEVELS.map(l => ({ id: l.id, world: l.world, done: !!done[l.id] }));
