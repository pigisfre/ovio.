import type { Cents } from './money.ts';
import type { Share } from './split.ts';

export interface LedgerEntry {
  shares: Share[];
}

/** Net balance per person: positive means the person is owed money. */
export function netBalances(entries: LedgerEntry[]): Map<string, Cents> {
  const net = new Map<string, Cents>();
  for (const e of entries) {
    for (const s of e.shares) net.set(s.personId, (net.get(s.personId) ?? 0) + s.paid - s.owed);
  }
  return net;
}

export interface Debt {
  from: string;
  to: string;
  amount: Cents;
}

/**
 * Pairwise debts as the expenses created them (no simplification).
 * In each expense, every person who owes more than they paid owes the difference to the people
 * who paid more than they owe, in proportion. Debts between the same two people are netted.
 */
export function pairwiseDebts(entries: LedgerEntry[]): Debt[] {
  const pair = new Map<string, Cents>(); // key "a|b" with a<b, positive = a owes b
  const add = (from: string, to: string, amt: Cents) => {
    if (from === to || amt === 0) return;
    const [a, b, sign] = from < to ? [from, to, 1] : [to, from, -1];
    const k = `${a}|${b}`;
    pair.set(k, (pair.get(k) ?? 0) + sign * amt);
  };
  for (const e of entries) {
    const debtors = e.shares.filter((s) => s.owed > s.paid).map((s) => ({ id: s.personId, amt: s.owed - s.paid }));
    const creditors = e.shares.filter((s) => s.paid > s.owed).map((s) => ({ id: s.personId, amt: s.paid - s.owed }));
    // Greedy within one expense keeps cents exact.
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const m = Math.min(debtors[i].amt, creditors[j].amt);
      add(debtors[i].id, creditors[j].id, m);
      debtors[i].amt -= m;
      creditors[j].amt -= m;
      if (debtors[i].amt === 0) i++;
      if (creditors[j].amt === 0) j++;
    }
  }
  const out: Debt[] = [];
  for (const [k, v] of pair) {
    if (v === 0) continue;
    const [a, b] = k.split('|');
    out.push(v > 0 ? { from: a, to: b, amount: v } : { from: b, to: a, amount: -v });
  }
  return out.sort((x, y) => y.amount - x.amount);
}

/** Minimum-ish set of payments with the same net balances: largest debtor pays largest creditor. */
export function simplifyDebts(net: Map<string, Cents>): Debt[] {
  const debtors = [...net].filter(([, v]) => v < 0).map(([id, v]) => ({ id, amt: -v }));
  const creditors = [...net].filter(([, v]) => v > 0).map(([id, v]) => ({ id, amt: v }));
  const byAmt = (a: { id: string; amt: number }, b: { id: string; amt: number }) => b.amt - a.amt || (a.id < b.id ? -1 : 1);
  const out: Debt[] = [];
  debtors.sort(byAmt);
  creditors.sort(byAmt);
  while (debtors.length && creditors.length) {
    const d = debtors[0], c = creditors[0];
    const m = Math.min(d.amt, c.amt);
    out.push({ from: d.id, to: c.id, amount: m });
    d.amt -= m;
    c.amt -= m;
    if (d.amt === 0) debtors.shift();
    if (c.amt === 0) creditors.shift();
    debtors.sort(byAmt);
    creditors.sort(byAmt);
  }
  return out;
}

export function debtsFor(entries: LedgerEntry[], simplify: boolean): Debt[] {
  return simplify ? simplifyDebts(netBalances(entries)) : pairwiseDebts(entries);
}

/** What `me` and `other` owe each other across the given entries. Positive: other owes me. */
export function balanceBetween(entries: LedgerEntry[], me: string, other: string): Cents {
  let bal = 0;
  for (const d of pairwiseDebts(entries)) {
    if (d.from === other && d.to === me) bal += d.amount;
    if (d.from === me && d.to === other) bal -= d.amount;
  }
  return bal;
}
