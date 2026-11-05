// Avvio di Missione L123.
import "./styles/tokens.css";
import "./styles/fonts.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/cabinet.css";
import "./styles/theme.css";
import "./styles/print.css";

import { state, restore } from "./engine/state.js";
import { go } from "./engine/router.js";
import { initInput } from "./engine/input.js";
import { initHud } from "./ui/hud.js";
import { initNotes } from "./ui/notes.js";
import { initLens } from "./ui/lens.js";
import { initFitLines } from "./ui/dom.js";
import { toggleArchive } from "./ui/archive.js";
import { setArchiveHandler, setResetHandler } from "./ui/hud.js";
import { resetState } from "./engine/state.js";
import { resetMapView } from "./screens/map.js";
import "./screens/title.js";
import "./screens/map.js";
import "./screens/level.js";
import "./screens/win.js";
import "./screens/consumer.js";
import "./screens/final.js";
import "./screens/codex.js";

restore();
initHud();
initInput();
initNotes();
initLens();
initFitLines();
setArchiveHandler(force => toggleArchive(force));
// «Ricomincia da zero» nella barra in alto: azzera la partita (non l'audio) e torna all'inizio.
setResetHandler(() => { toggleArchive(false); resetState(); resetMapView(); go("title"); });

// Alla ripresa di una partita salvata si riparte dalla mappa (o dal finale, se era lì).
if (state.view === "final" || state.view === "consumer") go(state.view);
else if (["map", "intro", "level", "win", "codex"].includes(state.view)) go("map");
else go("title");
