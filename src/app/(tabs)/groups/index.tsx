import { Screen } from '../../../components/Screen.tsx';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { BalanceCard } from '../../../components/BalanceCard.tsx';
import { groupIcon } from '../../../components/Icon.tsx';
import { Amount, Button, Empty, GroupAvatar, HeaderButton, Row, Section, Separator } from '../../../components/ui.tsx';
import { friendBalance, myGroupBalance } from '../../../store/selectors.ts';
import { useS } from '../../../store/store.ts';

export default function Groups() {
  const { groups, expenses, meId, people, currency } = useS((s) => ({ groups: s.groups, expenses: s.expenses, meId: s.meId!, people: s.people, currency: s.settings.currency }));
  const list = useMemo(() => Object.values(groups).sort((a, b) => b.createdAt - a.createdAt), [groups]);
  const total = useMemo(
    () => Object.values(people).filter((p) => !p.isMe).reduce((sum, p) => sum + friendBalance(expenses, groups, meId, p.id), 0),
    [people, expenses, groups, meId],
  );
  const open = list.filter((g) => myGroupBalance(expenses, g, meId) !== 0).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Gruppi', headerRight: () => <HeaderButton sf="plus" ion="add" label="Nuovo gruppo" onPress={() => router.push('/group/new')} /> }} />
      <Screen contentContainerStyle={{ paddingBottom: 120 }}>
        <BalanceCard cents={total} currency={currency} context={list.length ? (open ? `${open} ${open === 1 ? 'gruppo aperto' : 'gruppi aperti'}` : 'in tutti i gruppi') : undefined}>
          <Button kind="highlight" title="Nuova spesa" style={{ flex: 1 }} onPress={() => router.push('/expense/new')} />
        </BalanceCard>
        {list.length === 0 ? (
          <Empty sf="person.3" ion="people-outline" title="Nessun gruppo, per ora" body="Crea un gruppo per una casa, un viaggio o una cena: ovio tiene il conto per tutti." action={{ title: 'Crea un gruppo', onPress: () => router.push('/group/new') }} />
        ) : (
          <Section title="I tuoi gruppi">
            {list.map((g, i) => {
              const bal = myGroupBalance(expenses, g, meId);
              const ic = groupIcon[g.kind];
              return (
                <View key={g.id}>
                  {i > 0 && <Separator />}
                  <Row
                    leading={<GroupAvatar sf={ic.sf} ion={ic.ion} />}
                    title={g.name}
                    subtitle={`${g.memberIds.length} persone`}
                    trailing={<Amount cents={bal} currency={g.currency} />}
                    chevron
                    onPress={() => router.push(`/groups/${g.id}`)}
                  />
                </View>
              );
            })}
          </Section>
        )}
      </Screen>
    </>
  );
}
