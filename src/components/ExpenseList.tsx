import { router } from 'expo-router';
import { View } from 'react-native';
import { formatMoney } from '../lib/money.ts';
import { displayName, myImpact } from '../store/selectors.ts';
import { useStore } from '../store/store.ts';
import type { Expense } from '../store/types.ts';
import { useColors } from '../theme/index.ts';
import { categoryIcon, Icon } from './Icon.tsx';
import { Figure, Row, Section, Separator } from './ui.tsx';

const monthFmt = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });

export function ExpenseList({ expenses, meId }: { expenses: Expense[]; meId: string }) {
  const people = useStore((s) => s.people);
  const c = useColors();
  const months: { key: string; items: Expense[] }[] = [];
  for (const e of expenses) {
    const key = monthFmt.format(e.date);
    const last = months[months.length - 1];
    if (last?.key === key) last.items.push(e);
    else months.push({ key, items: [e] });
  }
  return (
    <>
      {months.map((m) => (
        <Section key={m.key} title={m.key}>
          {m.items.map((e, i) => {
            const impact = myImpact(e, meId);
            const payer = people[e.shares.find((s) => s.paid > 0)?.personId ?? ''];
            const ic = e.isPayment ? { sf: 'arrow.left.arrow.right' as const, ion: 'swap-horizontal' as const } : categoryIcon[e.category] ?? categoryIcon.general;
            const payee = people[e.shares.find((s) => s.owed > 0)?.personId ?? ''];
            const subtitle = e.isPayment
              ? `${displayName(payer, { subject: true })} → ${displayName(payee, { subject: true })} · ${dayFmt.format(e.date)}`
              : `${displayName(payer, { subject: true })} ${payer?.isMe ? 'hai' : 'ha'} pagato ${formatMoney(e.total, e.currency)} · ${dayFmt.format(e.date)}`;
            const tone = e.isPayment ? 'neutral' : impact > 0 ? 'positive' : impact < 0 ? 'negative' : 'neutral';
            const word = e.isPayment ? 'pagamento' : impact > 0 ? 'hai prestato' : impact < 0 ? 'devi' : 'non coinvolto';
            return (
              <View key={e.id}>
                {i > 0 && <Separator />}
                <Row
                  leading={
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c['surface-raised'], alignItems: 'center', justifyContent: 'center' }}>
                      <Icon sf={ic.sf} ion={ic.ion} size={20} color={c.text} />
                    </View>
                  }
                  title={e.isPayment ? 'Pagamento' : e.description}
                  subtitle={subtitle}
                  accessibilityLabel={`${e.isPayment ? 'Pagamento' : e.description}, ${subtitle}, ${word} ${formatMoney(Math.abs(impact || e.total), e.currency)}`}
                  trailing={<Figure tone={tone} label={word} text={impact !== 0 || e.isPayment ? formatMoney(Math.abs(e.isPayment ? e.total : impact), e.currency) : undefined} />}
                  onPress={() => router.push(`/expense/${e.id}`)}
                />
              </View>
            );
          })}
        </Section>
      ))}
    </>
  );
}
