import { Stack } from 'expo-router';
import { useColors } from '../../../theme/index.ts';

export default function TabStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.tint,
        headerTitleStyle: { color: c.text },
        headerLargeTitleStyle: { color: c.text },
        contentStyle: { backgroundColor: c.bg },
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  );
}
