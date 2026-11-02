# Missione L123

Gioco arcade per spiegare **EPCIS** in modo semplice, realizzato per il Reverse Coaching interno di GS1 Italy.

Il protagonista è un vasetto di yogurt del lotto L123: a ogni tappa della filiera chi gioca scrive una pagina del suo "diario" (un evento EPCIS) e sblocca un superpotere. Alla fine arriva il richiamo del lotto.

> **Versione 2 in lavorazione** (branch `v2`). Il piano completo è in [PLAN.md](PLAN.md). Stato attuale: **Fase 4 · Three.js** completata. Scene 3D low-poly con ritorno automatico al 2D.

## Struttura del gioco

- **Mondo 1 · Food**: dal latte allo yogurt (trasformazione), le dimensioni di un evento, aggregazione (raggi X), vocabolario CBV, sensori e catena del freddo (AssociationEvent), dichiarazione di errore.
- **Mondo 2 · Tessile**: dal filo al capo (trasformazioni in fila, base del DPP), inventario con RAIN RFID (EPC e vettore), resi e storia del capo. Si può spegnere da `src/config.js`.
- **Sfida finale**: il grande richiamo, prima "come una volta" e poi con due query EPCIS, dal latte ai lotti di yogurt e da lì ai luoghi.

Ogni livello mostra le sue pagine del diario in EPCIS 2.0 JSON (anche dentro un EPCISDocument completo), un superpotere e una scheda "Perché conta". Il **Codex** raccoglie le carte dei concetti, che si sbloccano giocando. Il finale riassume i vantaggi per produttore, distribuzione e consumatore, in una versione stampabile.

## Come si usa in sala

Apri `dist/index.html` con un doppio clic: è un unico file, funziona offline, senza server e senza connessione.

| Tasto | Azione |
| --- | --- |
| 1-9 | Scegli un'opzione |
| Invio | Conferma / avanti. Durante un'animazione la porta subito alla fine |
| Esc | Torna alla mappa |
| G | Codex (dalla mappa e dalle schermate di riposo) |
| D | Documento EPCIS completo (nella schermata dell'evento) |
| M | Audio sì/no |
| C | Effetto CRT sì/no (spento da solo con «riduci movimento») |
| R | Cambia renderer al volo: 3D o 2D, restando nello stesso punto |
| X | Pixelatura leggera del 3D (non in qualità bassa) |

### 3D o 2D

Il gioco parte in 3D se il computer lo permette (WebGL), altrimenti in 2D. In fondo allo schermo un'etichetta dice quale renderer è attivo («R · 3D MEDIA» o «R · 2D»).

- Per forzare un renderer aggiungi all'indirizzo `?render=2d` o `?render=3d`; per la qualità `?quality=alta`, `media` o `bassa`. I valori predefiniti sono in `src/config.js`.
- Se il 3D va lento (sotto 45 fotogrammi al secondo per qualche secondo) la qualità si abbassa da sola. In qualità bassa, se non basta, il gioco passa al 2D.
- Se il contesto WebGL si perde (driver, sospensione del portatile), il gioco continua in 2D senza ricaricare e senza perdere il punto.
- Su smartphone e schermi piccoli il 3D parte in qualità bassa.

I progressi restano salvati nel browser. Per ripartire da capo usa **Ricomincia da zero** nella mappa.

## Come si sviluppa

Serve Node.js 20 o successivo.

```bash
npm install          # installa le dipendenze (versioni fissate)
npm run dev          # gioco in sviluppo su http://localhost:5173
npm run build        # crea dist/index.html, un solo file autonomo
npm test             # test unitari (vitest)
npx playwright test  # percorso completo nel browser, su dist/index.html
```

I test nel browser usano Microsoft Edge già installato sul PC (`channel: "msedge"`), quindi non serve scaricare altri browser. Gli screenshot di ogni schermata finiscono in `docs/screenshots/`.

### Dove si trova cosa

| Cartella | Contenuto |
| --- | --- |
| `src/config.js` | Mondi attivi, renderer, qualità, modalità, audio all'avvio |
| `src/content/it.json` | Tutti i testi visibili: interfaccia, livelli, Codex, finale |
| `src/levels/` | Un file per livello: testi, superpotere e meccanica |
| `src/data/events/` | Gli eventi EPCIS mostrati nel gioco, un file per livello |
| `schemas/` | Schema JSON ufficiale di EPCIS 2.0, usato dai test |
| `src/styles/tokens.css` | Unica fonte dei colori. `src/tokens.js` viene generato da qui |
| `src/engine/` | Stato, salvataggio, router, tastiera, audio |
| `src/anim/` | GSAP: configurazione, effetti, intro animate, tendina tra le schermate, animazioni saltabili |
| `src/render/two/` | Sprite in pixel art, sfondi a strati, effetto CRT |
| `src/render/three/` | Three.js: stage (renderer, telecamera, luci, qualità), materiali di brand, oggetti low-poly, scene dei livelli e diorama della mappa |
| `src/render/scene-host.js` | Collega le schermate al renderer: agganci di scena (`hook`), cambio 3D/2D, ritorno automatico al 2D |
| `tests/` | Test unitari (`unit/`) e nel browser (`e2e/`) |

Il logo ufficiale di GS1 Italy è in `assets/gs1-italy-logo.png` e viene incluso nel build in automatico. Sul fondo scuro compare su un riquadro bianco, senza modifiche al marchio. Se il file manca, compare un segnaposto.

## Brand

Colori, tinte derivate e regole sono in [docs/brand-tokens.md](docs/brand-tokens.md). Un test fallisce se nel codice compare un colore scritto a mano fuori dai token.

**Eccezioni da validare con il brand:**

- `--state-error`, un rosso funzionale solo per vite perse e risposte sbagliate, sempre con l'icona ✕.
- Il font pixel **Press Start 2P**, solo per titoli brevi, HUD, punteggi ed etichette.
- **Verdana** non è incluso nel file perché la licenza Microsoft non lo permette: il gioco usa quello installato sul computer, con Arial come riserva.

## Licenze di terze parti

| Componente | Licenza |
| --- | --- |
| [Three.js](https://threejs.org) 0.186.1 | MIT |
| [GSAP](https://gsap.com) 3.15.0 | Standard "no charge" license di GSAP (Webflow): uso gratuito anche commerciale, plugin inclusi. Non è una licenza open source: vieta, tra l'altro, l'uso in strumenti che fanno concorrenza a Webflow. Testo: https://gsap.com/standard-license |
| Press Start 2P (via `@fontsource/press-start-2p`) | SIL Open Font License 1.1 |
| Logo GS1 Italy (`assets/gs1-italy-logo.png`) | Marchio di GS1 Italy, preso dal sito ufficiale gs1it.org, usato senza modifiche |
| Schema EPCIS 2.0 (`schemas/`) | © GS1 AISBL, solo per i test |
| Vite, vite-plugin-singlefile, Vitest, Playwright, Ajv | MIT / Apache 2.0, solo per lo sviluppo, non inclusi nel gioco |

## Fonti

Ogni numero o caso reale nel gioco ha la sua fonte in [SOURCES.md](SOURCES.md). I dati senza fonte affidabile sono stati tolti.

## Dati di esempio

Gli identificativi usati (GTIN, GLN, SSCC, GDTI) usano prefissi GS1 di esempio, non codici di aziende reali. Le cifre di controllo sono verificate da un test, e ogni evento è validato contro lo schema JSON ufficiale di EPCIS 2.0.
