# ovio

Le spese in comune, sempre in pari. App React Native (Expo SDK 58) per iOS, Android e web.

## Provarla sul web (senza installare niente)

Ogni push su `main` o `claude/fervent-einstein-fdsltp` pubblica la versione web su
**https://pigisfre.github.io/ovio./** tramite GitHub Actions (`.github/workflows/pages.yml`).

Configurazione una tantum: *Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: `gh-pages` / `(root)` → Save*. Il branch `gh-pages` viene creato dal primo run del workflow.

I dati restano nel browser (localStorage), non su un server.

## Struttura

- `src/app` schermate (Expo Router). `(tabs)/_layout.tsx` tab bar nativa, `(tabs)/_layout.web.tsx` tab bar per il web
- `src/lib` logica pura: importi in centesimi, divisioni (uguale, esatta, percentuale, quote), saldi, semplificazione debiti
- `src/store` stato locale (Zustand + AsyncStorage)
- `src/theme` legge i token da `replica/design/tokens.json`
- `replica/` documenti di progetto: recon, feature matrix, architettura, schema SQL, design, brand
- `tests/` test della logica (`npm test`) e `tests/e2e/flow.mjs` test end-to-end sul web (`npm run e2e`, girano anche in CI prima di pubblicare)

## Comandi

```bash
npm ci
npm test              # test della logica
npm run build:web     # build web in dist/
npm run e2e           # test end-to-end sul sito buildato
npx tsc --noEmit
npx expo start        # sviluppo, con Expo Go
```
