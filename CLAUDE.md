# ovio

App React Native (Expo SDK 58) per dividere le spese, in italiano. Prima di lavorare leggi `STATO.md`
(cosa è fatto e cosa resta) e aggiornalo a fine sessione.

- Controlli prima di ogni push: `npx tsc --noEmit`, `npm test`, `npm run build:web && npm run e2e`.
- Colori e tipografia solo da `replica/design/tokens.json` (via `src/theme`), mai valori esadecimali
  nelle schermate. Dopo ogni cambio di palette: `python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json`.
- Importi sempre in centesimi interi (`src/lib/money.ts`).
- Per le scelte di design usa la skill `apple-design`; per le nuove funzioni segui le skill `replica-*`.
