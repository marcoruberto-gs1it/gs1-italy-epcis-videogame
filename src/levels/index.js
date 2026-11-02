// Elenco dei livelli nell'ordine di gioco. I mondi spenti in config.js non compaiono.
import { CONFIG } from "../config.js";
import nascita from "./food-nascita.js";
import raggiX from "./food-raggi-x.js";
import cbv from "./food-cbv.js";
import freddo from "./food-freddo.js";
import errore from "./food-errore.js";
import inventario from "./tessile-inventario.js";
import reso from "./tessile-reso.js";
import finale from "./sfida-finale.js";

const ALL = [nascita, raggiX, cbv, freddo, errore, inventario, reso, finale];

export const WORLDS = { food: 1, textile: 2 };

export const LEVELS = ALL.filter(l => l.world === "finale" || CONFIG.worlds.includes(l.world));

export const byId = id => LEVELS.find(l => l.id === id);

export const nextOf = id => LEVELS[LEVELS.findIndex(l => l.id === id) + 1];
