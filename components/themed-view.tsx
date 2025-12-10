import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Force light background, override dark mode
  const backgroundColor = lightColor || darkColor || '#ffffff';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
