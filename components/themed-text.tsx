import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Force dark text color, override dark mode - use provided color or default to dark
  const color = lightColor || darkColor || '#1a1f2e';

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '700',
    color: '#0a7ea4',
  },
});
