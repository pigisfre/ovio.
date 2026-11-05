import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { BalanceCard } from '../../../components/BalanceCard.tsx';
import { Amount, Avatar, Empty, HeaderButton, Row, Section, Separator } from '../../../components/ui.tsx';
import { friendBalance, useFriends } from '../../../store/selectors.ts';
import { useS } from '../../../store/store.ts';

export default function Friends() {
  const { groups, expenses, meId, currency } = useS((s) => ({ groups: s.groups, expenses: s.expenses, meId: s.meId!, currency: s.settings.currency }));
  const friends = useFriends();
  const rows = useMemo(() => friends.map((f) => ({ f, bal: friendBalance(expenses, groups, meId, f.id) })), [friends, expenses, groups, meId]);
  const total = rows.reduce((a, r) => a + r.bal, 0);
  const owe = rows.filter((r) => r.bal < 0).length;
  const owed = rows.filter((r) => r.bal > 0).length;
  const open = rows.filter((r) => r.bal !== 0);
  const settled = rows.filter((r) => r.bal === 0);

  const section = (title: string, list: typeof rows) =>
    list.length ? (
      <Section title={title}>
        {list.map(({ f, bal }, i) => (
          <View key={f.id}>
            {i > 0 && <Separator />}
            <Row leading={<Avatar name={f.name} />} title={f.name} trailing={<Amount cents={bal} currency={currency} one />} chevron onPress={() => router.push(`/friends/${f.id}`)} />
          </View>
        ))}
      </Section>
    ) : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Amici', headerRight: () => <HeaderButton sf="person.badge.plus" ion="person-add-outline" label="Aggiungi amico" onPress={() => router.push('/friend/new')} /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 }}>
        {friends.length === 0 ? (
          <Empty sf="person.2" ion="people-outline" title="Aggiungi i tuoi amici" body="Coinquilini, compagni di viaggio, la persona con cui dividi il caffè: aggiungili e ovio tiene il conto." action={{ title: 'Aggiungi un amico', onPress: () => router.push('/friend/new') }} />
        ) : (
          <>
            <BalanceCard cents={total} currency={currency} context={[owed ? `${owed} ti ${owed === 1 ? 'deve' : 'devono'}` : '', owe ? `devi a ${owe}` : ''].filter(Boolean).join(' · ') || 'con tutti'} />
            {section('Conti aperti', open)}
            {section('In pari', settled)}
          </>
        )}
      </ScrollView>
    </>
  );
}
