import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useHydrated } from '../store/store.ts';
import { useColors, useIsDark } from '../theme/index.ts';

export default function RootLayout() {
  const c = useColors();
  const dark = useIsDark();
  const hydrated = useHydrated();
  const base = dark ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: c.tint, background: c.bg, card: c.bg, text: c.text, border: c.separator },
  };
  if (!hydrated) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemeProvider value={theme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: c.bg }, headerTintColor: c.tint, contentStyle: { backgroundColor: c.bg }, headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="expense/new" options={{ presentation: 'modal', title: 'Nuova spesa' }} />
          <Stack.Screen name="expense/[id]" options={{ title: 'Spesa' }} />
          <Stack.Screen name="group/new" options={{ presentation: 'modal', title: 'Nuovo gruppo' }} />
          <Stack.Screen name="group/balances" options={{ title: 'Saldi' }} />
          <Stack.Screen name="friend/new" options={{ presentation: 'formSheet', title: 'Nuovo amico', sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="settle" options={{ presentation: 'formSheet', title: 'Salda', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
