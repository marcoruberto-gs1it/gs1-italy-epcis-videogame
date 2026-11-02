# Missione L123

Gioco arcade per spiegare **EPCIS** in modo semplice, realizzato per il Reverse Coaching interno di GS1 Italy.

Il protagonista è un vasetto di yogurt del lotto L123: a ogni tappa della filiera i giocatori scrivono una pagina del suo "diario" (un evento EPCIS) e sbloccano un superpotere. Alla fine arriva il richiamo del lotto.

## Struttura

- **Mondo 1 · Food**: le dimensioni di un evento, aggregazione (raggi X), vocabolario CBV, sensori e catena del freddo, dichiarazione di errore.
- **Mondo 2 · Tessile**: inventario con RAIN RFID (EPC vs vettore), resi e storia del capo.
- **Boss finale**: il grande richiamo, prima "come una volta" e poi con una query EPCIS.

Ogni livello mostra l'evento in formato EPCIS 2.0 JSON.

## Come si usa

Apri `index.html` in un browser (funziona anche offline, a parte i font). Pensato per essere guidato dal presentatore:

| Tasto | Azione |
| --- | --- |
| 1-4 | Scegli un'opzione |
| Invio | Conferma / avanti |
| Esc | Torna alla mappa |
| M | Audio on/off |

Gli identificativi usati (GTIN, GLN, SSCC) sono esempi, non codici di aziende reali.
