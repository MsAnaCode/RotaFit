import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function Screen({
  children,
  style,
  contentContainerStyle,
  edges = ['top'],
}: ScreenProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={[theme.colors.bgStart, theme.colors.bgEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={edges} style={[styles.safeArea, contentContainerStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
  },
});
