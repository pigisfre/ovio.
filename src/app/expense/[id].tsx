import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { categoryIcon, Icon } from '../../components/Icon.tsx';
import { Avatar, Button, Empty, HeaderText, Row, Section, Separator, T } from '../../components/ui.tsx';
import { formatMoney } from '../../lib/money.ts';
import { displayName } from '../../store/selectors.ts';
import { useS } from '../../store/store.ts';
import { font, radius, tabular, useColors } from '../../theme/index.ts';

const methodLabel = { equal: 'in parti uguali', exact: 'per importi esatti', percent: 'in percentuale', shares: 'per quote' };
const dateFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function ExpenseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const { e, people, groups, meId, deleteExpense } = useS((s) => ({ e: s.expenses[id], people: s.people, groups: s.groups, meId: s.meId!, deleteExpense: s.deleteExpense }));
  if (!e) return <Empty sf="trash" ion="trash-outline" title="Spesa eliminata" body="Questa spesa non c’è più." />;

  const ic = e.isPayment ? { sf: 'arrow.left.arrow.right' as const, ion: 'swap-horizontal' as const } : categoryIcon[e.category] ?? categoryIcon.general;
  const remove = () => {
    const go = () => { deleteExpense(e.id); router.back(); };
    const title = e.isPayment ? 'Eliminare il pagamento?' : `Eliminare “${e.description}”?`;
    const msg = 'I saldi verranno ricalcolati.';
    if (Platform.OS === 'web') { if (globalThis.confirm?.(`${title}\n${msg}`)) go(); return; }
    Alert.alert(title, msg, [{ text: 'Annulla', style: 'cancel' }, { text: 'Elimina', style: 'destructive', onPress: go }]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: e.isPayment ? 'Pagamento' : 'Spesa',
          headerRight: e.isPayment ? undefined : () => <HeaderText title="Modifica" onPress={() => router.push({ pathname: '/expense/new', params: { id: e.id } })} />,
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ alignItems: 'center', gap: 8, padding: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: radius.lg, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
            <Icon sf={ic.sf} ion={ic.ion} size={30} color={c['card-figure']} />
          </View>
          <T v="title2" style={{ textAlign: 'center' }}>{e.isPayment ? 'Pagamento' : e.description}</T>
          <T v="largeTitle" style={[tabular, font('figure')]}>{formatMoney(e.total, e.currency)}</T>
          <T v="footnote" muted style={{ textAlign: 'center' }}>
            {dateFmt.format(e.date)}{e.groupId && groups[e.groupId] ? ` · ${groups[e.groupId].name}` : ''}
          </T>
        </View>
        <Section title={e.isPayment ? 'Dettagli' : `Diviso ${methodLabel[e.method]}`}>
          {e.shares.map((s, i) => {
            const p = people[s.personId];
            const parts = [] as string[];
            if (s.paid > 0) parts.push(`${p?.isMe ? 'hai' : 'ha'} pagato ${formatMoney(s.paid, e.currency)}`);
            if (s.owed > 0) parts.push(e.isPayment ? `ha ricevuto ${formatMoney(s.owed, e.currency)}` : `${p?.isMe ? 'la tua parte' : 'la sua parte'} ${formatMoney(s.owed, e.currency)}`);
            return (
              <View key={s.personId}>
                {i > 0 && <Separator />}
                <Row leading={<Avatar name={p?.name ?? '?'} me={p?.isMe} />} title={displayName(p, { subject: true })} subtitle={parts.join(' · ')} />
              </View>
            );
          })}
        </Section>
        {e.notes ? (
          <Section title="Note">
            <View style={{ padding: 16 }}><T>{e.notes}</T></View>
          </Section>
        ) : null}
        <T v="footnote" muted style={{ marginHorizontal: 32, marginTop: 12 }}>
          Ultima modifica: {new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(e.updatedAt)}
        </T>
        <View style={{ margin: 16, marginTop: 24 }}>
          <Button kind="destructive" title={e.isPayment ? 'Elimina pagamento' : 'Elimina spesa'} onPress={remove} />
        </View>
      </ScrollView>
    </>
  );
}
