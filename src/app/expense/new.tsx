import { router, Stack, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { categoryIcon, groupIcon, Icon } from '../../components/Icon.tsx';
import { PersonPicker } from '../../components/PersonPicker.tsx';
import { Avatar, Check, Field, HeaderText, Row, Section, Segmented, Separator, T, tap } from '../../components/ui.tsx';
import { centsToInput, formatMoney, parseAmount } from '../../lib/money.ts';
import { computeShares, type SplitMethod } from '../../lib/split.ts';
import { useS } from '../../store/store.ts';
import type { Category } from '../../store/types.ts';
import { font, radius, tabular, useColors } from '../../theme/index.ts';

const methods: { value: SplitMethod; label: string; a11y: string }[] = [
  { value: 'equal', label: '=', a11y: 'In parti uguali' },
  { value: 'exact', label: '1,23', a11y: 'Importi esatti' },
  { value: 'percent', label: '%', a11y: 'Percentuali' },
  { value: 'shares', label: 'Quote', a11y: 'Quote' },
];
const methodHelp: Record<SplitMethod, string> = {
  equal: 'Diviso in parti uguali tra le persone scelte.',
  exact: 'Scrivi quanto spetta a ognuno.',
  percent: 'Scrivi la percentuale di ognuno: il totale deve fare 100%.',
  shares: 'Ognuno paga in proporzione alle sue quote, ad esempio 2 per chi ha due notti.',
};
const DAY = 86_400_000;

export default function ExpenseEditor() {
  const params = useLocalSearchParams<{ groupId?: string; friendId?: string; id?: string }>();
  const c = useColors();
  const { groups, people, meId, saveExpense, existing, currency } = useS((s) => ({
    groups: s.groups, people: s.people, meId: s.meId!, saveExpense: s.saveExpense,
    existing: params.id ? s.expenses[params.id] : undefined, currency: s.settings.currency,
  }));

  const initialGroup = existing ? existing.groupId : params.groupId ?? null;
  const [groupId, setGroupId] = useState<string | null>(initialGroup && groups[initialGroup] ? initialGroup : null);
  const group = groupId ? groups[groupId] : undefined;
  const pool = useMemo(
    () => (group ? group.memberIds : [meId, ...Object.keys(people).filter((id) => id !== meId)]).map((id) => people[id]).filter(Boolean),
    [group, people, meId],
  );

  const [description, setDescription] = useState(existing?.description ?? '');
  const [amount, setAmount] = useState(existing ? centsToInput(existing.total) : '');
  const [payerId, setPayerId] = useState(existing?.shares.find((s) => s.paid > 0)?.personId ?? meId);
  const [method, setMethod] = useState<SplitMethod>(existing?.method ?? 'equal');
  const [participants, setParticipants] = useState<string[]>(() => {
    if (existing) return existing.shares.filter((s) => s.owed > 0 || existing.values?.[s.personId] !== undefined).map((s) => s.personId);
    if (group) return [...group.memberIds];
    return params.friendId ? [meId, params.friendId] : [meId];
  });
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!existing?.values) return {};
    return Object.fromEntries(Object.entries(existing.values).map(([k, v]) => [k, existing.method === 'exact' ? centsToInput(v) : String(v).replace('.', ',')]));
  });
  const [category, setCategory] = useState<Category>(existing?.category ?? 'general');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [day, setDay] = useState<'today' | 'yesterday' | 'kept'>(existing ? 'kept' : 'today');

  // Unsaved changes are confirmed before a swipe or Annulla throws them away: sheets.md › Best practices.
  const snapshot = JSON.stringify({ description, amount, payerId, method, participants, values, category, notes, groupId });
  const [initialSnapshot] = useState(snapshot);
  const dirty = snapshot !== initialSnapshot;
  const allowLeave = usePreventRemove(dirty, ({ repeat }) => {
    const title = existing ? 'Scartare le modifiche?' : 'Scartare questa spesa?';
    if (Platform.OS === 'web') { if (globalThis.confirm?.(title)) repeat(); return; }
    Alert.alert(title, undefined, [
      { text: 'Continua a modificare', style: 'cancel' },
      { text: 'Scarta', style: 'destructive', onPress: repeat },
    ]);
  });

  const total = parseAmount(amount);
  const cur = group?.currency ?? existing?.currency ?? currency;

  const numeric = (pid: string): number => {
    const raw = values[pid];
    if (method === 'exact') return raw ? parseAmount(raw) ?? NaN : 0;
    if (method === 'shares' && (raw === undefined || raw === '')) return 1;
    const n = Number((raw ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };
  const numericValues = Object.fromEntries(participants.map((p) => [p, numeric(p)]));
  const invalidInput = participants.some((p) => Number.isNaN(numericValues[p]));
  const result = total && !invalidInput ? computeShares({ total, payerId, method, participants, values: numericValues }) : null;
  const ok = description.trim().length > 0 && !!result?.ok;

  const remainderText = (() => {
    if (!total || method === 'equal' || method === 'shares') return null;
    if (method === 'exact') {
      const assigned = participants.reduce((a, p) => a + (Number.isNaN(numericValues[p]) ? 0 : numericValues[p]), 0);
      const left = total - assigned;
      return left === 0 ? 'Tutto assegnato' : left > 0 ? `Mancano ${formatMoney(left, cur)}` : `${formatMoney(-left, cur)} di troppo`;
    }
    const sum = participants.reduce((a, p) => a + (Number.isNaN(numericValues[p]) ? 0 : numericValues[p]), 0);
    const left = Math.round((100 - sum) * 100) / 100;
    return left === 0 ? 'Totale 100%' : left > 0 ? `Manca il ${String(left).replace('.', ',')}%` : `${String(-left).replace('.', ',')}% di troppo`;
  })();

  const pickGroup = (gid: string | null) => {
    tap();
    setGroupId(gid);
    const g = gid ? groups[gid] : undefined;
    setParticipants(g ? [...g.memberIds] : params.friendId ? [meId, params.friendId] : [meId]);
    if (g && !g.memberIds.includes(payerId)) setPayerId(meId);
  };
  const toggle = (pid: string) => {
    tap();
    setParticipants((list) => (list.includes(pid) ? list.filter((x) => x !== pid) : [...list, pid]));
  };

  const save = () => {
    if (!ok || !result?.ok || !total) return;
    const date = day === 'kept' && existing ? existing.date : Date.now() - (day === 'yesterday' ? DAY : 0);
    saveExpense({
      id: existing?.id, groupId, description: description.trim(), total, currency: cur, method,
      values: method === 'equal' ? undefined : numericValues, shares: result.shares,
      category, notes: notes.trim() || undefined, isPayment: false, date,
    });
    allowLeave();
    router.back();
  };

  const preview = (pid: string) => (result?.ok ? result.shares.find((s) => s.personId === pid)?.owed ?? 0 : null);

  return (
    <>
      <Stack.Screen
        options={{
          title: existing ? 'Modifica spesa' : 'Nuova spesa',
          headerLeft: () => <HeaderText title="Annulla" onPress={() => router.back()} />,
          headerRight: () => <HeaderText title="Salva" bold disabled={!ok} onPress={save} />,
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={100}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 64 }}>
          <View style={{ padding: 16, gap: 12 }}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0,00"
              placeholderTextColor={c['text-muted']}
              keyboardType="decimal-pad"
              autoFocus={!existing}
              accessibilityLabel={`Importo in ${cur}`}
              style={[font('figure'), tabular, { color: c.text, textAlign: 'center', paddingVertical: 8 }]}
            />
            {amount && !total ? <T v="footnote" color={c.danger} style={{ textAlign: 'center' }}>Scrivi un importo valido, ad esempio 12,50.</T> : null}
            <Field label="Descrizione" value={description} onChangeText={setDescription} placeholder="Cena, benzina, affitto…" maxLength={120} returnKeyType="done" />
          </View>

          <View style={{ gap: 6 }}>
            <T v="footnote" muted style={{ marginHorizontal: 16 }}>Gruppo</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              <Chip on={groupId === null} label="Nessun gruppo" onPress={() => pickGroup(null)} sf="person.2" ion="people-outline" />
              {Object.values(groups).map((g) => (
                <Chip key={g.id} on={groupId === g.id} label={g.name} onPress={() => pickGroup(g.id)} sf={groupIcon[g.kind].sf} ion={groupIcon[g.kind].ion} />
              ))}
            </ScrollView>
          </View>

          <View style={{ marginTop: 18 }}>
            <PersonPicker label="Pagato da" people={pool} value={payerId} onChange={setPayerId} />
          </View>

          <View style={{ marginHorizontal: 16, marginTop: 18, gap: 6 }}>
            <T v="footnote" muted>Come dividere</T>
            <Segmented label="Metodo di divisione" value={method} options={methods} onChange={setMethod} />
            <T v="footnote" muted>{methodHelp[method]}</T>
          </View>

          <Section title="Tra chi" footer={remainderText ?? (result && !result.ok ? result.error : undefined)}>
            {pool.map((p, i) => {
              const on = participants.includes(p.id);
              const owed = preview(p.id);
              return (
                <View key={p.id}>
                  {i > 0 && <Separator />}
                  <Row
                    leading={<Avatar name={p.name} me={p.isMe} />}
                    title={p.isMe ? 'Tu' : p.name}
                    subtitle={on && owed !== null ? formatMoney(owed, cur) : on ? '—' : 'Non partecipa'}
                    onPress={() => toggle(p.id)}
                    accessibilityLabel={`${p.isMe ? 'Tu' : p.name}, ${on ? 'partecipa' : 'non partecipa'}`}
                    trailing={
                      on && method !== 'equal' ? (
                        <TextInput
                          value={values[p.id] ?? ''}
                          onChangeText={(t) => setValues((v) => ({ ...v, [p.id]: t }))}
                          placeholder={method === 'shares' ? '1' : method === 'percent' ? '%' : '0,00'}
                          placeholderTextColor={c['text-muted']}
                          keyboardType="decimal-pad"
                          accessibilityLabel={`${method === 'exact' ? 'Importo' : method === 'percent' ? 'Percentuale' : 'Quote'} di ${p.isMe ? 'te' : p.name}`}
                          style={[font('body'), tabular, { color: c.text, width: 96, minHeight: 40, textAlign: 'right', paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: c['surface-raised'] }]}
                        />
                      ) : (
                        <Check on={on} color={on ? c.tint : c['text-muted']} />
                      )
                    }
                  />
                </View>
              );
            })}
          </Section>

          <View style={{ gap: 6, marginTop: 24 }}>
            <T v="footnote" muted style={{ marginHorizontal: 16 }}>Categoria</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {(Object.keys(categoryIcon) as Category[]).map((k) => (
                <Chip key={k} on={category === k} label={categoryIcon[k].label} onPress={() => { tap(); setCategory(k); }} sf={categoryIcon[k].sf} ion={categoryIcon[k].ion} />
              ))}
            </ScrollView>
          </View>

          <View style={{ marginHorizontal: 16, marginTop: 24, gap: 16 }}>
            <View style={{ gap: 6 }}>
              <T v="footnote" muted>Quando</T>
              <Segmented
                label="Data"
                value={day}
                onChange={setDay}
                options={[
                  ...(existing ? [{ value: 'kept' as const, label: new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(existing.date) }] : []),
                  { value: 'today' as const, label: 'Oggi' },
                  { value: 'yesterday' as const, label: 'Ieri' },
                ]}
              />
            </View>
            <Field label="Note" value={notes} onChangeText={setNotes} placeholder="Facoltative" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function Chip({ on, label, onPress, sf, ion }: { on: boolean; label: string; onPress: () => void; sf: any; ion: any }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 44, borderRadius: radius.pill, backgroundColor: on ? c.accent : c.surface, borderWidth: 1, borderColor: on ? c.accent : c.separator }}
    >
      <Icon sf={sf} ion={ion} size={16} color={on ? c['on-accent'] : c.text} />
      <Text style={[font('subheadline'), { color: on ? c['on-accent'] : c.text, fontWeight: on ? '600' : '400' }]}>{label}</Text>
    </Pressable>
  );
}
