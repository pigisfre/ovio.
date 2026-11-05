import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import {
  Platform, Pressable, StyleSheet, Text, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { formatMoney, type Cents } from '../lib/money.ts';
import { control, font, radius, tabular, useColors } from '../theme/index.ts';
import { Icon } from './Icon.tsx';
import type { SFSymbol } from 'sf-symbols-typescript';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

export function T({ v = 'body', muted, color, style, children, ...rest }: {
  v?: Parameters<typeof font>[0]; muted?: boolean; color?: string; style?: StyleProp<TextStyle>; children: ReactNode; numberOfLines?: number;
}) {
  const c = useColors();
  return <Text style={[font(v), { color: color ?? (muted ? c['text-muted'] : c.text) }, style]} {...rest}>{children}</Text>;
}

type BtnKind = 'primary' | 'secondary' | 'plain' | 'destructive' | 'highlight' | 'onCard';
export function Button({ title, kind = 'primary', onPress, disabled, style, accessibilityHint }: {
  title: string; kind?: BtnKind; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>; accessibilityHint?: string;
}) {
  const c = useColors();
  const bg = { primary: c.accent, secondary: c['surface-raised'], highlight: c.highlight, onCard: 'rgba(248,249,246,0.14)', plain: 'transparent', destructive: 'transparent' }[kind];
  const fg = { primary: c['on-accent'], secondary: c.text, highlight: c['on-highlight'], onCard: c['on-card'], plain: c.tint, destructive: c.danger }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [
        s.btn, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style,
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[font('headline'), { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

/** Icon-only header button, 44x44 hit area, always labelled for VoiceOver. */
export function HeaderButton({ sf, ion, label, onPress }: { sf: SFSymbol; ion: ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={onPress} style={({ pressed }) => [s.headerBtn, { opacity: pressed ? 0.5 : 1 }]}>
      <Icon sf={sf} ion={ion} color={c.tint} size={22} />
    </Pressable>
  );
}

export function HeaderText({ title, onPress, bold, disabled }: { title: string; onPress: () => void; bold?: boolean; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} hitSlop={8} onPress={onPress} style={({ pressed }) => [s.headerTxt, { opacity: disabled ? 0.35 : pressed ? 0.5 : 1 }]}>
      <Text style={[font(bold ? 'headline' : 'body'), { color: c.tint }]}>{title}</Text>
    </Pressable>
  );
}

export function Section({ title, footer, children, style }: { title?: string; footer?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[s.section, style]}>
      {title ? <T v="footnote" muted style={s.sectionTitle}>{title.toUpperCase()}</T> : null}
      <View style={[s.sectionBody, { backgroundColor: c.surface }]}>{children}</View>
      {footer ? <T v="footnote" muted style={s.sectionFooter}>{footer}</T> : null}
    </View>
  );
}

export function Separator({ inset = 68 }: { inset?: number }) {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.separator, marginLeft: inset }} />;
}

export function Row({ leading, title, subtitle, trailing, onPress, chevron, accessibilityLabel }: {
  leading?: ReactNode; title: string; subtitle?: string; trailing?: ReactNode; onPress?: PressableProps['onPress']; chevron?: boolean; accessibilityLabel?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [s.row, { backgroundColor: pressed ? c['surface-raised'] : c.surface }]}
    >
      {leading ? <View style={s.rowLead}>{leading}</View> : null}
      <View style={s.rowMain}>
        <T v="headline" numberOfLines={1}>{title}</T>
        {subtitle ? <T v="footnote" muted numberOfLines={2}>{subtitle}</T> : null}
      </View>
      {trailing ? <View style={s.rowTrail}>{trailing}</View> : null}
      {chevron ? <Icon sf="chevron.right" ion="chevron-forward" size={14} color={c['text-muted']} /> : null}
    </Pressable>
  );
}

export function Avatar({ name, me, size = 40 }: { name: string; me?: boolean; size?: number }) {
  const c = useColors();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
  return (
    <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: me ? c.highlight : c.periwinkle, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: me ? c['on-highlight'] : c['on-periwinkle'], fontWeight: '700', fontSize: size * 0.38 }} allowFontScaling={false}>{initials}</Text>
    </View>
  );
}

export function GroupAvatar({ sf, ion, size = 40 }: { sf: SFSymbol; ion: ComponentProps<typeof Ionicons>['name']; size?: number }) {
  const c = useColors();
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
      <Icon sf={sf} ion={ion} size={size * 0.48} color={c['card-figure']} />
    </View>
  );
}

/** Amount with its words, so meaning never rides on colour alone. */
export function Amount({ cents, currency, align = 'right', one }: { cents: Cents; currency: string; align?: 'left' | 'right'; one?: boolean }) {
  const c = useColors();
  if (cents === 0) return <T v="footnote" muted style={{ textAlign: align }}>pari</T>;
  const color = cents > 0 ? c.positive : c.negative;
  return (
    <View style={{ alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <T v="caption" color={color}>{cents > 0 ? (one ? 'ti deve' : 'ti devono') : 'devi'}</T>
      <T v="headline" color={color} style={tabular}>{formatMoney(Math.abs(cents), currency)}</T>
    </View>
  );
}

export function Field({ label, error, style, ...props }: TextInputProps & { label?: string; error?: string | null }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {label ? <T v="footnote" muted>{label}</T> : null}
      <TextInput
        placeholderTextColor={c['text-muted']}
        accessibilityLabel={label}
        {...props}
        style={[s.field, font('body'), { color: c.text, backgroundColor: c.surface, borderColor: error ? c.danger : c.separator }, style]}
      />
      {error ? <T v="footnote" color={c.danger}>{error}</T> : null}
    </View>
  );
}

export function Segmented<V extends string>({ value, options, onChange, label }: {
  value: V; options: { value: V; label: string; a11y?: string }[]; onChange: (v: V) => void; label: string;
}) {
  const c = useColors();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={[s.seg, { backgroundColor: c['surface-raised'] }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityLabel={o.a11y ?? o.label}
            accessibilityState={{ selected: on }}
            onPress={() => { tap(); onChange(o.value); }}
            style={[s.segItem, on && { backgroundColor: c.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }]}
          >
            <Text style={[font('subheadline'), { color: c.text, fontWeight: on ? '600' : '400' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Empty({ sf, ion, title, body, action }: {
  sf: SFSymbol; ion: ComponentProps<typeof Ionicons>['name']; title: string; body: string; action?: { title: string; onPress: () => void };
}) {
  const c = useColors();
  return (
    <View style={s.empty}>
      <Icon sf={sf} ion={ion} size={44} color={c['text-muted']} />
      <T v="title3" style={{ textAlign: 'center' }}>{title}</T>
      <T v="subheadline" muted style={{ textAlign: 'center', maxWidth: 300 }}>{body}</T>
      {action ? <Button title={action.title} onPress={action.onPress} style={{ marginTop: 8, alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

export function Check({ on, color }: { on: boolean; color: string }) {
  return <Icon sf={on ? 'checkmark.circle.fill' : 'circle'} ion={on ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={color} />;
}

const s = StyleSheet.create({
  btn: { height: control.buttonHeight, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTxt: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionTitle: { marginLeft: 16, marginBottom: 6 },
  sectionFooter: { marginHorizontal: 16, marginTop: 6 },
  sectionBody: { borderRadius: radius.md, overflow: 'hidden' },
  row: { minHeight: control.rowHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  rowLead: { width: 40, alignItems: 'center' },
  rowMain: { flex: 1, gap: 2 },
  rowTrail: { marginLeft: 8 },
  field: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  seg: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  segItem: { flex: 1, minHeight: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  empty: { alignItems: 'center', gap: 10, paddingHorizontal: 32, paddingVertical: 56 },
});
