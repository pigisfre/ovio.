import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { glass } from '../theme/index.ts';

/** Reduce Transparency (iOS setting, or prefers-reduced-transparency on the web). */
export function useReduceTransparency() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const mq = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-transparency: reduce)') : undefined;
      if (!mq) return;
      setOn(mq.matches);
      const fn = (e: MediaQueryListEvent) => setOn(e.matches);
      mq.addEventListener?.('change', fn);
      return () => mq.removeEventListener?.('change', fn);
    }
    AccessibilityInfo.isReduceTransparencyEnabled?.().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

/**
 * The functional layer's material: bars, floating controls, the undo banner. Never content.
 * iOS 26: Apple's Liquid Glass. iOS < 26 and web: a backdrop blur with a translucent Midnight fill
 * and a hairline. Android: a near-opaque fill (no glass in Material). Reduce Transparency: opaque.
 */
export function Glass({ style, children, interactive }: { style?: StyleProp<ViewStyle>; children?: ReactNode; interactive?: boolean }) {
  const reduce = useReduceTransparency();
  if (reduce || Platform.OS === 'android') {
    return <View style={[style, { backgroundColor: glass['fill-opaque'], borderColor: glass.border, borderWidth: StyleSheet.hairlineWidth }]}>{children}</View>;
  }
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" isInteractive={interactive} style={style}>
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView intensity={glass.blur * 2} tint="dark" style={[style, { overflow: 'hidden', borderColor: glass.border, borderWidth: StyleSheet.hairlineWidth }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.fill }]} pointerEvents="none" />
      {children}
    </BlurView>
  );
}

/** Full-bleed glass for a header or tab bar background. */
export function GlassBar({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <Glass
      style={[StyleSheet.absoluteFill, { borderWidth: 0, [edge === 'top' ? 'borderBottomWidth' : 'borderTopWidth']: StyleSheet.hairlineWidth }]}
    />
  );
}
