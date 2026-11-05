import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Person } from '../store/types.ts';
import { font, radius, useColors } from '../theme/index.ts';
import { Avatar, T, tap } from './ui.tsx';

/** Horizontal chips, one selected. */
export function PersonPicker({ label, people, value, onChange, exclude }: {
  label: string; people: Person[]; value: string | null; onChange: (id: string) => void; exclude?: string | null;
}) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <T v="footnote" muted style={{ marginHorizontal: 16 }}>{label}</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {people.filter((p) => p.id !== exclude).map((p) => {
          const on = p.id === value;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={p.isMe ? 'Tu' : p.name}
              onPress={() => { tap(); onChange(p.id); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 14, minHeight: 44, borderRadius: radius.pill, backgroundColor: on ? c.accent : c.surface, borderWidth: 1, borderColor: on ? c.accent : c.separator }}
            >
              <Avatar name={p.name} me={p.isMe} size={34} />
              <Text style={[font('subheadline'), { color: on ? c['on-accent'] : c.text, fontWeight: on ? '600' : '400' }]}>{p.isMe ? 'Tu' : p.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
