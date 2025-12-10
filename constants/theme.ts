/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#36c690';
const tintColorDark = '#36c690';

export const Colors = {
  light: {
    text: '#1a1f2e',
    background: '#f8f9fa',
    tint: tintColorLight,
    icon: '#4a5568',
    tabIconDefault: '#8b95a7',
    tabIconSelected: tintColorLight,
    primary: '#36c690',
    secondary: '#3fb1ff',
    accent: '#ff914d',
    cardBg: '#ffffff',
    border: '#e2e8f0',
  },
  dark: {
    text: '#f7fafc',
    background: '#1a202c',
    tint: tintColorDark,
    icon: '#cbd5e0',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorDark,
    primary: '#36c690',
    secondary: '#3fb1ff',
    accent: '#ff914d',
    cardBg: '#2d3748',
    border: '#4a5568',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
