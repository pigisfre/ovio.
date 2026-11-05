# Recon map: Splitwise (iOS + Android)

Scope: the core loop, i.e. shared expenses within groups and between friends, balances, debt simplification and settling up. Pro features (scanned receipts with itemisation, charts, currency conversion) are out of the first release.
For: **ovio**, the user's own product, a React Native (Expo) app with an Apple design language.
Date: 2026-11-05

> Method note: this map comes from what Splitwise publicly documents (help center, public API docs,
> store listing, pricing page) and from general product knowledge. No account was used, nothing was
> scraped, and no code, private endpoint or asset was looked at. The pages in the sources table were
> not re-fetched in this session (outbound web access was blocked), so re-check them
> by hand before relying on any specific detail. `replica/screens/` is empty for the same reason.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | help center | https://feedback.splitwise.com/knowledgebase | split methods, simplify debts, settle up, groups, recurring expenses |
| 2 | public API docs | https://dev.splitwise.com | entities: user, group, friend, expense, repayments, comment, notification |
| 3 | pricing (Pro) | https://www.splitwise.com/pro | what is gated: receipt scanning, charts, currency conversion, search, ad-free |
| 4 | App Store listing | https://apps.apple.com/app/splitwise/id458023433 | key screens, pitch, ratings |
| 5 | Google Play listing | https://play.google.com/store/apps/details?id=com.Splitwise.SplitwiseMobile | same, Android |
| 6 | marketing site | https://www.splitwise.com | the core loop in their own words |

## Core loop

Add a shared expense, the app works out who owes whom, people settle up and the balance goes back to zero.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Welcome / sign up | first launch | create the local profile (name, email, default currency) | text field, primary button | empty, invalid |
| S02 | Groups | tab 1 | list of groups with your balance in each, plus total balance | balance header, list rows, avatar, FAB/add button | empty, filled, all settled |
| S03 | Group detail | S02 → row | expenses in the group by month, your balance, actions | header with balance, segmented actions (Settle up, Balances, Totals), expense rows | empty, filled, settled |
| S04 | Group balances | S03 → Balances | each member's net balance, simplified debts | member rows, owe/owed amounts | all settled |
| S05 | Create / edit group | S02 → + | name, type (trip, home, couple, other), members | text field, chips, member picker | invalid name |
| S06 | Friends | tab 2 | each friend and the net balance with them across groups | balance header, list rows | empty, filled |
| S07 | Friend detail | S06 → row | shared expenses with one friend, settle up | balance header, expense rows | settled |
| S08 | Add friend | S06 → + | add a person by name (and optional email) | text fields | duplicate |
| S09 | Add / edit expense | + button anywhere, sheet | description, amount, payer, split, group, date, category, notes | amount field, pickers, segmented split methods | invalid amount, split does not add up |
| S10 | Split options | S09 → "split equally" | equally / exact amounts / percentages / shares, choose participants | segmented control, per-person inputs, running remainder | does not add up |
| S11 | Expense detail | expense row | who paid, who owes what, date, notes, edit, delete | header, breakdown rows, destructive action | deleted |
| S12 | Settle up | S03 / S07 → Settle up | record a payment from A to B | payer/payee picker, amount, suggested amount | nothing to settle |
| S13 | Activity | tab 3 | chronological feed of everything that changed | feed rows with icon + sentence + amount | empty |
| S14 | Account | tab 4 | profile, default currency, simplify debts default, reset data | grouped list, toggles | — |

## Flows

```
F01 First run
    S01 -> S02
    happy path taps: 3 (name, continue)
    edge: empty name, very long name

F02 Create a group and add people
    S02 -> S05 (name, type, members) -> S03
    happy path taps: 5
    edge: name already used, member added twice, group with only you

F03 Add an expense split equally
    S03 -> S09 (description, amount) -> save -> S03
    happy path taps: 4 (the default is "you paid, split equally among all members")
    edge: amount 0 or negative, amount with comma decimal (it-IT), 0.01 remainder on odd splits

F04 Add an expense split unequally
    S09 -> S10 (exact | percent | shares) -> S09 -> save
    edge: exact amounts do not sum to total, percentages != 100, all shares 0

F05 See who owes whom
    S02 / S03 -> S04
    edge: simplify debts on vs off, circular debts (A->B->C->A)

F06 Settle up
    S03 / S07 -> S12 (suggested payer, payee, amount) -> save
    edge: paying more than owed, partial payment, nothing owed

F07 Edit or delete an expense
    S03 -> S11 -> edit (S09) | delete (confirm)
    edge: deleting changes balances, undo

F08 Expense with a friend, no group
    S06 -> S07 -> S09 (group = none) -> S07
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Balance header | you are owed, you owe, settled | — | S02, S03, S06, S07 |
| List row | group, friend, expense, activity, member | default, pressed, swipe actions | all lists |
| Avatar | person (initials), group (type symbol) | — | most screens |
| Amount text | positive, negative, neutral | — | rows, headers |
| Button | primary, secondary, plain, destructive | default, pressed, disabled | all |
| Text field | text, amount (decimal pad), email | default, focused, error | S01, S05, S08, S09, S10, S12 |
| Segmented control | split method, group type | selected | S05, S10 |
| Sheet | form sheet with grabber and Cancel / Save | — | S05, S08, S09, S10, S12 |
| Person picker | single, multi | selected | S05, S09, S10, S12 |
| Empty state | per list | — | S02, S03, S06, S13 |
| Confirm dialog | destructive | — | S11, S14 |

## Inferred data model

```
User / Person  id, name, email?, is_me
               evidence: API docs (user, friend), S01, S08
               confidence: high

Group          id, name, type (trip | home | couple | other), member_ids, currency,
               simplify_debts (bool), created_at
               evidence: API docs (group, simplify_by_default), help center "groups"
               confidence: high

Expense        id, group_id?, description, cost (cents), currency, date, category,
               notes?, payment (bool: true for a settle-up), created_by, created_at, deleted_at?
               evidence: API docs (expense, payment flag), S09, S11
               confidence: high

ExpenseShare   expense_id, person_id, paid_share (cents), owed_share (cents)
               evidence: API docs (users[] with paid_share / owed_share on an expense)
               confidence: high

Activity       id, kind (expense_added | expense_edited | expense_deleted | payment | group_created | friend_added),
               subject_id, at
               evidence: S13, API notifications
               confidence: medium
```

Relationships: Group n-n Person; Expense n-1 Group (optional); Expense 1-n ExpenseShare; ExpenseShare n-1 Person.
A settle-up is an Expense with `payment = true`: payer has `paid_share = amount`, payee has `owed_share = amount`.

## Feature matrix

See `features.csv`. Must: 18, should: 7, could: 6, skip: 5.

## Out of scope (cannot or should not be cloned)

- Splitwise's brand: name, logo, green/orange colours, illustrations and copy. ovio has its own.
- The network of existing users, their data and invitations.
- Payment rails and partner integrations (Splitwise Pay, Venmo, PayPal deep links): partner deals and regulated money movement.
- Licensed receipt OCR / itemisation backend.
- Live currency exchange rates (needs a licensed data provider).

## Size

Screens 14, flows 8, entities 5. Hard parts: correct rounding of splits (cents never lost), debt simplification, multi-device sync once a backend exists. Size: M. The local-first first release is S.
