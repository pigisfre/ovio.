import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { PersonPicker } from '../components/PersonPicker.tsx';
import { Button, Field, T } from '../components/ui.tsx';
import { centsToInput, formatMoney, parseAmount } from '../lib/money.ts';
import { paymentShares } from '../lib/split.ts';
import { friendBalance, groupDebts } from '../store/selectors.ts';
import { useS } from '../store/store.ts';

export default function Settle() {
  const p = useLocalSearchParams<{ groupId?: string; friendId?: string; from?: string; to?: string; amount?: string }>();
  const { groups, expenses, people, meId, saveExpense, currency } = useS((s) => ({
    groups: s.groups, expenses: s.expenses, people: s.people, meId: s.meId!, saveExpense: s.saveExpense, currency: s.settings.currency,
  }));
  const group = p.groupId ? groups[p.groupId] : undefined;
  const cur = group?.currency ?? currency;

  const suggestion = useMemo(() => {
    if (p.from && p.to) return { from: p.from, to: p.to, amount: Number(p.amount ?? 0) };
    if (group) {
      const d = groupDebts(expenses, group).find((x) => x.from === meId || x.to === meId) ?? groupDebts(expenses, group)[0];
      return d ? { from: d.from, to: d.to, amount: d.amount } : { from: meId, to: group.memberIds.find((m) => m !== meId) ?? meId, amount: 0 };
    }
    if (p.friendId) {
      const b = friendBalance(expenses, groups, meId, p.friendId);
      return b >= 0 ? { from: p.friendId, to: meId, amount: b } : { from: meId, to: p.friendId, amount: -b };
    }
    return { from: meId, to: meId, amount: 0 };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pool = (group ? group.memberIds : [meId, p.friendId ?? '']).map((id) => people[id]).filter(Boolean);
  const [from, setFrom] = useState(suggestion.from);
  const [to, setTo] = useState(suggestion.to);
  const [amount, setAmount] = useState(suggestion.amount ? centsToInput(suggestion.amount) : '');
  const cents = parseAmount(amount);
  const ok = !!cents && cents > 0 && from !== to && !!from && !!to;

  const save = () => {
    if (!ok || !cents) return;
    saveExpense({
      groupId: group?.id ?? null, description: 'Pagamento', total: cents, currency: cur, method: 'exact',
      shares: paymentShares(from, to, cents), category: 'general', isPayment: true, date: Date.now(),
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Registra un pagamento' }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: 16, gap: 18 }}>
        <PersonPicker label="Chi paga" people={pool} value={from} onChange={(v) => { setFrom(v); if (v === to) setTo(pool.find((x) => x.id !== v)?.id ?? v); }} />
        <PersonPicker label="A chi" people={pool} value={to} onChange={setTo} exclude={from} />
        <View style={{ marginHorizontal: 16, gap: 8 }}>
          <Field
            label={`Importo (${cur})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            style={{ fontSize: 34, fontWeight: '700', minHeight: 64 }}
            error={amount && !cents ? 'Scrivi un importo valido, ad esempio 12,50.' : null}
          />
          {suggestion.amount > 0 ? (
            <T v="footnote" muted>Saldo suggerito: {formatMoney(suggestion.amount, cur)}. Puoi registrare anche un pagamento parziale.</T>
          ) : (
            <T v="footnote" muted>Non risultano debiti in sospeso, ma puoi registrare comunque un pagamento.</T>
          )}
        </View>
        <View style={{ marginHorizontal: 16 }}>
          <Button title="Registra pagamento" onPress={save} disabled={!ok} />
        </View>
      </ScrollView>
    </>
  );
}
