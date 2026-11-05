import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from 'react-native';
import { font } from '../theme/index.ts';
import tokens from '../../replica/design/tokens.json';
import { GlassBar } from './Glass.tsx';

const c = tokens.color;

/** Navigation bar on the glass layer: content scrolls underneath it. */
export function glassHeader() {
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
    ...(liquid ? {} : ios ? { headerBlurEffect: 'systemChromeMaterialDark' as const } : { headerBackground: () => <GlassBar edge="top" /> }),
  };
}

/** Modal and sheet headers sit on the sheet itself: plain Midnight. */
export const sheetHeader = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: c.bg },
  headerTintColor: c.tint,
  headerTitleStyle: { color: c.text },
  contentStyle: { backgroundColor: c.bg },
};
