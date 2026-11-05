import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  size = 'md',
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: [theme.colors.primary, isDark ? '#8A0B0F' : '#8A0B02'],
          text: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.25)',
          glow: theme.colors.primaryGlow,
        };
      case 'secondary':
        return {
          bg: isDark
            ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']
            : ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.02)'],
          text: theme.colors.text,
          border: theme.colors.cardBorder,
          glow: 'transparent',
        };
      case 'danger':
        return {
          bg: [theme.colors.danger, '#8B0000'],
          text: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.3)',
          glow: theme.colors.dangerGlow,
        };
      case 'ghost':
        return {
          bg: ['transparent', 'transparent'],
          text: theme.colors.textSecondary,
          border: 'transparent',
          glow: 'transparent',
        };
      case 'dark':
        return {
          bg: ['#1F1F24', '#0A0A0C'],
          text: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.15)',
          glow: 'rgba(0, 0, 0, 0.4)',
        };
    }
  };

  const config = getColors();

  const sizePadding = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15 },
    lg: { paddingVertical: 18, paddingHorizontal: 28, fontSize: 17 },
  }[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        {
          borderRadius: theme.radius.pill,
          opacity: disabled ? 0.5 : 1,
          shadowColor: config.glow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: variant === 'ghost' ? 0 : 0.4,
          shadowRadius: 10,
          elevation: variant === 'ghost' ? 0 : 4,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={config.bg as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizePadding.paddingVertical,
            paddingHorizontal: sizePadding.paddingHorizontal,
            borderRadius: theme.radius.pill,
            borderColor: config.border,
            borderWidth: variant === 'ghost' ? 0 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={config.text} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
            <Text
              style={[
                styles.text,
                {
                  color: config.text,
                  fontSize: sizePadding.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    overflow: 'visible',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
