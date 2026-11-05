import { useMemo } from 'react';
import { balanceBetween, debtsFor, netBalances, type Debt } from '../lib/balances.ts';
import type { Cents } from '../lib/money.ts';
import { useStore } from './store.ts';
import type { Expense, Group, Person } from './types.ts';

export const byDateDesc = (a: Expense, b: Expense) => b.date - a.date || b.createdAt - a.createdAt;

export function groupExpenses(expenses: Record<string, Expense>, groupId: string) {
  return Object.values(expenses).filter((e) => e.groupId === groupId).sort(byDateDesc);
}

export function groupDebts(expenses: Record<string, Expense>, g: Group): Debt[] {
  return debtsFor(groupExpenses(expenses, g.id), g.simplifyDebts);
}

/** My net balance in a group: positive = I'm owed. */
export function myGroupBalance(expenses: Record<string, Expense>, g: Group, meId: string): Cents {
  return netBalances(groupExpenses(expenses, g.id)).get(meId) ?? 0;
}

/**
 * What a friend and I owe each other, across every group (using each group's own debt setting,
 * so it matches what the group screen shows) plus expenses outside groups.
 */
export function friendBalance(expenses: Record<string, Expense>, groups: Record<string, Group>, meId: string, friendId: string): Cents {
  let bal = 0;
  for (const g of Object.values(groups)) {
    for (const d of groupDebts(expenses, g)) {
      if (d.from === friendId && d.to === meId) bal += d.amount;
      if (d.from === meId && d.to === friendId) bal -= d.amount;
    }
  }
  const loose = Object.values(expenses).filter((e) => !e.groupId || !groups[e.groupId]);
  bal += balanceBetween(loose, meId, friendId);
  return bal;
}

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
