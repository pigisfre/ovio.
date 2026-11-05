import { StyleSheet, Text, View } from 'react-native';
import { formatMoney, type Cents } from '../lib/money.ts';
import { font, radius, tabular, useColors } from '../theme/index.ts';
import { Icon } from './Icon.tsx';

/**
 * The ovio signature: a Midnight card in the content layer with one Lime figure.
 * `context` is the Periwinkle line under the figure (e.g. "in 3 gruppi").
 */
export function BalanceCard({ cents, currency, context, children }: { cents: Cents; currency: string; context?: string; children?: React.ReactNode }) {
  const c = useColors();
  const settled = cents === 0;
  const label = settled ? 'Tutto pari' : cents > 0 ? 'Ti devono' : 'Devi';
  const money = formatMoney(Math.abs(cents), currency);
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={settled ? `Tutto pari${context ? ', ' + context : ''}` : `${label} ${money}${context ? ', ' + context : ''}`}
      style={[s.card, { backgroundColor: c.card }]}
    >
      <Text style={[font('subheadline'), { color: c['on-card'], fontWeight: '600' }]}>{label}</Text>
      {settled ? (
        <View style={s.settled}>
          <Icon sf="checkmark.seal.fill" ion="checkmark-done-circle" size={44} color={c['card-figure']} />
        </View>
      ) : (
        <Text
          style={[font('figure'), tabular, { color: cents > 0 ? c['card-figure'] : c['on-card'] }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {money}
        </Text>
      )}
      {context ? <Text style={[font('footnote'), { color: c['card-muted'] }]}>{context}</Text> : null}
      {children ? <View style={s.actions}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 8, borderRadius: radius.lg, padding: 20, gap: 4 },
  settled: { height: 50, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
