# ovio: a che punto siamo

Ultimo aggiornamento: 2026-11-05. Branch di lavoro: `claude/fervent-einstein-fdsltp`.
Sito web: https://pigisfre.github.io/ovio./ (si aggiorna a ogni push, dopo che i test passano).

## Fatto

- **Skill installate** in `.claude/skills/`: replica-* (11 skill) e apple-design.
- **Documenti replica** in `replica/`: recon di Splitwise, feature matrix (parity 93/100, 18/18 must),
  architettura, `schema.sql` per Supabase, design token (35 coppie, 0 errori di contrasto),
  componenti, brand, revisione Apple (`design/apple-review.md`).
- **App Expo SDK 58** (iOS, Android, web), solo locale: i dati restano sul dispositivo o nel browser.
  - Gruppi, amici, spese divise in 4 modi (uguale, esatta, %, quote), saldi, semplificazione debiti,
    Salda (anche "Tutto" per un amico, un pagamento per ogni gruppo), attività, account,
    eliminazione con Annulla, avviso per le modifiche non salvate.
  - Palette: Midnight #111827, Lime #D9F99D, Cloud #F8F9F6, Periwinkle #A5B4FC, Slate #64748B.
- **Test**: `npm test` (9 unit test) e `npm run e2e` (11 controlli Playwright sul sito buildato).
- **CI** `.github/workflows/pages.yml`: typecheck → test → build web → e2e → pubblica su `gh-pages`.

## Da fare, in ordine

1. Provare l'app su un iPhone o Android vero (Expo Go): Dynamic Type grande, VoiceOver, tab bar
   di iOS 26. Finora è stata provata solo sul web.
2. Punti aperti della revisione Apple (`replica/design/apple-review.md`):
   - variante ad alto contrasto del testo secondario;
   - header trasparente su iOS 26;
   - colore dello Switch sul web;
   - un vero selettore di data al posto di Oggi / Ieri.
3. Funzioni mancanti (`replica/features.csv`): più pagatori, spese ricorrenti, ricerca, grafici,
   foto scontrino.
4. Backend `/replica-backend`: account Supabase, sincronizzazione, gruppi condivisi tra telefoni.
5. `/replica-entrepreneur`: recensioni degli utenti Splitwise, per capire su cosa distinguersi.
6. `/replica-brand` e `/replica-launch`: icona dell'app, verifica di marchio e dominio "ovio"
   (non fatta), testi per gli store.
7. `/replica-deploy`: build EAS per TestFlight e Play Store.

## Note per chi riprende

- Le import interne usano l'estensione `.ts` (serve ai test con Node): `allowImportingTsExtensions`.
- La logica pura sta in `src/lib` e `src/store/ledger.ts` (testabile con Node). Le schermate stanno
  in `src/app`.
- Sul web la tab bar è `src/app/(tabs)/_layout.web.tsx`; su iOS e Android è `NativeTabs`.
- Base URL del sito: `/ovio.` (in `app.json` → `experiments.baseUrl`).
- Nell'ambiente cloud i docs di Expo e l'API di Expo non erano raggiungibili: le install con
  `EXPO_OFFLINE=1 npx expo install ...`.
