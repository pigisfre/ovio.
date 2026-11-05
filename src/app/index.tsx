import { Redirect } from 'expo-router';
import { useStore } from '../store/store.ts';

export default function Index() {
  const meId = useStore((s) => s.meId);
  return <Redirect href={meId ? '/groups' : '/welcome'} />;
}
