import tokens from '../../replica/design/tokens.json';

// ovio has one appearance: Midnight backgrounds, Cloud text (see replica/design/tokens.json → roles).
type ColorKey = keyof typeof tokens.color;
export type Colors = Record<ColorKey, string>;

export const palette = tokens.palette;
export const type = tokens.type;
export const radius = tokens.radius;
export const space = tokens.space;
export const control = tokens.control;
export const glass = tokens.glass;

const colors: Colors = tokens.color;

export function useColors(): Colors {
  return colors;
}

export function useIsDark() {
  return true;
}

type TypeKey = keyof typeof tokens.type;
export function font(key: TypeKey) {
  const t = tokens.type[key];
  return { fontSize: t.size, lineHeight: t.line, fontWeight: String(t.weight) as '400' | '600' | '700' };
}

export const tabular = { fontVariant: ['tabular-nums' as const] };
