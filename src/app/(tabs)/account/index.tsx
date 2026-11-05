import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Switch, View } from 'react-native';
import { Avatar, Button, Field, Row, Section, Segmented, Separator, T } from '../../../components/ui.tsx';
import { useMe } from '../../../store/selectors.ts';
import { useS } from '../../../store/store.ts';
import { useColors } from '../../../theme/index.ts';
import Constants from 'expo-constants';

const currencies = [
  { value: 'EUR', label: '€ EUR' },
  { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'CHF', label: 'CHF' },
];

export default function Account() {
  const c = useColors();
  const me = useMe();
  const { settings, setSettings, updateMe, reset } = useS((s) => ({ settings: s.settings, setSettings: s.setSettings, updateMe: s.updateMe, reset: s.reset }));
  const [name, setName] = useState(me?.name ?? '');

  const wipe = () => {
    const go = () => { reset(); router.replace('/welcome'); };
    const title = 'Cancellare tutti i dati?';
    const msg = 'Gruppi, amici e spese verranno eliminati da questo dispositivo. Non si può annullare.';
    if (Platform.OS === 'web') { if (globalThis.confirm?.(`${title}\n${msg}`)) go(); return; }
    Alert.alert(title, msg, [{ text: 'Annulla', style: 'cancel' }, { text: 'Cancella tutto', style: 'destructive', onPress: go }]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Account' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 8 }}>
          <Avatar name={me?.name ?? '?'} me size={72} />
          <T v="title2">{me?.name}</T>
        </View>
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Field label="Nome" value={name} onChangeText={setName} onEndEditing={() => name.trim() && updateMe({ name: name.trim() })} maxLength={40} returnKeyType="done" />
        </View>
        <Section title="Valuta predefinita" footer="Vale per i nuovi gruppi e le spese fuori dai gruppi.">
          <View style={{ padding: 12 }}>
            <Segmented label="Valuta predefinita" value={settings.currency} options={currencies} onChange={(v) => setSettings({ currency: v })} />
          </View>
        </Section>
        <Section footer="Nei nuovi gruppi ovio riduce al minimo il numero di pagamenti necessari.">
          <Row
            title="Semplifica i debiti"
            trailing={<Switch value={settings.simplifyByDefault} trackColor={{ true: c.accent }} onValueChange={(v) => setSettings({ simplifyByDefault: v })} accessibilityLabel="Semplifica i debiti nei nuovi gruppi" />}
          />
        </Section>
        <Section title="Informazioni">
          <Row title="Versione" trailing={<T muted>{Constants.expoConfig?.version ?? '1.0.0'}</T>} />
          <Separator inset={16} />
          <Row title="Dati" subtitle="Salvati solo su questo dispositivo" />
        </Section>
        <View style={{ margin: 16, marginTop: 32 }}>
          <Button kind="destructive" title="Cancella tutti i dati" onPress={wipe} />
        </View>
      </ScrollView>
    </>
  );
}
