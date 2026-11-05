# ovio brand

## Name
**ovio** — chosen by the user. Invented, short, four letters, reads the same in Italian and English,
no meaning that fights the product. Nothing in it echoes the original's name.

Checks (screening only, not legal clearance; none were run in this session):

| check | where | status |
| --- | --- | --- |
| EU trademark (classes 9, 36, 42) | euipo.europa.eu eSearch / TMview | to run |
| Italy (UIBM) | uibm.mise.gov.it | to run |
| US trademark | tmsearch.uspto.gov | to run |
| WIPO | branddb.wipo.int | to run |
| domain ovio.app / getovio.com | registrar search | to run |
| App Store and Google Play exact name | store search | to run |
| handles | Instagram, TikTok, X | to run |

## Palette (two appearances, dark by default, since 2026-11-06)
The app opens dark. Account → Aspetto offers Scuro (default), Chiaro and Automatico (follows the system).

Only these five colours. Surfaces, separators and secondary text are one brand colour laid over
the other at low opacity (the hex values in `design/tokens.json` are those mixes).

| name | hex | light appearance | dark appearance |
| --- | --- | --- | --- |
| Cloud | #F8F9F6 | every background; tints of Midnight over it for cards (4 / 7 / 10 %) | all text; tints over Midnight for cards (6 / 10 / 14 %) |
| Midnight | #111827 | all text (70 % for secondary text, 5.5:1 or better), primary buttons, the balance card | every background |
| Lime | #D9F99D | fills only: "ti devono" / "pari" labels, the figure on the card, Lime text on Midnight buttons, my avatar | the same, plus primary buttons, tint and the selected tab |
| Periwinkle | #A5B4FC | fills only: "devi" labels, the delete button, other people's avatars | the same, plus error text |
| Slate | #64748B | input borders and non-text lines | the same |

Rule: in light mode Lime and Periwinkle are never text on Cloud (1.1:1 and 1.9:1). They are fills
with Midnight text on top. The labels use the same filled pills in both appearances, so the two
themes match.

Material: Liquid Glass on the floating layer only (tab bar, navigation bars, the undo banner),
light or dark to match. Content (cards, rows) stays on solid tints, as Apple requires.

Contrast: `python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json` → 44 pairs, 0 failing.

## Voice
Italian, second person, short, warm, never guilt-tripping about money.
"Tutto pari." not "Nessun debito in sospeso". "Aggiungi una spesa" not "Crea nuova transazione".
Buttons say what happens: "Salva spesa", "Registra pagamento".

## Logo brief
A lowercase wordmark "ovio" in a rounded geometric sans; the two o's as two equal circles,
one Lime and one Periwinkle — two people, even. App icon: the two circles overlapping on Midnight.
