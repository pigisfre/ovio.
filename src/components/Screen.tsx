import { useHeaderHeight } from 'expo-router/react-navigation';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';

/**
 * A scrolling screen whose content passes under the glass header (and tab bar), as Apple's
 * scroll edge effect expects. iOS insets itself; web and Android need the header height.
 */
export function Screen({ contentContainerStyle, ...props }: ScrollViewProps) {
  const header = useHeaderHeight();
  const ios = Platform.OS === 'ios';
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      {...props}
      contentContainerStyle={[{ paddingTop: ios ? 0 : header, paddingBottom: 140 }, contentContainerStyle]}
    />
  );
}
