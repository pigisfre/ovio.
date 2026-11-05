import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Field } from '../../components/ui.tsx';
import { useFriends } from '../../store/selectors.ts';
import { useStore } from '../../store/store.ts';

export default function NewFriend() {
  const addFriend = useStore((s) => s.addFriend);
  const friends = useFriends();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const dup = friends.some((f) => f.name.toLowerCase() === name.trim().toLowerCase());
  const emailBad = email.trim().length > 0 && !/^\S+@\S+\.\S+$/.test(email.trim());
  const ok = name.trim().length > 0 && !dup && !emailBad;
  const save = () => {
    if (!ok) return;
    const id = addFriend(name, email);
    router.back();
    router.push(`/friends/${id}`);
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Nuovo amico' }} />
      <View style={{ padding: 16, gap: 16 }}>
        <Field label="Nome" value={name} onChangeText={setName} placeholder="Giulia" autoFocus maxLength={40} error={dup ? 'Hai già un amico con questo nome.' : null} />
        <Field label="Email (facoltativa)" value={email} onChangeText={setEmail} placeholder="giulia@esempio.it" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={emailBad ? 'Controlla l’indirizzo email.' : null} />
        <Button title="Aggiungi amico" onPress={save} disabled={!ok} />
      </View>
    </>
  );
}
