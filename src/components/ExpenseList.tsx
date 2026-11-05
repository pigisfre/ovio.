import { router } from 'expo-router';
import { View } from 'react-native';
import { formatMoney } from '../lib/money.ts';
import { displayName, myImpact } from '../store/selectors.ts';
import { useStore } from '../store/store.ts';
import type { Expense } from '../store/types.ts';
import { tabular, useColors } from '../theme/index.ts';
import { categoryIcon, Icon } from './Icon.tsx';
import { Row, Section, Separator, T } from './ui.tsx';

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
            const color = impact > 0 ? c.positive : impact < 0 ? c.negative : c['text-muted'];
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
                  trailing={
                    <View style={{ alignItems: 'flex-end' }}>
                      <T v="caption" color={color}>{word}</T>
                      {impact !== 0 || e.isPayment ? (
                        <T v="headline" color={color} style={tabular}>{formatMoney(Math.abs(e.isPayment ? e.total : impact), e.currency)}</T>
                      ) : null}
                    </View>
                  }
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
