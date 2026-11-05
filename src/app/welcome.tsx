import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, T } from '../components/ui.tsx';
import { useStore } from '../store/store.ts';
import { font, useColors } from '../theme/index.ts';

export default function Welcome() {
  const c = useColors();
  const createMe = useStore((s) => s.createMe);
  const [name, setName] = useState('');
  const ok = name.trim().length > 0;
  const go = () => {
    if (!ok) return;
    createMe(name);
    router.replace('/groups');
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrap}>
        <View style={s.hero}>
          <View style={s.mark} accessibilityLabel="ovio">
            <View style={[s.dot, { backgroundColor: c.highlight }]} />
            <View style={[s.dot, s.dot2, { backgroundColor: c.periwinkle }]} />
          </View>
          <Text style={[font('largeTitle'), { color: c.text, fontSize: 48, lineHeight: 54 }]} accessibilityRole="header">ovio</Text>
          <T v="title3" muted style={{ textAlign: 'center' }}>Le spese in comune, sempre in pari.</T>
        </View>
        <View style={{ gap: 16 }}>
          <Field
            label="Come ti chiami?"
            value={name}
            onChangeText={setName}
            placeholder="Il tuo nome"
            autoFocus
            autoComplete="name"
            textContentType="givenName"
            returnKeyType="go"
            onSubmitEditing={go}
            maxLength={40}
          />
          <Button title="Inizia" onPress={go} disabled={!ok} />
          <T v="footnote" muted style={{ textAlign: 'center' }}>I tuoi dati restano su questo dispositivo.</T>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'space-between', padding: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mark: { flexDirection: 'row', marginBottom: 8 },
  dot: { width: 56, height: 56, borderRadius: 28 },
  dot2: { marginLeft: -16, opacity: 0.95 },
});
