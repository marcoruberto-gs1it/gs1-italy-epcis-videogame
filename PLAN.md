# Missione L123 · v2 — piano di lavoro

Fase 0 · Analisi. Questo documento descrive come porto il gioco attuale (un solo `index.html`, 834 righe) alla versione v2 descritta nel prompt "Missione L123 · v2 — prompt per Claude Code". Prima di partire con la Fase 1 serve il tuo via libera e una risposta ai dubbi della sezione 9.

---

## 1. Cosa ho trovato nel codice attuale

**Struttura.** Un'unica IIFE con: sprite in pixel art da matrici di caratteri (`SPR` + `PAL`), audio a oscillatori (`beep`/`sfx`), stato in memoria (`state`), un renderer HTML a stringhe (`show()`), sette livelli più la sfida finale in un oggetto `LEVELS`, tastiera globale (`1-9`, `Invio`, `Esc`, `M`).

**Da conservare** (confermato): metafora del diario e dei superpoteri, vasetto del lotto L123, flusso mappa → intro → livello → evento registrato con JSON che si scrive riga per riga → power-up, sfida finale in due round, comandi da tastiera, `prefers-reduced-motion`, sprite come base del 2D, prefissi GS1 di esempio.

**Da cambiare, già individuato:**

| Punto | Dove | Nota |
|---|---|---|
| "boss" | 26 occorrenze: id livello, classi CSS (`.world.boss`, `.node.boss`), testi ("BOSS FINALE", "ZONA BOSS", "AFFRONTA IL BOSS", "BOSS SCONFITTO", "BOSS"), README | Diventa `finale` / "Sfida finale" ovunque |
| `window.claude.hot` | righe 308-310 | Rimosso |
| Colori fuori palette | `--sky #00b6de`, `--lime #7ac143`, `--pink #f05587`, `--gold #fbb034`, `--danger #ff5a5f`, legno `#c69c6d`/`#8a6a43`, sfondi `#00102b`, `#000c22`, `#0d4a2a` | Mappatura in sezione 5 |
| VT323 per il corpo testo | `--font-body` | Sostituito da Verdana |
| Font da Google Fonts | `<link>` in testa | Font pixel incluso in locale |
| Testi in inglese da arcade | "GAME CLEAR", "PREMI START", "CONTINUE?", "HI-SCORE", "1 CREDIT" | Restano solo come etichette brevi da arcade (titoli e HUD), da validare |

**Cifre di controllo.** Ho verificato tutti gli identificativi usati oggi: GTIN `09506000134352`, `09506000134376`, `09506000134369`; SSCC `106141411234567897`; GLN `0614141007776`, `0614141000005`, `0614141000012`; GDTI `0614141000012…`. **Sono tutti corretti.**

## 2. Problemi di correttezza EPCIS da sistemare

| # | Livello oggi | Problema | Correzione proposta |
|---|---|---|---|
| a | 1-2 Aggregazione | La storia parla di 12 cartoni sul pallet, ma i figli dell'evento sono i 288 vasetti. La scena disegna 6 vasetti per cartone (72 in tutto), non 24 | Due livelli di aggregazione, coerenti con la scena: **24 vasetti per cartone, 12 cartoni, 288 vasetti**. Ogni cartone ha un SSCC di esempio (12 SSCC); l'evento del pallet ha `childEPCs` = i 12 SSCC dei cartoni. L'aggregazione vasetti → cartone (24 per cartone, `childQuantityList`) compare come "pagina precedente" nel diario. La scena 2D e 3D mostra 24 vasetti per cartone con i raggi X |
| b | Sfida finale | Trova 288 vasetti ma ne mette 264 in `recalled`; un solo evento con il GLN della fabbrica | 264 = 288 − 24 già venduti. Propongo **un evento `recalled` per ogni luogo** (CeDi, camion, due negozi) con la sua quantità e il suo `bizLocation`, per un totale di 264; i 24 già venduti generano un **avviso al consumatore**, non un evento sul prodotto. Lo dichiaro a schermo: "264 bloccati + 24 avvisi = 288" |
| c | 1-5 Errore | L'operatore sbaglia il lotto (L132), ma l'evento di ricevimento identifica solo l'SSCC, dove il lotto non compare | L'evento sbagliato registra `quantityList` con lotto L132 (quindi il lotto è davvero nell'evento). La dichiarazione di errore ripete quell'evento con lo stesso `eventID` più `errorDeclaration`; l'evento corretto ha L123. Mostro entrambi nel diario |
| d | 1-3 Spedizione | Mancano `sourceList`/`destinationList` richiesti dal livello CBV | Aggiungo `owning_party`/`location` di origine e destinazione con GLN di esempio |
| e | 1-1 Nascita | `bestBeforeDate` in `ilmd` va bene; manca la trasformazione dal latte | Il nuovo livello 1-1 (`TransformationEvent`, senza `action`) precede la nascita del vasetto |
| f | Casi reali | Walmart, NHS Scan4Safety e Decathlon senza fonte | Vedi sezione 7. Il dato Walmart viene da un progetto di tracciabilità su blockchain (IBM Food Trust), non da EPCIS: va presentato con onestà, come esempio del valore della tracciabilità a eventi, non come risultato di EPCIS |

La query della sfida finale (`GET /events?MATCH_anyEPCClass=…`) è coerente con l'interfaccia REST di EPCIS 2.0: la tengo. Dopo il collegamento con la trasformazione, il round 2 parte dal lotto di latte e risale ai due lotti di yogurt prima di interrogare il repository.

## 3. Architettura

Stack come da prompt: **Vite + JavaScript ES** (niente TypeScript: il codice resta semplice da leggere per chi lo riprende in IT), **Three.js** e **GSAP** da npm con versione fissata, **vite-plugin-singlefile** per avere un solo `dist/index.html`.

```
index.html                 guscio: cabinato, HUD, #scene, #ui, #notes
src/
  main.js                  avvio: detect renderer → router → titolo
  config.js                mondi attivi, renderer, qualità, modalità, audio
  tokens.js                ← generato da styles/tokens.css (vedi sotto)
  engine/
    state.js               stato del gioco + eventi di cambio (piccolo store a eventi)
    router.js              schermate: title, map, intro, level, win, finale, end, codex, help
    input.js               tastiera e tocco, mappa tasti → azioni
    audio.js               sfx e due temi chiptune (Web Audio)
    save.js                localStorage con try/catch, versione del salvataggio
  anim/
    gsap-setup.js          default, plugin, matchMedia per reduced-motion
    timelines.js           intro livelli, finale, scrittura JSON
    transitions.js         tendine e zoom tra schermate
  render/
    detect.js              WebGL disponibile? qualità? → '3d' | '2d'
    stage.js               interfaccia comune: mount/unmount/hooks + cambio a caldo
    three/                 stage, materiali toon, props/, fx/
    two/                   atlante sprite, scene a strati, crt
  levels/                  food-1-1.js … food-1-6.js, textile-2-1.js … 2-3.js, sfida-finale.js
  content/it.json          tutti i testi visibili
  data/events/             un .json per evento (fonte unica anche per i test)
  gs1/                     cifre di controllo, costruzione URI Digital Link
  styles/                  tokens.css, base.css, components.css, print.css
assets/                    gs1-italy-logo.png, font/
tests/                     unit (vitest) + e2e (playwright)
```

**Fonte unica dei colori.** `styles/tokens.css` è la fonte; uno script Vite (`scripts/tokens.js`) genera `src/tokens.js` a ogni avvio e build. Un test fallisce se nel codice compare un esadecimale fuori da questi due file.

**Contratto dei livelli** come da prompt (`id, world, meta, intro, scene3d, scene2d, mount, event, power, value, speakerNotes`). `scene3d` e `scene2d` restituiscono `{ update, dispose, hooks }` con gli stessi agganci; `mount(ui, ctx)` riceve `ctx.scene.hooks` e non sa quale renderer è attivo. Ogni livello lavora dentro un `gsap.context()` che viene fatto `revert()` all'uscita.

**Cambio di renderer a caldo** (`R`, `?render=`, `webglcontextlost`): `stage.js` chiama `dispose()` sulla scena attiva, monta l'altra e le passa lo **stato visivo** del livello (es. raggi X già attivi, 17 capi letti), così si continua dallo stesso punto.

**Peso stimato** di `dist/index.html`: Three.js con tree-shaking 450–650 KB, GSAP 70 KB, codice e testi 150 KB, font pixel 20 KB, logo inline. Totale atteso **circa 1–1,5 MB**, sotto il limite di 3 MB.

## 4. Livelli

Numerazione nuova: i livelli esistenti scorrono di un posto per far spazio alle trasformazioni.

| v2 | Oggi | Titolo | Evento | Meccanica | Superpotere |
|---|---|---|---|---|---|
| 1-1 | nuovo | Dal latte allo yogurt | `TransformationEvent` latte + fermenti → L123 (e L124, stesso latte) | Trascina gli ingredienti nella vasca, poi "aggregazione o trasformazione?" | ALBERO GENEALOGICO |
| 1-2 | 1-1 | Nasce il vasetto | `ObjectEvent` `ADD` `commissioning` | Componi COSA/QUANDO/DOVE/PERCHÉ; ogni risposta giusta aggiunge un pezzo del vasetto | DNA DIGITALE |
| 1-3 | 1-2 | Vista ai raggi X | `AggregationEvent` `ADD` `packing` (vasetti → cartoni, cartoni → pallet) | Impila 12 cartoni, poi scansione ai raggi X | VISTA AI RAGGI X |
| 1-4 | 1-3 | Le parole non si inventano | `ObjectEvent` `OBSERVE` `shipping`, `bizTransactionList`, `sourceList`/`destinationList` | Scegli la parola CBV tra varianti gergali | PARLA CON TUTTI |
| 1-5 | 1-4 | Catena del freddo | `AssociationEvent` `ADD` sensore ↔ pallet, poi `ObjectEvent` con `sensorElementList` | Associa il sensore, avvia il viaggio, decidi dove va il dato | CATENA DEL FREDDO |
| 1-6 | 1-5 | Ops, errore! | `errorDeclaration` + evento correttivo | Scegli come correggere senza cancellare | MEMORIA ONESTA |
| 2-1 | nuovo | Dal filo al capo | `TransformationEvent` ×3 filato → tessuto → capo | Collega le tappe nell'ordine giusto | FILO ROSSO |
| 2-2 | 2-1 | Inventario lampo | `ObjectEvent` `OBSERVE` `cycle_counting` | Barcode a clic contro un impulso RFID, con cronometro | LETTURA LAMPO |
| 2-3 | 2-2 | Il reso sospetto | `ObjectEvent` `OBSERVE` `receiving` `returned` | Interroga due seriali, la storia scorre sulla mappa | PEDIGREE |
| finale | boss | Il grande richiamo | query + `ObjectEvent` `holding` `recalled` per luogo | Round 1 come una volta, round 2 dal lotto di latte ai lotti di yogurt | RICHIAMO CHIRURGICO |

I superpoteri passano da 8 a 10. Il mondo tessile si spegne da `config.js`: la mappa, l'HUD dei poteri, il Codex e la scheda finale si adattano.

## 5. Brand: mappatura dei colori

| Oggi | Uso | Diventa |
|---|---|---|
| `--sky #00b6de` | etichette, bordi, raggi | `--gs1-teal #22BCB9` |
| `--lime #7ac143` | successo, power-up | `--gs1-forest #00B74F` |
| `--gold #fbb034` | punteggio, evidenze, hover | `--gs1-orange #F26334` per punteggio/CTA, `--gs1-white` per testo evidenziato |
| `--pink #f05587` | cuori | eliminato: cuori in `--gs1-orange` |
| `--danger #ff5a5f` | errori | `--state-error` (da validare con il brand), sempre con icona ✕ |
| `#00102b`, `#000c22`, `#001a45` | sfondi | `--gs1-blue-900`, `--gs1-blue-800` |
| `#c69c6d`, `#8a6a43` | legno, cartone | tinte calde derivate dai neutri (`--neutral-wood-*`), documentate |

**Tinte derivate.** Le calcolo in OKLCH partendo dal colore di brand, cambiando solo la luminosità (passi di ±8% L) e mantenendo tinta e croma: così restano riconoscibili come "GS1 Blue più scuro", non come colori nuovi. La tabella con i valori finiti va in `docs/brand-tokens.md`.

**Separazione Orange/Teal.** Regola nei componenti (bordo Blue di 2 px tra i due) e test automatico che cerca nella pagina elementi Orange adiacenti a elementi Teal.

**Verdana.** È un font di sistema Microsoft: non si può includere nel build (la licenza non lo permette). Uso `Verdana, Arial, sans-serif`, presente su Windows e macOS, che sono i computer della sessione. Su Linux e Android si vede Arial o il sans-serif di sistema.

## 6. Direzione artistica

**Narratore: "Bip".** Un piccolo lettore barcode con due occhi sul vetrino di lettura e un raggio che fa da sorriso. Parla nelle intro con fumetti in HTML. Corpo GS1 Blue, raggio Teal, piedini squadrati. Nome breve, pronunciabile da proiettore, nessun legame con personaggi esistenti. Alternative: "Lettorino", "Scan".

**Mappa a diorama isometrico (3D)**, una "isola" per mondo collegata da una strada:

```
 FOOD                                            TESSILE
 [stalla]→[caseificio]→[linea]→~~autostrada~~→[CeDi]→[negozio alimentari]
                                                          ┊
                          [filatura]→[tessitura]→[confezione]→[negozio abbigliamento]
```

Il vasetto (o il capo) salta da una tappa all'altra; la telecamera lo segue con GSAP. Le tappe completate hanno una stella e l'icona del superpotere.

**Scene dei livelli (3D, low-poly toon):**
- 1-1 vasca d'acciaio con due tubi; i lotti di latte e fermenti sono cubi che si trascinano dentro; particelle Teal che si ricompongono in vasetti.
- 1-3 pallet di legno, 12 cartoni con `InstancedMesh`, 288 vasetti in `InstancedMesh`; con i raggi X l'involucro passa a trasparente e un piano Teal scorre dall'alto in basso.
- 1-5 autostrada su un nastro che scorre, camion con ruote che girano, termometro in HTML sopra la scena.
- 2-2 scaffale con 24 capi (`InstancedMesh`), anello RFID che si espande e "accende" i capi uno dopo l'altro.
- Finale: la mappa si oscura e si accendono solo i punti dove si trovano i lotti coinvolti.

**Ripiego 2D.** Stesse scene, con gli sprite attuali ridisegnati in palette di brand, sfondi a 2–3 strati e gli stessi agganci (`xray`, `scanRFID`, `highlight`).

## 7. Fonti e numeri da verificare

| Dato oggi | Stato | Cosa propongo |
|---|---|---|
| Walmart, manghi: 6 giorni e 18 ore → 2,2 secondi | Dato pubblico molto citato (Frank Yiannas, Walmart, 2017–2018) ma riferito a una tracciabilità su blockchain con IBM Food Trust | Lo tengo con la fonte e una nota onesta: "tracciabilità a eventi", non "EPCIS" |
| NHS Scan4Safety: 8,33 giorni → meno di 35 minuti | Da trovare la fonte primaria (report del programma Scan4Safety del Department of Health) | Se non la trovo, lo segno "da verificare" o lo tolgo |
| Decathlon: accuratezza inventario dal 70% al 95% | Da verificare: esistono comunicazioni pubbliche di Decathlon sull'RFID, ma non ho ancora la cifra esatta | Stesso criterio |

Le fonti finiscono in `SOURCES.md` e, in breve, sotto il dato nel gioco. Nessun dato di aziende associate a GS1 Italy.

## 8. Fasi

Fase 0 è questo documento. Le fasi 1–7 seguono il prompt (sezione 11). A ogni fase: commit sul branch `v2`, screenshot in `docs/screenshots/`, riepilogo e attesa del tuo ok.

## 9. Dubbi aperti (mi servono risposte prima della Fase 1)

1. **Branch e pubblicazione.** Lavoro sul branch `v2` e lo unisco a `main` solo alla fine. Faccio il push del branch su GitHub a ogni fase, o tengo tutto in locale finché non me lo chiedi?
2. **Logo.** `assets/gs1-italy-logo.png` non c'è ancora: per ora metto un segnaposto. Hai il logo in PNG su sfondo trasparente, in versione per fondo scuro (il gioco è su GS1 Blue)?
3. **`--state-error`.** Propongo un rosso scuro desaturato che stia bene su Blue, sempre con l'icona ✕. In alternativa usiamo solo l'Orange con l'icona ✕, e allora non serve alcuna eccezione di brand. Quale preferisci?
4. **Etichette arcade in inglese** ("GAME CLEAR", "CONTINUE?", "HI-SCORE", "PREMI START"). Le tengo come elementi di stile, o traduco tutto ("MISSIONE COMPIUTA", "CONTINUI?", "RECORD")?
5. **Secondo lotto di yogurt** prodotto con lo stesso latte nella sfida finale: propongo **L124**, che nella storia è ancora tutto al CeDi. Va bene?
6. **Schema EPCIS 2.0.** Scarico lo schema JSON ufficiale da ref.gs1.org durante lo sviluppo e lo salvo nel repo (con la sua licenza), così i test girano anche offline. Se la rete aziendale blocca ref.gs1.org, uso un validatore minimo e te lo segnalo.
7. **Playwright** deve scaricare i browser di test (circa 300 MB). Se la rete aziendale lo blocca, uso Edge già installato sul PC.
8. **Narratore.** "Bip" ti va bene, o preferisci un altro nome?
