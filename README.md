# Missione L123

Gioco per spiegare **EPCIS** in modo semplice, realizzato per il Reverse Coaching interno di GS1 Italy.

Il protagonista è un vasetto di yogurt del lotto L123: a ogni tappa della filiera chi gioca scrive una pagina del suo "diario" (un evento EPCIS) e sblocca un superpotere. Alla fine arriva il richiamo del lotto.

> **Versione 2 in lavorazione** (branch `v2`). Il piano completo è in [PLAN.md](PLAN.md). Stato attuale: **Fase 6 · Verifica** completata, più una revisione: grafica chiara in stile illustrazione isometrica vettoriale, interfaccia semplificata e domande più impegnative sui concetti e sui vantaggi di EPCIS.

## Struttura del gioco

Il gioco è pensato per chi parte da zero: testi in italiano semplice, una sola denominazione per ogni concetto e un **glossario** in fondo a ogni tappa.

**Filiera alimentare**, otto tappe, dalla materia prima al ritiro:

1. Alla stalla nasce il lotto: il latte crudo della mungitura riceve il lotto C0471 alla stalla (evento di oggetto, `commissioning`), poi il caseificio ne registra il ricevimento con la stalla come luogo di partenza (`receiving`).
2. Dal latte allo yogurt: l'evento di trasformazione.
3. Nasce il vasetto: le quattro domande di un evento (COSA, QUANDO, DOVE, PERCHÉ).
4. Vista ai raggi X: l'evento di aggregazione.
5. Le parole non si inventano: il vocabolario comune (CBV) e l'avviso di spedizione (DESADV) collegato all'evento di spedizione.
6. Catena del freddo: l'evento di associazione e i sensori.
7. Ops, errore!: la dichiarazione di errore; dopo la correzione il CeDi manda l'avviso di ricevimento (RECADV).
8. Ritiro e richiamo: prima «come una volta», poi con due ricerche nell'archivio degli eventi. Il **ritiro** toglie il prodotto dalla filiera; il **richiamo** avvisa chi lo ha già comprato.

I codici GS1 della filiera alimentare (GTIN, GLN, SSCC, GDTI, GIAI) usano i prefissi aziendali d'esempio della [guida al GLN di GS1 Italy](https://gs1it.org/files/sharing/1464192143/446/gs1-gln.pdf): **800000000** per il caseificio (con la sua stalla, `8000000000033`) e **803208900** per la distribuzione (CeDi di Bologna `8032089002028`, supermercati di Milano e Monza). Il caseificio è `8000000000026`. Non sono codici di aziende reali.

Le informazioni fisse di un lotto (ILMD, Instance/Lot Master Data) usano i termini del [GS1 Web Vocabulary](https://ref.gs1.org/voc/) con il prefisso `gs1:`, già definito nel [contesto JSON-LD ufficiale di EPCIS 2.0](https://ref.gs1.org/standards/epcis/epcis-context.jsonld): `gs1:bestBeforeDate` per la scadenza dello yogurt, `gs1:productionDate` e `gs1:countryOfOrigin` (con `gs1:countryCode`) per il latte crudo. EPCIS 2.0 (sezione 7.3.8) ammette attributi ILMD definiti da altri standard.

La filiera tessile è ancora nel codice ma è spenta: si riattiva aggiungendo `"textile"` in `worlds` dentro `src/config.js`.

Ogni tappa mostra le sue pagine del diario nel formato EPCIS 2.0 (JSON), un superpotere e una scheda «Perché conta». Le voci del **glossario del gioco** si sbloccano giocando. Il finale riassume i vantaggi per produttore, distribuzione e consumatore, in una versione stampabile.

## Come si gioca

Il gioco è pensato per chi gioca da solo, da PC o da telefono.

- **Inizio** e **Mappa** sono sempre nella barra in alto.
- La barra **«La filiera»** mostra tutte le tappe: si clicca una tappa o si usano le frecce per la precedente e la successiva.
- Prima di ogni domanda il riquadro **«Il contesto»** spiega la situazione; la scena 3D si avvicina al punto di cui si parla.
- `H` (o il pulsante **Suggerimento**) mostra un aiuto per la tappa. I progressi restano salvati nel browser.
- `E` (o il pulsante **Eventi**) apre la pagina **archivio degli eventi** (non una finestra sovrapposta): il JSON-LD di tutte le tappe, anche quelle non ancora giocate, un evento alla volta o come documento EPCIS unico, con «Copia il testo». La scheda **«Tutta la filiera»** mostra in un colpo solo tutti gli eventi, dalla stalla al richiamo. La schermata di gioco resta sospesa: con «Torna al gioco» si riprende esattamente dove si era e i conti alla rovescia restano fermi.
- Ogni **GS1 Digital Link** nel JSON (`https://id.gs1.org/...`) è cliccabile: la **lente** lo scompone in Application Identifier (01 GTIN, 10 lotto, 00 SSCC, 414 GLN del luogo, 254 punto nel luogo, 417 GLN dell'azienda, 253 GDTI, 8004 GIAI), con una spiegazione semplice e la cifra di controllo.

`?` mostra in qualsiasi momento la tabella di tutti i comandi.

## Come si apre

Apri `dist/index.html` con un doppio clic: è un unico file, funziona offline, senza server e senza connessione.

| Tasto | Azione |
| --- | --- |
| 1-9 | Scegli un'opzione |
| Invio | Conferma / avanti |
| Esc | Torna alla mappa |
| G | Glossario del gioco (dalla mappa e dalle schermate di riposo) |
| D | Documento EPCIS completo (nella schermata dell'evento) |
| E | Archivio degli eventi (in qualsiasi momento) |
| M | Audio sì/no |
| R | Cambia grafica al volo: 3D o 2D, restando nello stesso punto |
| X | Effetto pixel della grafica 3D (non in qualità bassa) |
| H | Suggerimento |
| ? | Tabella dei comandi |

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
| `src/config.js` | Mondi attivi, renderer, qualità, audio all'avvio |
| `src/content/it.json` | Tutti i testi visibili: interfaccia, tappe, glossari, glossario del gioco, finale |
| `src/levels/` | Un file per livello: testi, superpotere e meccanica |
| `src/data/events/` | Gli eventi EPCIS mostrati nel gioco, un file per livello |
| `schemas/` | Schema JSON ufficiale di EPCIS 2.0, usato dai test |
| `src/styles/tokens.css` | Unica fonte dei colori. `src/tokens.js` viene generato da qui |
| `src/engine/` | Stato, salvataggio, router, tastiera, audio, suggerimento (`modes.js`) |
| `src/ui/notes.js` | Tabella dei comandi |
| `src/anim/` | GSAP: configurazione, effetti, intro animate, tendina tra le schermate, animazioni saltabili |
| `src/render/two/` | Sprite in pixel art e sfondi del ripiego 2D |
| `src/render/three/` | Three.js: stage (renderer, telecamera, luci tarate per i tre toni), materiali di brand, oggetti in stile isometrico vettoriale, scene dei livelli e mappa della filiera |
| `src/render/scene-host.js` | Collega le schermate al renderer: agganci di scena (`hook`), cambio 3D/2D, ritorno automatico al 2D |
| `tests/` | Test unitari (`unit/`) e nel browser (`e2e/`) |

Il logo ufficiale di GS1 Italy è in `assets/gs1-italy-logo.png` e viene incluso nel build in automatico. Sul fondo scuro compare su un riquadro bianco, senza modifiche al marchio. Se il file manca, compare un segnaposto.

## Qualità verificata dai test

| Area | Cosa controllano i test |
| --- | --- |
| EPCIS | Ogni evento è valido contro lo schema JSON ufficiale EPCIS 2.0; cifre di controllo di GTIN, GLN, SSCC; quantità coerenti tra livelli e scene; uso corretto di `action` |
| Percorso | Dal titolo al finale solo con la tastiera, in 3D, in 2D e su smartphone (390×844, movimento ridotto) |
| 3D | GS1 Blue esatto a schermo; ritorno al 2D se il contesto WebGL si perde; tasto R; memoria stabile dopo tre giri; meno di 150 draw call e 100.000 triangoli per scena |
| Accessibilità | axe-core (WCAG 2 A e AA) su titolo, mappa, tappa, evento, glossario del gioco, comandi e finale, in 3D, in 2D e su smartphone |
| Brand | Nessun colore fuori dai token; contrasti AA; Orange e Teal mai a contatto negli sprite |
| Testi | Stile GS1 Italy: numeri da uno a dieci in lettere, «barcode» e «standard» minuscoli, È accentata, plurali stranieri invariati, niente maschile generico, frasi brevi, sigle spiegate |

Per chi usa un lettore di schermo: a ogni cambio di schermata il focus va sul titolo, ogni scena ha una descrizione testuale, il canvas 3D è nascosto alle tecnologie assistive e ogni oggetto 3D cliccabile ha il suo pulsante HTML.

**Non verificato in automatico:** i 60 fotogrammi al secondo in qualità media. I test girano senza scheda video; vanno provati su un portatile reale.

## Stile grafico

Le scene sono illustrazioni isometriche vettoriali originali, costruite in 3D con forme semplici. Ogni oggetto ha tre toni piatti: la faccia superiore mostra esattamente il colore di brand, i due lati visibili sono più scuri (85% e 70%). Le parti ferme di ogni scena sono unite in poche geometrie, così anche le scene ricche restano leggere. Senza WebGL il gioco mostra la versione 2D in pixel art.

## Brand

Colori, tinte derivate e regole sono in [docs/brand-tokens.md](docs/brand-tokens.md). Un test fallisce se nel codice compare un colore scritto a mano fuori dai token.

**Eccezioni da validare con il brand:**

- `--state-error`, un rosso funzionale solo per vite perse e risposte sbagliate, sempre con l'icona ✕.
- **Interfaccia** nello stile dell'app GS1 Italy «Verified by GS1»: font Montserrat e Spline Sans Mono (licenza SIL Open Font License 1.1), inclusi nel file del gioco; i colori dell'interfaccia sono i token `--ui-*` in `src/styles/tokens.css`.

## Licenze di terze parti

| Componente | Licenza |
| --- | --- |
| [Three.js](https://threejs.org) 0.186.1 | MIT |
| [Montserrat](https://github.com/JulietaUla/Montserrat) e [Spline Sans Mono](https://github.com/SorkinType/SplineSansMono), via Fontsource | SIL Open Font License 1.1 |
| [GSAP](https://gsap.com) 3.15.0 | Standard "no charge" license di GSAP (Webflow): uso gratuito anche commerciale, plugin inclusi. Non è una licenza open source: vieta, tra l'altro, l'uso in strumenti che fanno concorrenza a Webflow. Testo: https://gsap.com/standard-license |
| Logo GS1 Italy (`assets/gs1-italy-logo.png`) | Marchio di GS1 Italy, preso dal sito ufficiale gs1it.org, usato senza modifiche |
| Schema EPCIS 2.0 (`schemas/`) | © GS1 AISBL, solo per i test |
| Vite, vite-plugin-singlefile, Vitest, Playwright, Ajv | MIT / Apache 2.0, solo per lo sviluppo, non inclusi nel gioco |

## Fonti

Ogni numero o caso reale nel gioco ha la sua fonte in [SOURCES.md](SOURCES.md). I dati senza fonte affidabile sono stati tolti.

## Dati di esempio

Gli identificativi usati (GTIN, GLN, SSCC, GDTI) usano prefissi GS1 di esempio, non codici di aziende reali. Le cifre di controllo sono verificate da un test, e ogni evento è validato contro lo schema JSON ufficiale di EPCIS 2.0.
