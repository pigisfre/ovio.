import { Stack } from 'expo-router';
import { glassHeader } from '../../../components/headerOptions.tsx';

export default function TabStack() {
  return <Stack screenOptions={{ ...glassHeader(), headerLargeTitle: true, headerLargeTitleShadowVisible: false }} />;
}
