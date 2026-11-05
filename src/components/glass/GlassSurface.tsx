import React from 'react';
import {
  StyleSheet,
  View,
  ViewProps,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

export interface GlassSurfaceProps extends ViewProps {
  intensity?: number;
  glow?: boolean;
  borderTint?: string;
  borderRadius?: number;
  highlightOpacity?: number;
  children?: React.ReactNode;
}

export function GlassSurface({
  intensity,
  glow = false,
  borderTint,
  borderRadius,
  highlightOpacity,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const { theme, isDark } = useTheme();

  const finalRadius = borderRadius ?? theme.radius.md;
  const finalIntensity = intensity ?? theme.blur.card;
  const borderColor = borderTint ?? theme.colors.cardBorder;
  const glowShadow = glow
    ? {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.45 : 0.25,
        shadowRadius: 16,
        elevation: 8,
      }
    : {};

  const highlightAlpha = highlightOpacity ?? (isDark ? 0.18 : 0.45);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderRadius: finalRadius,
          borderColor,
          backgroundColor: Platform.OS === 'web' ? theme.colors.cardBg : 'transparent',
        },
        glowShadow,
        style,
      ]}
      {...rest}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={finalIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: finalRadius }]}
        />
      ) : null}

      <LinearGradient
        colors={[`rgba(255, 255, 255, ${highlightAlpha})`, 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={[styles.highlight, { borderRadius: finalRadius }]}
        pointerEvents="none"
      />

      <View style={[styles.content, { borderRadius: finalRadius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    height: '45%',
  },
  content: {
    width: '100%',
  },
});
