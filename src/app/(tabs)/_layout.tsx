import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, VectorIcon } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useStore } from '../../store/store.ts';
import { useColors } from '../../theme/index.ts';

export default function TabsLayout() {
  const meId = useStore((s) => s.meId);
  const c = useColors();
  if (!meId) return <Redirect href="/welcome" />;
  return (
    <NativeTabs tintColor={c.tint} iconColor={{ default: c['text-muted'], selected: c.tint }} labelStyle={{ selected: { color: c.tint } }}>
      <NativeTabs.Trigger name="groups">
        <NativeTabs.Trigger.Label>Gruppi</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" src={<VectorIcon family={Ionicons} name="people" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="friends">
        <NativeTabs.Trigger.Label>Amici</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" src={<VectorIcon family={Ionicons} name="person" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Label>Attività</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.fill" src={<VectorIcon family={Ionicons} name="time" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" src={<VectorIcon family={Ionicons} name="person-circle" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
