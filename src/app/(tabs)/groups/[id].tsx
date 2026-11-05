import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { BalanceCard } from '../../../components/BalanceCard.tsx';
import { ExpenseList } from '../../../components/ExpenseList.tsx';
import { Button, Empty, HeaderButton } from '../../../components/ui.tsx';
import { groupDebts, groupExpenses, myGroupBalance } from '../../../store/selectors.ts';
import { useS } from '../../../store/store.ts';

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { group, expenses, meId, people } = useS((s) => ({ group: s.groups[id], expenses: s.expenses, meId: s.meId!, people: s.people }));
  const list = useMemo(() => (group ? groupExpenses(expenses, group.id) : []), [expenses, group]);
  if (!group) return <Empty sf="questionmark.folder" ion="folder-open-outline" title="Gruppo non trovato" body="Forse è stato eliminato." />;

  const bal = myGroupBalance(expenses, group, meId);
  const myDebts = groupDebts(expenses, group).filter((d) => d.from === meId || d.to === meId);
  const context = myDebts.length
    ? myDebts.slice(0, 2).map((d) => (d.from === meId ? `devi a ${people[d.to]?.name}` : `${people[d.from]?.name} ti deve`)).join(' · ')
    : list.length ? 'Nessun conto in sospeso' : `${group.memberIds.length} persone`;

  return (
    <>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => <HeaderButton sf="gearshape" ion="settings-outline" label="Impostazioni del gruppo" onPress={() => router.push({ pathname: '/group/new', params: { id: group.id } })} />,
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 }}>
        <BalanceCard cents={bal} currency={group.currency} context={context}>
          <Button kind="highlight" title="Nuova spesa" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/expense/new', params: { groupId: group.id } })} />
          <Button kind="onCard" title="Salda" style={{ flex: 1 }} disabled={list.length === 0} onPress={() => router.push({ pathname: '/settle', params: { groupId: group.id } })} />
        </BalanceCard>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 10 }}>
          <Button kind="secondary" title="Saldi e totali" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/group/balances', params: { id: group.id } })} />
        </View>
        {list.length === 0 ? (
          <Empty sf="receipt" ion="receipt-outline" title="Ancora nessuna spesa" body="Aggiungi la prima: ovio la divide in parti uguali, oppure come preferisci." />
        ) : (
          <ExpenseList expenses={list} meId={meId} />
        )}
      </ScrollView>
    </>
  );
}
