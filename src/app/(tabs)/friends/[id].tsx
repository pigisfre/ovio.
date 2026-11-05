import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { BalanceCard } from '../../../components/BalanceCard.tsx';
import { ExpenseList } from '../../../components/ExpenseList.tsx';
import { Button, Empty } from '../../../components/ui.tsx';
import { expensesWith, friendBalance } from '../../../store/selectors.ts';
import { useS } from '../../../store/store.ts';

export default function FriendDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friend, groups, expenses, meId, currency, removeFriend } = useS((s) => ({
    friend: s.people[id], groups: s.groups, expenses: s.expenses, meId: s.meId!, currency: s.settings.currency, removeFriend: s.removeFriend,
  }));
  const list = useMemo(() => expensesWith(expenses, meId, id), [expenses, meId, id]);
  if (!friend) return <Empty sf="person.slash" ion="person-remove-outline" title="Amico non trovato" body="Forse è stato rimosso." />;
  const bal = friendBalance(expenses, groups, meId, id);
  const shared = Object.values(groups).filter((g) => g.memberIds.includes(id)).length;

  const remove = () => {
    if (!removeFriend(id)) {
      const msg = `${friend.name} è ancora in qualche gruppo o spesa. Toglilo da lì prima di rimuoverlo.`;
      if (Platform.OS === 'web') globalThis.alert?.(msg); else Alert.alert('Non si può rimuovere', msg);
      return;
    }
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: friend.name }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 }}>
        <BalanceCard cents={bal} currency={currency} context={bal === 0 ? (shared ? `${shared} gruppi in comune` : undefined) : bal > 0 ? `${friend.name} ti deve` : `devi a ${friend.name}`}>
          <Button kind="highlight" title="Nuova spesa" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/expense/new', params: { friendId: id } })} />
          <Button kind="onCard" title="Salda" style={{ flex: 1 }} disabled={bal === 0} onPress={() => router.push({ pathname: '/settle', params: { friendId: id } })} />
        </BalanceCard>
        {list.length === 0 ? (
          <Empty sf="receipt" ion="receipt-outline" title={`Niente in comune con ${friend.name}`} body="Aggiungi una spesa per iniziare a dividerla." />
        ) : (
          <ExpenseList expenses={list} meId={meId} />
        )}
        <View style={{ margin: 16, marginTop: 32 }}>
          <Button kind="destructive" title="Rimuovi amico" onPress={remove} />
        </View>
      </ScrollView>
    </>
  );
}
