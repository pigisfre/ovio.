# Design review: ovio

> **Update 2026-11-06, palette and material.** The app now has one dark theme: Midnight backgrounds,
> Cloud text, Lime for action and good news, Periwinkle for attention, Slate only for lines. There are no
> extra greens, reds or greys. Liquid Glass is on the floating layer only: `NativeTabs` and the stack
> bars on iOS 26, and `src/components/Glass.tsx` elsewhere (blur + translucent Midnight; opaque with
> Reduce Transparency). Cards stay on solid Cloud tints (`liquid-glass.md › The two layers`). Of the open
> points below, these are now fixed: the 4.50:1 secondary text (now 7.78:1), the solid header
> background (headers are transparent glass) and the teal web switch (`Toggle` in `ui.tsx`). Trade-off:
> there is no light appearance, which is the client's choice. The HIG prefers apps that support both.

Code audit of `src/app`, `src/components` and `replica/design/tokens.json`, run with the
`apple-design` skill. Platform: iOS first (Expo / React Native), then Android and web.
The material was the code and web screenshots in light and dark. Nothing was run on an iPhone, so
Dynamic Type at accessibility sizes, VoiceOver order and the iOS 26 tab bar are reviewed from the
code only.

References opened: `accessibility.md`, `typography.md`, `color.md`, `layout.md`,
`designing-for-ios.md`, `../cross-platform.md`, `tab-bars.md`, `sheets.md`, `alerts.md`,
`undo-and-redo.md`, `toggles.md`, `branding.md`, `liquid-glass.md`.

### Summary

Rating: **Good** once the two High findings below were fixed. Before that it was **Needs work**.
The design's thesis: *one number tells you where you stand, and every screen is one tap from
changing it.* What people will remember is the Midnight balance card with its single Lime figure.
Navigation and controls are the system's (native stack with large titles, `NativeTabs`, form sheets,
SF Symbols, system type). Brand colour lives in the content layer, which is what Apple recommends.

### Improvements

- **High: fixed.** Deleting an expense asked for confirmation in an alert.
  - **Why:** `alerts.md › Best practices`: "Avoid displaying alerts for common, undoable actions,
    even when they're destructive."
  - **Fix:** the delete now happens immediately. A banner (`src/components/UndoToast.tsx`) offers
    **Annulla** for 6 seconds and is announced to VoiceOver. Undo also removes the "deleted" entry
    from Attività. Deleting a whole group, removing a friend and wiping all data are not undoable,
    so they keep a Cancel + destructive alert.
- **High: fixed.** Swiping the expense editor away threw away what you had typed, with no warning.
  - **Why:** `sheets.md › Best practices`: "If people have unsaved changes in the sheet when they
    begin swiping to dismiss it, use an action sheet to let them confirm their action."
  - **Fix:** `usePreventRemove` in `src/app/expense/new.tsx`. It asks "Scartare questa spesa?",
    with *Continua a modificare* and *Scarta* (destructive), only when the form has changed.
- **Medium: fixed (web).** There was no visible keyboard focus on web.
  - **Fix:** a 2px focus ring on every button, tab, radio, switch and field: #4F46E5 on Cloud
    (5.95:1) in light mode, Periwinkle on Midnight (8.90:1) in dark mode.
- **Medium: open.** Secondary text (Slate #64748B on Cloud #F8F9F6) is at exactly 4.50:1. That
  passes AA, but with nothing to spare. When Increase Contrast is on, the app does not switch to a
  higher-contrast variant.
  - **Why:** `accessibility.md`: "Prefer system-defined colors. These colors have their own
    accessible variants that automatically adapt when people adjust their color preferences, such as
    enabling Increase Contrast."
  - **Fix:** add a `text-muted-hc` token (for example #475569, 7.2:1 on Cloud). Use it when
    `AccessibilityInfo` reports high contrast (a native module is needed on iOS). Keep Slate at
    13 pt or larger, as the tokens already do.
- **Medium: open.** The stack headers have a solid `headerStyle.backgroundColor`. On iOS 26 that
  covers the system's scroll-edge effect under the bars.
  - **Why:** `liquid-glass.md` puts the glass on "the layer of controls and navigation that floats
    above an app's content"; content should scroll under it.
  - **Fix:** try `headerTransparent: true` + `headerBlurEffect: 'systemMaterial'` on iOS only, after
    testing on a device, with an opaque header when Reduce Transparency is on
    (`liquid-glass.md › React Native`).
- **Low: open.** On web, `Switch` uses react-native-web's default teal thumb when on. Pass a
  web-only `activeThumbColor` that matches the tint.
- **Low: open.** There are only two dates to choose from (Oggi / Ieri, or the original date when
  editing). A date picker would remove that limit (`entering-data.md`).

### Craft notes

- **Point of view (High, kept with a reason).** Near-black with one acid-green accent is one of the
  three looks the skill flags as common in generated interfaces. Here the palette is the client's
  own, and the Lime is spent on one meaning only: *money coming back to you / all settled* (the
  figure on the card, "Tutto pari", the positive balance in dark mode). On light backgrounds it is
  never text (it is 1.1:1 on Cloud). Periwinkle marks people. That makes the palette a choice rooted
  in the product, not a default. Keep it that way: no Lime on decoration.
- **Signature.** The balance card is the one loud element. Everything around it is grouped lists
  in system style. That is the right balance (`branding.md`: "Ensure branding always defers to
  content").
- **Remove one accessory.** Nothing obvious. The "Saldi e totali" button under the card could
  become a third button inside the card on wide screens. That is optional.

### What works

- The tab bar has four single-word tabs (Gruppi, Amici, Attività, Account) with filled SF Symbols.
  It is the system `NativeTabs`, so iOS 26 gets Liquid Glass and the iPad layout for free
  (`tab-bars.md`).
- No meaning rides on colour alone. Every amount carries its words ("ti devono", "devi", "pari"),
  and the screen-reader label on the balance card reads the full sentence
  (`accessibility.md`: "Convey information with more than color alone").
- Contrast: 35 token pairs checked with `contrast.py`, 0 below AA, in light and dark.
- Touch targets are 44 pt minimum on header buttons, chips and rows. Buttons are 50 pt high.
- Type: the system font with the iOS text-style scale (17 pt body, 13 pt footnote, nothing under
  12 pt) and `tabular-nums` on every amount. RN `allowFontScaling` is on, so Dynamic Type applies.
- Sheets: the editors have Annulla + a bold Salva. Friend and settle sheets have grabbers and a
  medium detent (`sheets.md`).
- Light and dark follow the system, with no in-app appearance switch.

### Platform notes

- **Web** uses a JS bottom tab bar (`src/app/(tabs)/_layout.web.tsx`), because the native one is
  iOS/Android only. The app is capped at 560px and centred on desktop. Confirms use `window.confirm`.
- **Android** uses Ionicons in place of SF Symbols and Material's own Switch. It gets no blur,
  following `liquid-glass.md › React Native`.
- **Still to verify on a device:** Dynamic Type at AX5, VoiceOver order on the balance card and the
  expense rows, and the iPad / iPhone Duo widths.
