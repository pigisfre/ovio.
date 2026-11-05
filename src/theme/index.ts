import { useColorScheme } from 'react-native';
import tokens from '../../replica/design/tokens.json';

// Two appearances that follow the system: dark = Midnight backgrounds + Cloud text,
// light = Cloud backgrounds + Midnight text (see replica/design/tokens.json → roles).
type ColorKey = keyof typeof tokens.color.light;
export type Colors = Record<ColorKey, string>;
export type GlassTokens = typeof tokens.glass.dark;

export const palette = tokens.palette;
export const type = tokens.type;
export const radius = tokens.radius;
export const space = tokens.space;
export const control = tokens.control;

export function useIsDark() {
  return useColorScheme() === 'dark';
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
