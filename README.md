# Missione L123

Gioco arcade per spiegare **EPCIS** in modo semplice, realizzato per il Reverse Coaching interno di GS1 Italy.

Il protagonista è un vasetto di yogurt del lotto L123: a ogni tappa della filiera chi gioca scrive una pagina del suo "diario" (un evento EPCIS) e sblocca un superpotere. Alla fine arriva il richiamo del lotto.

> **Versione 2 in lavorazione** (branch `v2`). Il piano completo è in [PLAN.md](PLAN.md). Stato attuale: **Fase 1 · Fondamenta** completata.

## Struttura del gioco

- **Mondo 1 · Food**: le dimensioni di un evento, aggregazione (raggi X), vocabolario CBV, sensori e catena del freddo, dichiarazione di errore.
- **Mondo 2 · Tessile**: inventario con RAIN RFID (EPC e vettore), resi e storia del capo. Si può spegnere da `src/config.js`.
- **Sfida finale**: il grande richiamo, prima "come una volta" e poi con una query EPCIS.

Ogni livello mostra l'evento in formato EPCIS 2.0 JSON.

## Come si usa in sala

Apri `dist/index.html` con un doppio clic: è un unico file, funziona offline, senza server e senza connessione.

| Tasto | Azione |
| --- | --- |
| 1-9 | Scegli un'opzione |
| Invio | Conferma / avanti |
| Esc | Torna alla mappa |
| M | Audio sì/no |

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
| `src/content/it.json` | Testi dell'interfaccia |
| `src/levels/` | Un file per livello: testi, superpotere e meccanica |
| `src/data/events/` | Gli eventi EPCIS mostrati nel gioco, uno per file |
| `src/styles/tokens.css` | Unica fonte dei colori. `src/tokens.js` viene generato da qui |
| `src/engine/` | Stato, salvataggio, router, tastiera, audio |
| `src/anim/` | Configurazione di GSAP e animazioni |
| `src/render/two/` | Sprite in pixel art |
| `tests/` | Test unitari (`unit/`) e nel browser (`e2e/`) |

Per il logo, aggiungi `assets/gs1-italy-logo.png`: viene incluso nel build in automatico. Finché manca, compare un segnaposto.

## Brand

Colori, tinte derivate e regole sono in [docs/brand-tokens.md](docs/brand-tokens.md). Un test fallisce se nel codice compare un colore scritto a mano fuori dai token.

**Eccezioni da validare con il brand:**

- `--state-error`, un rosso funzionale solo per vite perse e risposte sbagliate, sempre con l'icona ✕.
- Il font pixel **Press Start 2P**, solo per titoli brevi, HUD, punteggi ed etichette.
- **Verdana** non è incluso nel file perché la licenza Microsoft non lo permette: il gioco usa quello installato sul computer, con Arial come riserva.

## Licenze di terze parti

| Componente | Licenza |
| --- | --- |
| [GSAP](https://gsap.com) 3.15.0 | Standard "no charge" license di GSAP (Webflow): uso gratuito anche commerciale, plugin inclusi. Non è una licenza open source: vieta, tra l'altro, l'uso in strumenti che fanno concorrenza a Webflow. Testo: https://gsap.com/standard-license |
| Press Start 2P (via `@fontsource/press-start-2p`) | SIL Open Font License 1.1 |
| Vite, vite-plugin-singlefile, Vitest, Playwright | MIT / Apache 2.0, solo per lo sviluppo, non inclusi nel gioco |

## Dati di esempio

Gli identificativi usati (GTIN, GLN, SSCC, GDTI) usano prefissi GS1 di esempio, non codici di aziende reali. Le cifre di controllo sono verificate da un test.
