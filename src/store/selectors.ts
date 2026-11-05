import { useMemo } from 'react';
import type { Cents } from '../lib/money.ts';
import { byDateDesc } from './ledger.ts';
import { useStore } from './store.ts';
import type { Expense, Person } from './types.ts';

export * from './ledger.ts';

export function expensesWith(expenses: Record<string, Expense>, meId: string, friendId: string) {
  return Object.values(expenses)
    .filter((e) => e.shares.some((s) => s.personId === friendId) && e.shares.some((s) => s.personId === meId))
    .sort(byDateDesc);
}

export function useMe(): Person | undefined {
  return useStore((s) => (s.meId ? s.people[s.meId] : undefined));
}

export function useFriends(): Person[] {
  const people = useStore((s) => s.people);
  return useMemo(() => Object.values(people).filter((p) => !p.isMe).sort((a, b) => a.name.localeCompare(b.name, 'it')), [people]);
}

/** My share of an expense: positive = I lent, negative = I borrowed. */
export function myImpact(e: Expense, meId: string): Cents {
  const s = e.shares.find((x) => x.personId === meId);
  return s ? s.paid - s.owed : 0;
}

export function displayName(p: Person | undefined, opts: { subject?: boolean } = {}) {
  if (!p) return 'Qualcuno';
  if (p.isMe) return opts.subject ? 'Tu' : 'te';
  return p.name;
}
