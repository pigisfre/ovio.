import { allocate, type Cents } from './money.ts';

export type SplitMethod = 'equal' | 'exact' | 'percent' | 'shares';

export interface Share {
  personId: string;
  paid: Cents;
  owed: Cents;
}

export interface SplitInput {
  total: Cents;
  payerId: string;
  method: SplitMethod;
  participants: string[];
  /** exact: cents per person; percent: percent per person (may have decimals); shares: units per person */
  values?: Record<string, number>;
}

export type SplitResult = { ok: true; shares: Share[] } | { ok: false; error: string; remainder?: number };

export function computeShares(input: SplitInput): SplitResult {
  const { total, payerId, method, participants, values = {} } = input;
  if (!Number.isSafeInteger(total) || total <= 0) return { ok: false, error: "Inserisci un importo maggiore di zero." };
  if (participants.length === 0) return { ok: false, error: 'Scegli almeno una persona.' };

  let owed: Cents[];
  switch (method) {
    case 'equal':
      owed = allocate(total, participants.map(() => 1));
      break;
    case 'exact': {
      owed = participants.map((p) => Math.round(values[p] ?? 0));
      const diff = total - owed.reduce((a, b) => a + b, 0);
      if (diff !== 0) return { ok: false, error: diff > 0 ? 'Mancano ancora soldi da assegnare.' : 'Hai assegnato più del totale.', remainder: diff };
      break;
    }
    case 'percent': {
      const pct = participants.map((p) => values[p] ?? 0);
      const sum = pct.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.001) return { ok: false, error: 'Le percentuali devono fare 100%.', remainder: 100 - sum };
      owed = allocate(total, pct);
      break;
    }
    case 'shares': {
      const units = participants.map((p) => values[p] ?? 0);
      if (units.some((u) => u < 0)) return { ok: false, error: 'Le quote non possono essere negative.' };
      if (units.reduce((a, b) => a + b, 0) <= 0) return { ok: false, error: 'Assegna almeno una quota.' };
      owed = allocate(total, units);
      break;
    }
  }

  const byPerson = new Map<string, Share>();
  participants.forEach((p, i) => byPerson.set(p, { personId: p, paid: 0, owed: owed[i] }));
  const payer = byPerson.get(payerId) ?? { personId: payerId, paid: 0, owed: 0 };
  payer.paid = total;
  byPerson.set(payerId, payer);
  return { ok: true, shares: [...byPerson.values()].filter((s) => s.paid > 0 || s.owed > 0) };
}

/** A settle-up is an expense where the payer pays and the payee "owes" it back to zero. */
export function paymentShares(fromId: string, toId: string, amount: Cents): Share[] {
  return [
    { personId: fromId, paid: amount, owed: 0 },
    { personId: toId, paid: 0, owed: amount },
  ];
}
