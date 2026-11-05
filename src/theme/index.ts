import { useColorScheme } from 'react-native';
import tokens from '../../replica/design/tokens.json';

type ColorKey = keyof typeof tokens.color.light;
export type Colors = Record<ColorKey, string>;

export const palette = tokens.palette;
export const type = tokens.type;
export const radius = tokens.radius;
export const space = tokens.space;
export const control = tokens.control;

export function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? tokens.color.dark : tokens.color.light;
}

export function useIsDark() {
  return useColorScheme() === 'dark';
}

type TypeKey = keyof typeof tokens.type;
export function font(key: TypeKey) {
  const t = tokens.type[key];
  return { fontSize: t.size, lineHeight: t.line, fontWeight: String(t.weight) as '400' | '600' | '700' };
}

export const tabular = { fontVariant: ['tabular-nums' as const] };
