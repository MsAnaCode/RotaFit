import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemePreference } from '@/theme';

export function ThemePicker() {
  const { preference, setPreference, theme, isDark } = useTheme();

  const options: {
    label: string;
    value: ThemePreference;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { label: 'Sistema', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Claro', value: 'light', icon: 'sunny-outline' },
    { label: 'Escuro', value: 'dark', icon: 'moon-outline' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      {options.map((opt) => {
        const isSelected = preference === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setPreference(opt.value)}
            style={[
              styles.segment,
              isSelected && {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
  },
});
