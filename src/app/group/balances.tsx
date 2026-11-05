import { Screen } from '../../components/Screen.tsx';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Figure, Toggle, Avatar, Button, Row, Section, Separator, T } from '../../components/ui.tsx';
import { netBalances } from '../../lib/balances.ts';
import { formatMoney } from '../../lib/money.ts';
import { displayName, groupDebts, groupExpenses } from '../../store/selectors.ts';
import { useS } from '../../store/store.ts';
import { tabular, useColors } from '../../theme/index.ts';

export default function Balances() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const { group, expenses, people, meId, saveGroup } = useS((s) => ({ group: s.groups[id], expenses: s.expenses, people: s.people, meId: s.meId!, saveGroup: s.saveGroup }));
  const list = useMemo(() => (group ? groupExpenses(expenses, group.id) : []), [expenses, group]);
  if (!group) return null;
  const net = netBalances(list);
  const debts = groupDebts(expenses, group);
  const real = list.filter((e) => !e.isPayment);
  const spent = real.reduce((a, e) => a + e.total, 0);
  const myPaid = real.reduce((a, e) => a + (e.shares.find((s) => s.personId === meId)?.paid ?? 0), 0);
  const myShare = real.reduce((a, e) => a + (e.shares.find((s) => s.personId === meId)?.owed ?? 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Saldi' }} />
      <Screen contentContainerStyle={{ paddingBottom: 48 }}>
        <Section title="Chi deve a chi" footer={group.simplifyDebts ? 'Debiti semplificati: ovio riduce i pagamenti al minimo, senza cambiare quanto deve ognuno.' : undefined}>
          {debts.length === 0 ? (
            <Row title="Tutto pari" subtitle="Nessuno deve niente a nessuno." />
          ) : (
            debts.map((d, i) => (
              <View key={`${d.from}-${d.to}`}>
                {i > 0 && <Separator />}
                <Row
                  leading={<Avatar name={people[d.from]?.name ?? '?'} me={d.from === meId} />}
                  title={`${displayName(people[d.from], { subject: true })} ${d.from === meId ? 'devi' : 'deve'} a ${displayName(people[d.to])}`}
                  trailing={<T v="headline" style={tabular}>{formatMoney(d.amount, group.currency)}</T>}
                  onPress={() => router.push({ pathname: '/settle', params: { groupId: group.id, from: d.from, to: d.to, amount: String(d.amount) } })}
                  accessibilityLabel={`${displayName(people[d.from], { subject: true })} deve ${formatMoney(d.amount, group.currency)} a ${displayName(people[d.to])}. Tocca per registrare il pagamento.`}
                />
              </View>
            ))
          )}
        </Section>

        <Section>
          <Row
            title="Semplifica i debiti"
            subtitle="Meno pagamenti tra le persone del gruppo"
            trailing={<Toggle value={group.simplifyDebts} onChange={(v) => saveGroup({ ...group, simplifyDebts: v })} label="Semplifica i debiti" />}
          />
        </Section>

        <Section title="Saldo di ognuno">
          {group.memberIds.map((pid, i) => (
            <View key={pid}>
              {i > 0 && <Separator />}
              <Row
                leading={<Avatar name={people[pid]?.name ?? '?'} me={pid === meId} />}
                title={pid === meId ? `${people[pid]?.name} (tu)` : people[pid]?.name ?? '?'}
                trailing={(() => {
                  const v = net.get(pid) ?? 0;
                  if (v === 0) return <Figure tone="neutral" label="pari" />;
                  return <Figure tone={v > 0 ? 'positive' : 'negative'} label={v > 0 ? 'deve ricevere' : 'deve dare'} text={formatMoney(Math.abs(v), group.currency)} />;
                })()}
              />
            </View>
          ))}
        </Section>

        <Section title="Totali">
          <Row title="Spesa totale del gruppo" trailing={<T v="headline" style={tabular}>{formatMoney(spent, group.currency)}</T>} />
          <Separator inset={16} />
          <Row title="Hai pagato" trailing={<T v="headline" style={tabular}>{formatMoney(myPaid, group.currency)}</T>} />
          <Separator inset={16} />
          <Row title="La tua parte" trailing={<T v="headline" style={tabular}>{formatMoney(myShare, group.currency)}</T>} />
        </Section>
        <View style={{ margin: 16 }}>
          <Button kind="primary" title="Registra un pagamento" onPress={() => router.push({ pathname: '/settle', params: { groupId: group.id } })} />
        </View>
      </Screen>
    </>
  );
}
