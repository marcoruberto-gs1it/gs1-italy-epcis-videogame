# Token di colore GS1 Italy

Fonte unica: `src/styles/tokens.css`. `src/tokens.js` (per canvas e Three.js) è generato da quel file con `scripts/gen-tokens.js`.

## Colori di brand

| Token | Hex | Uso nel gioco |
|---|---|---|
| `--gs1-blue` | `#002C6C` | Pannelli, nodi della mappa, cabinato |
| `--gs1-orange` | `#F26334` | Pulsanti principali, cornice dello schermo, punteggio |
| `--gs1-teal` | `#22BCB9` | Etichette, bordi delle opzioni, raggi X e RFID |
| `--gs1-forest` | `#00B74F` | Successo, superpoteri, "evento registrato" |
| `--gs1-white` | `#FFFFFF` | Testo su scuro |
| `--gs1-off-white` | `#FAF9F5` | Base dei neutri caldi |
| `--gs1-light-gray` | `#E5E8EB` | Strade, dettagli chiari |
| `--gs1-dark-gray` | `#4A4A4A` | Dettagli scuri degli sprite |

## Come sono calcolate le tinte derivate

Ogni tinta parte da un colore di brand convertito in **OKLCH**. Cambia solo la luminosità **L** (valore ΔL nella tabella); tinta e croma restano gli stessi. Se il colore risultante esce dallo spazio sRGB, il croma viene ridotto finché non rientra. Così una tinta resta riconoscibile come "lo stesso colore, più chiaro o più scuro", non come un colore nuovo. Il codice è in `scripts/oklch.js`.

| Token | Da | ΔL | Hex | Uso |
|---|---|---|---|---|
| `--gs1-blue-950` | Blue | −0,14 | `#000D2C` | Fondo pagina, ombre |
| `--gs1-blue-900` | Blue | −0,10 | `#00163E` | Schermo del cabinato |
| `--gs1-blue-800` | Blue | −0,05 | `#002154` | Riserva |
| `--gs1-blue-700` | Blue | +0,06 | `#113D7E` | Bordi secondari, hover |
| `--gs1-blue-600` | Blue | +0,12 | `#234E91` | Riserva |
| `--gs1-blue-200` | Blue | +0,55 | `#B8D3FE` | Bordi dei pulsanti, testo nel blocco JSON |
| `--gs1-blue-100` | Blue | +0,62 | `#DCE9FF` | Fondo delle scene illustrate |
| `--gs1-blue-50` | Blue | +0,66 | `#F1F6FE` | Fondo della pagina |
| `--gs1-orange-700` | Orange | −0,12 | `#C53E03` | Ombre degli sprite |
| `--gs1-orange-300` | Orange | +0,10 | `#FE9575` | Hover dei pulsanti, numeri nel blocco JSON |
| `--gs1-orange-100` | Orange | +0,22 | `#FFD0C2` | Alone della tappa successiva, muso delle mucche |
| `--gs1-teal-700` | Teal | −0,20 | `#077977` | Riserva |
| `--gs1-teal-300` | Teal | +0,12 | `#5AE3E0` | Sottotitoli, chiavi del JSON |
| `--gs1-forest-900` | Forest | −0,40 | `#013311` | Fondo della risposta giusta |
| `--gs1-forest-700` | Forest | −0,15 | `#058237` | Riserva |
| `--gs1-forest-300` | Forest | +0,12 | `#4CDF75` | Testo di successo su scuro |
| `--gs1-warm-400` | Off-white | −0,25 | `#A9A8A4` | Cartone, legno chiaro del pallet |
| `--gs1-warm-600` | Off-white | −0,42 | `#767571` | Legno scuro, mensole |

## Colore funzionale (da validare)

| Token | Hex | Regola |
|---|---|---|
| `--state-error` | `#B42318` | Solo vite perse e risposte sbagliate, sempre con l'icona ✕. Rosso scuro perché il gioco è su fondo chiaro (6,6:1 su bianco) |

## Contrasti verificati (WCAG AA ≥ 4,5)

Verificati da `tests/unit/brand.test.js` per il tema chiaro. Esempi: GS1 Blue su bianco = 13,3; Dark Gray su bianco = 8,9; Blue 950 sul pulsante Orange = 6,0; `--state-error` su bianco = 6,6.

**Attenzione:** su fondo chiaro Teal, Forest e Orange pieni non bastano per il testo. Per il testo si usano le tinte scure `--gs1-teal-700`, `--gs1-forest-700` e `--gs1-orange-700`; i colori pieni restano per superfici, pulsanti e illustrazioni.

## Regole

- Mai Orange e Teal a contatto: sempre separati da un bordo o da uno spazio Blue o neutro.
- Ogni informazione data dal colore è ripetuta con un'icona o un testo (✓ giusto, ✕ sbagliato).
