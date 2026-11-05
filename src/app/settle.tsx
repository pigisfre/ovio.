import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { groupIcon } from '../components/Icon.tsx';
import { PersonPicker } from '../components/PersonPicker.tsx';
import { Button, Check, Field, GroupAvatar, Row, Section, Separator, T } from '../components/ui.tsx';
import { centsToInput, formatMoney, parseAmount } from '../lib/money.ts';
import { paymentShares } from '../lib/split.ts';
import { friendContexts, groupDebts, type SettleContext } from '../store/selectors.ts';
import { useS } from '../store/store.ts';
import { useColors } from '../theme/index.ts';

const ALL = '__all__';

export default function Settle() {
  const p = useLocalSearchParams<{ groupId?: string; friendId?: string; from?: string; to?: string; amount?: string }>();
  return p.friendId && !p.groupId ? <SettleWithFriend friendId={p.friendId} /> : <SettleInGroup {...p} />;
}

/** From a friend's page: pick where the payment goes, so group balances clear too. */
function SettleWithFriend({ friendId }: { friendId: string }) {
  const c = useColors();
  const { groups, expenses, people, meId, saveExpense, currency } = useS((s) => ({
    groups: s.groups, expenses: s.expenses, people: s.people, meId: s.meId!, saveExpense: s.saveExpense, currency: s.settings.currency,
  }));
  const friend = people[friendId];
  const contexts = useMemo(() => friendContexts(expenses, groups, meId, friendId), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [where, setWhere] = useState<string>(contexts.length > 1 ? ALL : contexts[0]?.groupId ?? 'none');
  const chosen: SettleContext | undefined = contexts.find((x) => (x.groupId ?? 'none') === where);
  const [amount, setAmount] = useState(chosen ? centsToInput(Math.abs(chosen.balance)) : '');
  const cents = parseAmount(amount);

  const curOf = (ctx: SettleContext) => (ctx.groupId ? groups[ctx.groupId]?.currency : undefined) ?? currency;
  const label = (ctx: SettleContext) => (ctx.groupId ? groups[ctx.groupId]?.name ?? 'Gruppo' : 'Fuori dai gruppi');
  const sentence = (b: number) => (b > 0 ? `${friend?.name} ti deve` : `devi a ${friend?.name}`);

  const pick = (key: string) => {
    setWhere(key);
    const ctx = contexts.find((x) => (x.groupId ?? 'none') === key);
    if (ctx) setAmount(centsToInput(Math.abs(ctx.balance)));
  };

  const record = (ctx: SettleContext | null, value: number) => {
    const bal = ctx?.balance ?? 0;
    const [from, to] = bal > 0 ? [friendId, meId] : [meId, friendId];
    saveExpense({
      groupId: ctx?.groupId ?? null, description: 'Pagamento', total: value, currency: ctx ? curOf(ctx) : currency, method: 'exact',
      shares: paymentShares(from, to, value), category: 'general', isPayment: true, date: Date.now(),
    });
  };

  const okSingle = where !== ALL && !!cents && cents > 0 && !!chosen;
  const save = () => {
    if (where === ALL) contexts.forEach((ctx) => record(ctx, Math.abs(ctx.balance)));
    else if (okSingle && chosen && cents) record(chosen, cents);
    router.back();
  };

  if (!friend) return null;
  if (contexts.length === 0) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Stack.Screen options={{ title: 'Registra un pagamento' }} />
        <T v="title3">Siete già in pari</T>
        <T muted>Con {friend.name} non c’è nessun conto aperto, né nei gruppi né fuori.</T>
        <Button kind="secondary" title="Chiudi" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Registra un pagamento' }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <Section title="Dove registrarlo" footer="Il pagamento entra nel gruppo scelto, così anche il saldo del gruppo torna giusto.">
          {contexts.length > 1 ? (
            <>
              <Row
                title="Tutto"
                subtitle={`${contexts.length} pagamenti, uno per ogni conto aperto`}
                trailing={<Check on={where === ALL} color={where === ALL ? c.tint : c['text-muted']} />}
                onPress={() => setWhere(ALL)}
                accessibilityLabel={`Tutto, ${contexts.length} pagamenti`}
              />
              <Separator />
            </>
          ) : null}
          {contexts.map((ctx, i) => {
            const key = ctx.groupId ?? 'none';
            const g = ctx.groupId ? groups[ctx.groupId] : undefined;
            const ic = g ? groupIcon[g.kind] : { sf: 'person.2.fill' as const, ion: 'people' as const };
            const text = `${sentence(ctx.balance)} ${formatMoney(Math.abs(ctx.balance), curOf(ctx))}`;
            return (
              <View key={key}>
                {i > 0 && <Separator />}
                <Row
                  leading={<GroupAvatar sf={ic.sf} ion={ic.ion} />}
                  title={label(ctx)}
                  subtitle={text}
                  trailing={<Check on={where === key} color={where === key ? c.tint : c['text-muted']} />}
                  onPress={() => pick(key)}
                  accessibilityLabel={`${label(ctx)}, ${text}`}
                />
              </View>
            );
          })}
        </Section>

        {where === ALL ? (
          <View style={{ margin: 16, gap: 8 }}>
            <T v="footnote" muted>
              ovio registra {contexts.length} pagamenti che azzerano ogni conto: {contexts.map((x) => `${label(x)} ${formatMoney(Math.abs(x.balance), curOf(x))}`).join(', ')}.
            </T>
          </View>
        ) : (
          <View style={{ margin: 16, gap: 8 }}>
            {chosen ? <T v="subheadline">{chosen.balance > 0 ? `${friend.name} paga te` : `Tu paghi ${friend.name}`}</T> : null}
            <Field
              label={`Importo (${chosen ? curOf(chosen) : currency})`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
              style={{ fontSize: 34, fontWeight: '700', minHeight: 64 }}
              error={amount && !cents ? 'Scrivi un importo valido, ad esempio 12,50.' : null}
            />
            <T v="footnote" muted>Puoi registrare anche un pagamento parziale.</T>
          </View>
        )}
        <View style={{ marginHorizontal: 16 }}>
          <Button title={where === ALL ? `Registra ${contexts.length} pagamenti` : 'Registra pagamento'} onPress={save} disabled={where !== ALL && !okSingle} />
        </View>
      </ScrollView>
    </>
  );
}

function SettleInGroup(p: { groupId?: string; from?: string; to?: string; amount?: string }) {
  const { groups, expenses, people, meId, saveExpense, currency } = useS((s) => ({
    groups: s.groups, expenses: s.expenses, people: s.people, meId: s.meId!, saveExpense: s.saveExpense, currency: s.settings.currency,
  }));
  const group = p.groupId ? groups[p.groupId] : undefined;
  const cur = group?.currency ?? currency;

  const suggestion = useMemo(() => {
    if (p.from && p.to) return { from: p.from, to: p.to, amount: Number(p.amount ?? 0) };
    if (group) {
      const debts = groupDebts(expenses, group);
      const d = debts.find((x) => x.from === meId || x.to === meId) ?? debts[0];
      return d ? { from: d.from, to: d.to, amount: d.amount } : { from: meId, to: group.memberIds.find((m) => m !== meId) ?? meId, amount: 0 };
    }
    return { from: meId, to: meId, amount: 0 };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pool = (group ? group.memberIds : [meId]).map((id) => people[id]).filter(Boolean);
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
