import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from 'react-native';
import { font } from '../theme/index.ts';
import type { Colors } from '../theme/index.ts';
import { GlassBar } from './Glass.tsx';

/** Navigation bar on the glass layer: content scrolls underneath it. */
export function glassHeader(c: Colors, dark: boolean) {
  const ios = Platform.OS === 'ios';
  const liquid = ios && isLiquidGlassAvailable();
  return {
    headerTransparent: true,
    headerShadowVisible: false,
    headerTintColor: c.tint,
    headerTitleStyle: { color: c.text, fontWeight: font('headline').fontWeight },
    headerLargeTitleStyle: { color: c.text },
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: c.bg },
    // iOS 26 draws Liquid Glass and the scroll edge effect itself; older iOS gets the system blur;
    // web and Android get our glass bar.
    ...(liquid ? {} : ios ? { headerBlurEffect: dark ? ('systemChromeMaterialDark' as const) : ('systemChromeMaterialLight' as const) } : { headerBackground: () => <GlassBar edge="top" /> }),
  };
}

/** Modal and sheet headers sit on the sheet itself: plain Midnight. */
export const sheetHeader = (c: Colors) => ({
  headerShadowVisible: false,
  headerStyle: { backgroundColor: c.bg },
  headerTintColor: c.tint,
  headerTitleStyle: { color: c.text },
  contentStyle: { backgroundColor: c.bg },
});
