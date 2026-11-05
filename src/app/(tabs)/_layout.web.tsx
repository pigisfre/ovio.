import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { useStore } from '../../store/store.ts';
import { useColors } from '../../theme/index.ts';

type Ion = ComponentProps<typeof Ionicons>['name'];
const tabs: { name: string; title: string; icon: Ion; iconOn: Ion }[] = [
  { name: 'groups', title: 'Gruppi', icon: 'people-outline', iconOn: 'people' },
  { name: 'friends', title: 'Amici', icon: 'person-outline', iconOn: 'person' },
  { name: 'activity', title: 'Attività', icon: 'time-outline', iconOn: 'time' },
  { name: 'account', title: 'Account', icon: 'person-circle-outline', iconOn: 'person-circle' },
];

/** Web: a JS bottom tab bar (the native tab bar is iOS/Android only). */
export default function TabsLayoutWeb() {
  const meId = useStore((s) => s.meId);
  const c = useColors();
  if (!meId) return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c['text-muted'],
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.separator, height: 64, paddingTop: 6, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? t.iconOn : t.icon} size={size} color={color as string} /> }}
        />
      ))}
    </Tabs>
  );
}
