import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { Avatar, Button, Check, Field, HeaderText, Row, Section, Segmented, Separator, T } from '../../components/ui.tsx';
import { groupExpenses, myGroupBalance, useFriends } from '../../store/selectors.ts';
import { useS } from '../../store/store.ts';
import type { GroupKind } from '../../store/types.ts';
import { useColors } from '../../theme/index.ts';

const kinds: { value: GroupKind; label: string }[] = [
  { value: 'trip', label: 'Viaggio' },
  { value: 'home', label: 'Casa' },
  { value: 'couple', label: 'Coppia' },
  { value: 'other', label: 'Altro' },
];

function confirm(title: string, message: string, action: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [{ text: 'Annulla', style: 'cancel' }, { text: action, style: 'destructive', onPress: onOk }]);
}

export default function GroupForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const c = useColors();
  const { existing, meId, meName, saveGroup, deleteGroup, addFriend, currency, simplify, expenses } = useS((s) => ({
    existing: id ? s.groups[id] : undefined, meId: s.meId!, saveGroup: s.saveGroup, deleteGroup: s.deleteGroup, addFriend: s.addFriend,
    currency: s.settings.currency, simplify: s.settings.simplifyByDefault, expenses: s.expenses, meName: s.people[s.meId!]?.name ?? 'Tu',
  }));
  const friends = useFriends();
  const [name, setName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<GroupKind>(existing?.kind ?? 'trip');
  const [members, setMembers] = useState<string[]>(existing?.memberIds.filter((m) => m !== meId) ?? []);
  const [newName, setNewName] = useState('');
  const usedIds = new Set(existing ? groupExpenses(expenses, existing.id).flatMap((e) => e.shares.map((s) => s.personId)) : []);

  const ok = name.trim().length > 0;
  const save = () => {
    if (!ok) return;
    const gid = saveGroup({
      id: existing?.id, name: name.trim(), kind, memberIds: [meId, ...members],
      currency: existing?.currency ?? currency, simplifyDebts: existing?.simplifyDebts ?? simplify,
    });
    if (existing) router.back();
    else { router.back(); router.push(`/groups/${gid}`); }
  };
  const addNew = () => {
    const n = newName.trim();
    if (!n) return;
    const fid = addFriend(n);
    setMembers((m) => [...m, fid]);
    setNewName('');
  };
  const toggle = (pid: string) => {
    if (usedIds.has(pid) && members.includes(pid)) return;
    setMembers((m) => (m.includes(pid) ? m.filter((x) => x !== pid) : [...m, pid]));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Modifica gruppo' : 'Nuovo gruppo',
          headerLeft: () => <HeaderText title="Annulla" onPress={() => router.back()} />,
          headerRight: () => <HeaderText title={existing ? 'Salva' : 'Crea'} bold disabled={!ok} onPress={save} />,
        }}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ padding: 16, gap: 16 }}>
          <Field label="Nome del gruppo" value={name} onChangeText={setName} placeholder="Weekend a Lisbona" autoFocus={!existing} maxLength={60} returnKeyType="done" />
          <View style={{ gap: 6 }}>
            <T v="footnote" muted>Tipo</T>
            <Segmented label="Tipo di gruppo" value={kind} options={kinds} onChange={setKind} />
          </View>
        </View>
        <Section title="Persone" footer="Chi ha già delle spese nel gruppo non può essere tolto.">
          <Row leading={<Avatar name={meName} me />} title="Tu" trailing={<Check on color={c.tint} />} />
          {friends.map((f) => (
            <View key={f.id}>
              <Separator />
              <Row
                leading={<Avatar name={f.name} />}
                title={f.name}
                trailing={<Check on={members.includes(f.id)} color={members.includes(f.id) ? c.tint : c['text-muted']} />}
                onPress={() => toggle(f.id)}
                accessibilityLabel={`${f.name}, ${members.includes(f.id) ? 'nel gruppo' : 'non nel gruppo'}`}
              />
            </View>
          ))}
        </Section>
        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field label="Aggiungi una persona" value={newName} onChangeText={setNewName} placeholder="Nome" onSubmitEditing={addNew} returnKeyType="done" maxLength={40} />
          </View>
          <Button kind="secondary" title="Aggiungi" onPress={addNew} disabled={!newName.trim()} />
        </View>
        {existing ? (
          <View style={{ margin: 16, marginTop: 32 }}>
            <Button
              kind="destructive"
              title="Elimina gruppo"
              onPress={() => {
                const bal = myGroupBalance(expenses, existing, meId);
                confirm(
                  `Eliminare “${existing.name}”?`,
                  bal !== 0 ? 'Il gruppo ha ancora conti aperti. Eliminandolo cancelli anche tutte le sue spese.' : 'Cancelli anche tutte le spese del gruppo.',
                  'Elimina',
                  () => { deleteGroup(existing.id); router.dismissAll(); },
                );
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
