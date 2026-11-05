import { Stack } from 'expo-router';
import { glassHeader } from '../../../components/headerOptions.tsx';
import { useColors, useIsDark } from '../../../theme/index.ts';

export default function TabStack() {
  const c = useColors();
  const dark = useIsDark();
  return <Stack screenOptions={{ ...glassHeader(c, dark), headerLargeTitle: true, headerLargeTitleShadowVisible: false }} />;
}
