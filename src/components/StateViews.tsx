import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Button } from './Button';
import { Card } from './Card';

export function LoadingView({ message = 'Carregando...' }: { message?: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({
  title = 'Algo deu errado',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="alert-circle" size={42} color={theme.colors.danger} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
        ) : null}
        {onRetry ? (
          <Button
            title="Tentar novamente"
            onPress={onRetry}
            variant="primary"
            style={styles.button}
          />
        ) : null}
      </Card>
    </View>
  );
}

export function EmptyState({
  icon = 'walk-outline',
  title,
  message,
  actionTitle,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={42} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
        ) : null}
        {actionTitle && onAction ? (
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="primary"
            style={styles.button}
          />
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    minWidth: 160,
  },
});
