# Architecture: ovio

Reads `recon.md` and `features.csv`. The first release is **local-first**: everything works offline on
one device, with no account and no server. The schema below is written now so the backend
(`/replica-backend`) can be added without changing the domain model.

## Stack

| layer | choice | why |
| --- | --- | --- |
| mobile | Expo SDK 58 (React Native 0.88) + TypeScript | the user asked for React Native; Expo is the managed path with OTA and EAS builds |
| navigation | Expo Router: native stack + `NativeTabs` | real UINavigationController / UITabBar on iOS, so large titles, form sheets and the system tab bar (Liquid Glass on iOS 26) come for free |
| state | Zustand + `persist` on AsyncStorage | tiny, no boilerplate, survives restarts; one store replaced by a sync layer later |
| domain logic | pure TS in `src/lib` (no React) | splits, balances and simplification are unit tested in Node |
| icons | SF Symbols on iOS (`expo-symbols` via the router), Ionicons fallback | native look on iOS, MIT icons elsewhere; no Splitwise assets |
| type | system font (SF Pro / Roboto) | Apple's HIG: system type for UI, Dynamic Type for free |
| later: database | Postgres on Supabase | row level security, auth and realtime in one place |
| later: auth | Supabase Auth (Sign in with Apple, email OTP) | |

## Schema (for the backend milestone)

See `schema.sql`. Money is integer cents plus a currency code. Every expense has shares whose
`paid_share` and `owed_share` each sum to `cost`, enforced by a deferred constraint trigger.
A settle-up is an expense with `is_payment = true`.

## Local store shape (first release)

```
people:    Record<id, Person>        // includes me (isMe: true)
groups:    Record<id, Group>
expenses:  Record<id, Expense>       // shares inline: { personId, paid, owed }[]
activity:  Activity[]                // newest first, capped at 500
settings:  { currency, simplifyByDefault }
```

## Routes (Expo Router, `src/app`)

| route | screen | flow |
| --- | --- | --- |
| `(tabs)/groups/index` | S02 Groups | F02, F05 |
| `(tabs)/groups/[id]` | S03 Group detail | F03, F06, F07 |
| `(tabs)/friends/index` | S06 Friends | F08 |
| `(tabs)/friends/[id]` | S07 Friend detail | F06, F08 |
| `(tabs)/activity` | S13 Activity | |
| `(tabs)/account` | S14 Account | |
| `welcome` | S01 | F01 |
| `group/new`, `group/[id]/edit` (form sheet) | S05 | F02 |
| `group/[id]/balances` | S04 | F05 |
| `friend/new` (form sheet) | S08 | F08 |
| `expense/new`, `expense/[id]/edit` (modal) | S09 + S10 | F03, F04, F07 |
| `expense/[id]` | S11 | F07 |
| `settle` (form sheet) | S12 | F06 |

## The parts that bite

- **Rounding.** Equal and percentage splits allocate cents by largest remainder, so the shares always sum to the total and the order is stable.
- **Simplify debts.** Greedy matching of largest debtor to largest creditor: at most n-1 payments and the same net balances. Off means pairwise debts from the expenses as they are.
- **Decimal input.** it-IT uses a comma; the parser accepts both `,` and `.` and rejects more than two decimals.
- **Deleting a person** who is in expenses is blocked; a group can only be deleted when it is settled (or after a confirm).
- **Sync (later).** Last-write-wins per expense with `updated_at`; expenses are append-mostly so conflicts are rare.

## Build order

1. Vertical slice: welcome → create group → add equal expense → see balance (S01, S05, S02, S03, S09).
2. Must-haves: friends, unequal splits, expense detail, edit/delete, balances, settle up.
3. Should-haves: simplify debts, activity, totals, categories, notes, currency.
4. Could-haves, then the backend.
