import { useEffect } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';
import tokens from '../../replica/design/tokens.json';
import { useStore } from '../store/store.ts';

// Two appearances: dark = Midnight backgrounds + Cloud text (the default),
// light = Cloud backgrounds + Midnight text (see replica/design/tokens.json → roles).
type ColorKey = keyof typeof tokens.color.light;
export type Colors = Record<ColorKey, string>;
export type GlassTokens = typeof tokens.glass.dark;

export const palette = tokens.palette;
export const type = tokens.type;
export const radius = tokens.radius;
export const space = tokens.space;
export const control = tokens.control;

/** Dark by default; Account → Aspetto can choose Chiaro or Automatico (follows the system). */
export function useAppearance() {
  return useStore((s) => s.settings.appearance ?? 'dark');
}

export function useIsDark() {
  const pref = useAppearance();
  const system = useColorScheme();
  if (pref === 'system') return system === 'dark';
  return pref === 'dark';
}

/** Applies the choice to native UI too (alerts, keyboards, the system tab bar and glass). */
export function useApplyAppearance() {
  const pref = useAppearance();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      Appearance.setColorScheme?.(pref === 'system' ? ('auto' as never) : pref);
    } catch {}
  }, [pref]);
}

export function useColors(): Colors {
  return useIsDark() ? tokens.color.dark : tokens.color.light;
}

export function useGlassTokens(): GlassTokens {
  return useIsDark() ? tokens.glass.dark : tokens.glass.light;
}

type TypeKey = keyof typeof tokens.type;
export function font(key: TypeKey) {
  const t = tokens.type[key];
  return { fontSize: t.size, lineHeight: t.line, fontWeight: String(t.weight) as '400' | '600' | '700' };
}

export const tabular = { fontVariant: ['tabular-nums' as const] };
