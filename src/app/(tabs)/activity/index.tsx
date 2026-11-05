import { Screen } from '../../../components/Screen.tsx';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '../../../components/Icon.tsx';
import { Empty, Row, Section, Separator } from '../../../components/ui.tsx';
import { useS } from '../../../store/store.ts';
import type { ActivityKind } from '../../../store/types.ts';
import { useColors } from '../../../theme/index.ts';

const icons: Record<ActivityKind, { sf: any; ion: any }> = {
  expense_added: { sf: 'plus.circle.fill', ion: 'add-circle' },
  expense_edited: { sf: 'pencil.circle.fill', ion: 'create' },
  expense_deleted: { sf: 'trash.circle.fill', ion: 'trash' },
  payment: { sf: 'arrow.left.arrow.right.circle.fill', ion: 'swap-horizontal' },
  group_created: { sf: 'person.3.fill', ion: 'people' },
  group_deleted: { sf: 'xmark.circle.fill', ion: 'close-circle' },
  friend_added: { sf: 'person.crop.circle.badge.plus', ion: 'person-add' },
};
const rel = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });
function when(at: number) {
  const diff = (at - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return 'adesso';
  if (abs < 3600) return rel.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rel.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 7) return rel.format(Math.round(diff / 86400), 'day');
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(at);
}

export default function Activity() {
  const c = useColors();
  const { activity, groups, expenses } = useS((s) => ({ activity: s.activity, groups: s.groups, expenses: s.expenses }));
  return (
    <>
      <Stack.Screen options={{ title: 'Attività' }} />
      <Screen contentContainerStyle={{ paddingBottom: 120 }}>
        {activity.length === 0 ? (
          <Empty sf="clock" ion="time-outline" title="Ancora tutto tranquillo" body="Qui vedrai ogni spesa, modifica e pagamento, dal più recente." />
        ) : (
          <Section>
            {activity.map((a, i) => {
              const ic = icons[a.kind];
              const target = a.subjectId && expenses[a.subjectId] ? `/expense/${a.subjectId}` : a.groupId && groups[a.groupId] ? `/groups/${a.groupId}` : null;
              const g = a.groupId ? groups[a.groupId]?.name : undefined;
              return (
                <View key={a.id}>
                  {i > 0 && <Separator />}
                  <Row
                    leading={<Icon sf={ic.sf} ion={ic.ion} size={28} color={a.kind === 'expense_deleted' || a.kind === 'group_deleted' ? c['text-muted'] : c.text} />}
                    title={a.text}
                    subtitle={[g, when(a.at)].filter(Boolean).join(' · ')}
                    onPress={target ? () => router.push(target as any) : undefined}
                    chevron={!!target}
                  />
                </View>
              );
            })}
          </Section>
        )}
      </Screen>
    </>
  );
}
