import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { GlassSurface, GlassSurfaceProps } from './glass/GlassSurface';
import { useTheme } from '@/theme';

export interface CardProps extends GlassSurfaceProps {
  padding?: number;
}

export function Card({ padding, style, children, ...rest }: CardProps) {
  const { theme } = useTheme();
  const cardPadding = padding !== undefined ? padding : theme.spacing.md;

  return (
    <GlassSurface
      style={[{ padding: cardPadding }, style]}
      borderRadius={theme.radius.lg}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
}
