import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from './Glass.tsx';
import { useS } from '../store/store.ts';
import { font, radius, useColors } from '../theme/index.ts';

/** After a delete: a short-lived banner with Annulla, instead of an alert before it. */
export function UndoToast() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { undo, restore, clear } = useS((s) => ({ undo: s.undo, restore: s.undoLast, clear: s.clearUndo }));
  useEffect(() => {
    if (!undo) return;
    AccessibilityInfo.announceForAccessibility?.(`${undo.label}. Annulla disponibile.`);
    const t = setTimeout(clear, 6000);
    return () => clearTimeout(t);
  }, [undo, clear]);
  if (!undo) return null;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: insets.bottom + 72 }]}>
      <Glass interactive style={s.toast}>
        <View style={s.row} accessibilityLiveRegion="polite">
        <Text style={[font('subheadline'), { color: c['on-card'], flex: 1 }]} numberOfLines={2}>{undo.label}</Text>
        <Pressable accessibilityRole="button" onPress={restore} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 })}>
          <Text style={[font('headline'), { color: c['card-figure'] }]}>Annulla</Text>
        </Pressable>
        </View>
      </Glass>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: { borderRadius: radius.lg, maxWidth: 520, width: '100%', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, paddingRight: 8, minHeight: 52 },
});
