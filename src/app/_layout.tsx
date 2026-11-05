import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { glassHeader, sheetHeader } from '../components/headerOptions.tsx';
import { UndoToast } from '../components/UndoToast.tsx';
import { useHydrated } from '../store/store.ts';
import { useApplyAppearance, useColors, useIsDark } from '../theme/index.ts';

/** Web only: a visible keyboard focus ring on every control (accessibility.md). */
function useWebFocusRing(color: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = `[role="button"]:focus-visible,[role="tab"]:focus-visible,[role="radio"]:focus-visible,[role="switch"]:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid ${color};outline-offset:2px}`;
    document.head.appendChild(el);
    return () => el.remove();
  }, [color]);
}

export default function RootLayout() {
  const c = useColors();
  const dark = useIsDark();
  const hydrated = useHydrated();
  useApplyAppearance();
  useWebFocusRing(c.tint);
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
        <View style={Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: c.bg, boxShadow: '0 0 0 1px ' + c.separator, overflow: 'hidden' } : { flex: 1 }}>
        <Stack screenOptions={{ ...sheetHeader(c), headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="expense/new" options={{ presentation: 'modal', title: 'Nuova spesa' }} />
          <Stack.Screen name="expense/[id]" options={{ ...glassHeader(c, dark), title: 'Spesa' }} />
          <Stack.Screen name="group/new" options={{ presentation: 'modal', title: 'Nuovo gruppo' }} />
          <Stack.Screen name="group/balances" options={{ ...glassHeader(c, dark), title: 'Saldi' }} />
          <Stack.Screen name="friend/new" options={{ presentation: 'formSheet', title: 'Nuovo amico', sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="settle" options={{ presentation: 'formSheet', title: 'Salda', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true }} />
        </Stack>
        <UndoToast />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
