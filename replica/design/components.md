# ovio components

Apple HIG first (`.claude/skills/apple-design`): system components carry navigation and controls,
identity lives in colour, the balance card and the voice. Every amount uses tabular numerals.
Text scales with Dynamic Type (RN `allowFontScaling`, default on).

> 2026-11-06: one dark theme. Card = Cloud 6% on Midnight, figure in Lime, context in Periwinkle;
> positive amounts Lime, "devi" and destructive actions Periwinkle. See `../brand.md`.

## Signature: the balance card
  what      Midnight card in the content layer, one big figure in Lime, the label in Cloud,
            the context line in Periwinkle. The only place brand colour is spent loudly.
  why       `branding.md › Best practices`: "consider moving it into the content layer";
            the number you owe or are owed *is* the product.
  states    owed (Lime figure, "Ti devono"), owe ("Devi", figure in Cloud with a Periwinkle line),
            settled ("Tutto pari", figure is a check mark)
  a11y      one accessibility element, label reads the full sentence: "Ti devono 42,50 euro"
  used on   S02, S03, S06, S07

## Button
  variants  primary (accent fill, on-accent text), secondary (surface-raised, text),
            plain (tint text), destructive (danger text)
  size      height 50, radius pill, min hit 44x44
  states    default, pressed (opacity .7 + scale .98), disabled (opacity .4)
  a11y      accessibilityRole="button", label = visible title
  used on   all

## List row (inset grouped)
  layout    avatar 40 | title (headline) + subtitle (footnote, muted) | amount trailing
  height    >= 60, separators inset to text
  states    default, pressed (surface-raised)
  a11y      the whole row is one button, label merges title, subtitle and amount
  used on   S02, S03, S04, S06, S07, S11, S13, S14

## Avatar
  person    circle, initials, fill periwinkle, text midnight
  me        circle, fill lime, text midnight
  group     rounded square radius 12, SF Symbol per kind (airplane, house, heart, person.3)

## Amount
  positive  "ti deve" / "ti devono": positive colour
  negative  "devi": negative colour
  neutral   "pari": muted
  never colour alone: every amount carries its word label

## Text field
  height 50, radius md, surface fill, 1px separator border, focused: 2px tint border
  amount field: decimal-pad keyboard, figure size 44, accepts comma or dot

## Segmented control
  split method (=, 1.23, %, shares), group kind. Pill track surface-raised, selected thumb surface.

## Sheet
  form sheets with grabber, Annulla on the left, Salva (bold, prominent) on the right.
  swipe to dismiss is blocked only when the form is dirty.

## Empty state
  SF Symbol 44pt muted, a title, one line of copy, one primary action.
