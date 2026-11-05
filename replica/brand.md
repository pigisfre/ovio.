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

## Palette (one dark theme, since 2026-11-06)
Only these five colours. Surfaces and secondary text are Cloud laid over Midnight at low opacity
(the hex values in `design/tokens.json` are those mixes), so nothing outside the palette appears.

| name | hex | role |
| --- | --- | --- |
| Midnight | #111827 | every background |
| Cloud | #F8F9F6 | all text; at 6 / 10 / 14 % for cards, raised controls and separators; at 66 % for secondary text (7.78:1) |
| Lime | #D9F99D | action and good news: primary buttons, selected tab, header buttons, "ti devono", "Tutto pari", the figure on the balance card, my avatar |
| Periwinkle | #A5B4FC | attention: "devi", errors, delete; other people's avatars |
| Slate | #64748B | input borders and non-text lines only (3.7:1 on Midnight: too low for text) |

Material: Liquid Glass on the floating layer only (tab bar, navigation bars, the undo banner).
Content (cards, rows) stays on solid Cloud tints, as Apple requires.

Contrast: `python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json` → 19 pairs, 0 failing.

## Voice
Italian, second person, short, warm, never guilt-tripping about money.
"Tutto pari." not "Nessun debito in sospeso". "Aggiungi una spesa" not "Crea nuova transazione".
Buttons say what happens: "Salva spesa", "Registra pagamento".

## Logo brief
A lowercase wordmark "ovio" in a rounded geometric sans; the two o's as two equal circles,
one Lime and one Periwinkle — two people, even. App icon: the two circles overlapping on Midnight.
