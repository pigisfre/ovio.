// Money is always integer cents. Parsing and formatting live here and nowhere else.

export type Cents = number;

/** Parses "12", "12,5", "12.50", "1.234,56" (it-IT) or "1,234.56" into cents. Returns null if invalid. */
export function parseAmount(input: string): Cents | null {
  let s = input.trim().replace(/[\s€$£]/g, '');
  if (!s) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  const decimalSep = lastComma > lastDot ? ',' : lastDot > lastComma ? '.' : null;
  if (decimalSep) {
    const thousandsSep = decimalSep === ',' ? '.' : ',';
    const [intPart, ...rest] = s.split(decimalSep);
    if (rest.length > 1) return null;
    const frac = rest[0] ?? '';
    // A single separator followed by exactly 3 digits and no other separator is ambiguous ("1.234"):
    // treat it as thousands only when the other separator is absent and decimals would be 3.
    if (frac.length === 3 && !s.includes(thousandsSep)) {
      s = intPart + frac;
    } else {
      if (frac.length > 2) return null;
      const whole = intPart.split(thousandsSep).join('');
      s = whole + '.' + frac;
    }
  }
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  const [w, f = ''] = s.split('.');
  const cents = Number(w) * 100 + Number((f + '00').slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(cents: Cents, currency = 'EUR', locale = 'it-IT'): string {
  const key = `${locale}|${currency}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: 'currency', currency });
    formatters.set(key, f);
  }
  return f.format(cents / 100);
}

/** Cents as a plain editable string, e.g. 1250 -> "12,50". */
export function centsToInput(cents: Cents): string {
  const w = Math.floor(cents / 100);
  const f = String(cents % 100).padStart(2, '0');
  return f === '00' ? String(w) : `${w},${f}`;
}

/** Largest remainder allocation: splits `total` cents by `weights` so the parts sum exactly to total. */
export function allocate(total: Cents, weights: number[]): Cents[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || weights.length === 0) return weights.map(() => 0);
  const raw = weights.map((w) => (total * w) / sum);
  const parts = raw.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) parts[order[k].i] += 1;
  return parts;
}
