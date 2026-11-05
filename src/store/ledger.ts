// Pure ledger queries over the store data. No React or React Native imports, so Node can test them.
import { balanceBetween, debtsFor, netBalances, type Debt } from '../lib/balances.ts';
import type { Cents } from '../lib/money.ts';
import type { Expense, Group } from './types.ts';

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

export function looseExpenses(expenses: Record<string, Expense>, groups: Record<string, Group>) {
  return Object.values(expenses).filter((e) => !e.groupId || !groups[e.groupId]);
}

/** Balance between me and a friend inside one group, as the group screen shows it. Positive = friend owes me. */
export function pairBalanceInGroup(expenses: Record<string, Expense>, g: Group, meId: string, friendId: string): Cents {
  let bal = 0;
  for (const d of groupDebts(expenses, g)) {
    if (d.from === friendId && d.to === meId) bal += d.amount;
    if (d.from === meId && d.to === friendId) bal -= d.amount;
  }
  return bal;
}

export interface SettleContext {
  /** null = expenses outside any group */
  groupId: string | null;
  balance: Cents;
}

/** Every place where a friend and I have an open balance, largest first. */
export function friendContexts(expenses: Record<string, Expense>, groups: Record<string, Group>, meId: string, friendId: string): SettleContext[] {
  const out: SettleContext[] = [];
  for (const g of Object.values(groups)) {
    const b = pairBalanceInGroup(expenses, g, meId, friendId);
    if (b !== 0) out.push({ groupId: g.id, balance: b });
  }
  const loose = balanceBetween(looseExpenses(expenses, groups), meId, friendId);
  if (loose !== 0) out.push({ groupId: null, balance: loose });
  return out.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
}

/** What a friend and I owe each other overall. Positive = friend owes me. */
export function friendBalance(expenses: Record<string, Expense>, groups: Record<string, Group>, meId: string, friendId: string): Cents {
  return friendContexts(expenses, groups, meId, friendId).reduce((a, c) => a + c.balance, 0);
}
