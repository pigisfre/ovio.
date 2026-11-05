/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allocate, parseAmount, formatMoney, centsToInput } from '../src/lib/money.ts';
import { computeShares, paymentShares } from '../src/lib/split.ts';
import { netBalances, pairwiseDebts, simplifyDebts, balanceBetween } from '../src/lib/balances.ts';

test('parseAmount accepts it-IT and en formats', () => {
  assert.equal(parseAmount('12'), 1200);
  assert.equal(parseAmount('12,5'), 1250);
  assert.equal(parseAmount('12.50'), 1250);
  assert.equal(parseAmount('1.234,56'), 123456);
  assert.equal(parseAmount('1,234.56'), 123456);
  assert.equal(parseAmount('€ 7,05'), 705);
  assert.equal(parseAmount('0,01'), 1);
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('abc'), null);
  assert.equal(parseAmount('1,2,3'), null);
  assert.equal(parseAmount('-5'), null);
});

test('formatMoney and centsToInput', () => {
  assert.match(formatMoney(12345678), /123\.456,78\s€/);
  assert.equal(centsToInput(1250), '12,50');
  assert.equal(centsToInput(1200), '12');
});

test('allocate never loses a cent and is stable', () => {
  assert.deepEqual(allocate(1000, [1, 1, 1]), [334, 333, 333]);
  assert.deepEqual(allocate(1, [1, 1]), [1, 0]);
  for (let t = 1; t < 500; t += 7) {
    const parts = allocate(t, [3, 1, 2.5, 0]);
    assert.equal(parts.reduce((a, b) => a + b, 0), t);
    assert.equal(parts[3], 0);
  }
});

test('equal split: payer paid all, everyone owes a share', () => {
  const r = computeShares({ total: 1000, payerId: 'a', method: 'equal', participants: ['a', 'b', 'c'] });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(r.shares, [
    { personId: 'a', paid: 1000, owed: 334 },
    { personId: 'b', paid: 0, owed: 333 },
    { personId: 'c', paid: 0, owed: 333 },
  ]);
});

test('payer not among participants still gets the paid share', () => {
  const r = computeShares({ total: 500, payerId: 'a', method: 'equal', participants: ['b'] });
  assert.ok(r.ok && r.shares.find((s) => s.personId === 'a')?.paid === 500);
});

test('exact, percent and shares validate', () => {
  assert.equal(computeShares({ total: 1000, payerId: 'a', method: 'exact', participants: ['a', 'b'], values: { a: 300, b: 600 } }).ok, false);
  const ex = computeShares({ total: 1000, payerId: 'a', method: 'exact', participants: ['a', 'b'], values: { a: 300, b: 700 } });
  assert.ok(ex.ok);
  assert.equal(computeShares({ total: 1000, payerId: 'a', method: 'percent', participants: ['a', 'b'], values: { a: 50, b: 40 } }).ok, false);
  const pc = computeShares({ total: 1001, payerId: 'a', method: 'percent', participants: ['a', 'b'], values: { a: 50, b: 50 } });
  assert.ok(pc.ok && pc.shares.reduce((s, x) => s + x.owed, 0) === 1001);
  const sh = computeShares({ total: 900, payerId: 'b', method: 'shares', participants: ['a', 'b'], values: { a: 2, b: 1 } });
  assert.ok(sh.ok && sh.shares.find((s) => s.personId === 'a')?.owed === 600);
  assert.equal(computeShares({ total: 0, payerId: 'a', method: 'equal', participants: ['a'] }).ok, false);
});

test('balances, pairwise debts and simplification', () => {
  // a paid 30 for a,b,c ; b paid 30 for a,b,c ; c paid 30 for a,b,c -> all even
  const even = ['a', 'b', 'c'].map((p) => {
    const r = computeShares({ total: 3000, payerId: p, method: 'equal', participants: ['a', 'b', 'c'] });
    if (!r.ok) throw new Error();
    return { shares: r.shares };
  });
  assert.deepEqual([...netBalances(even).values()], [0, 0, 0]);
  assert.deepEqual(pairwiseDebts(even), []);

  // circular: a owes b 10, b owes c 10, c owes a 10 -> nothing after simplification
  const circ = [paymentShares('b', 'a', 1000), paymentShares('c', 'b', 1000), paymentShares('a', 'c', 1000)].map((shares) => ({ shares }));
  assert.equal(simplifyDebts(netBalances(circ)).length, 0);

  // chain: a owes b 10, b owes c 10 -> simplified: a owes c 10
  const chain = [
    { shares: [{ personId: 'b', paid: 1000, owed: 0 }, { personId: 'a', paid: 0, owed: 1000 }] },
    { shares: [{ personId: 'c', paid: 1000, owed: 0 }, { personId: 'b', paid: 0, owed: 1000 }] },
  ];
  assert.equal(pairwiseDebts(chain).length, 2);
  assert.deepEqual(simplifyDebts(netBalances(chain)), [{ from: 'a', to: 'c', amount: 1000 }]);
  assert.equal(balanceBetween(chain, 'b', 'a'), 1000);
  assert.equal(balanceBetween(chain, 'b', 'c'), -1000);
});

test('settle up brings a balance back to zero', () => {
  const r = computeShares({ total: 2000, payerId: 'me', method: 'equal', participants: ['me', 'f'] });
  if (!r.ok) throw new Error();
  const entries = [{ shares: r.shares }, { shares: paymentShares('f', 'me', 1000) }];
  assert.equal(balanceBetween(entries, 'me', 'f'), 0);
  assert.equal(netBalances(entries).get('me'), 0);
});

import { friendBalance, friendContexts, myGroupBalance, pairBalanceInGroup } from '../src/store/ledger.ts';
import type { Expense, Group } from '../src/store/types.ts';

const exp = (id: string, groupId: string | null, shares: { personId: string; paid: number; owed: number }[], isPayment = false): Expense => ({
  id, groupId, description: id, total: shares.reduce((a, s) => a + s.paid, 0), currency: 'EUR', method: 'exact', shares,
  category: 'general', isPayment, date: 1, createdAt: 1, updatedAt: 1,
});

test('settling with a friend per context clears group and loose balances', () => {
  const groups: Record<string, Group> = {
    g1: { id: 'g1', name: 'Casa', kind: 'home', memberIds: ['me', 'f', 'x'], currency: 'EUR', simplifyDebts: true, createdAt: 1 },
  };
  const expenses: Record<string, Expense> = {
    e1: exp('e1', 'g1', [{ personId: 'me', paid: 3000, owed: 1000 }, { personId: 'f', paid: 0, owed: 1000 }, { personId: 'x', paid: 0, owed: 1000 }]),
    e2: exp('e2', null, [{ personId: 'f', paid: 800, owed: 400 }, { personId: 'me', paid: 0, owed: 400 }]),
  };
  const ctx = friendContexts(expenses, groups, 'me', 'f');
  assert.deepEqual(ctx, [{ groupId: 'g1', balance: 1000 }, { groupId: null, balance: -400 }]);
  assert.equal(friendBalance(expenses, groups, 'me', 'f'), 600);

  // "Tutto": one payment per context, as the settle screen records them
  expenses.p1 = exp('p1', 'g1', [{ personId: 'f', paid: 1000, owed: 0 }, { personId: 'me', paid: 0, owed: 1000 }], true);
  expenses.p2 = exp('p2', null, [{ personId: 'me', paid: 400, owed: 0 }, { personId: 'f', paid: 0, owed: 400 }], true);
  assert.deepEqual(friendContexts(expenses, groups, 'me', 'f'), []);
  assert.equal(pairBalanceInGroup(expenses, groups.g1, 'me', 'f'), 0);
  assert.equal(myGroupBalance(expenses, groups.g1, 'me'), 1000); // x still owes me in the group
});
