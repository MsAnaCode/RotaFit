import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { RoutePath } from '@/components/RoutePath';
import { EmptyState, LoadingView } from '@/components/StateViews';
import { useRuns } from '@/hooks/useRuns';
import { useTheme } from '@/theme';
import { formatDistance, formatDuration, formatPace } from '@/utils/geo';
import { Run } from '@/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: runs, isLoading, refetch, isRefetching } = useRuns();
  const { theme } = useTheme();

  const renderRunItem = ({ item }: { item: Run }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/(app)/run/${item.id}`)}
      >
        <GlassSurface style={styles.card} borderRadius={theme.radius.md}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {item.title || 'Corrida'}
              </Text>
              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                {new Date(item.started_at).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </View>

          <View style={styles.contentRow}>
            <View style={styles.metricsColumn}>
              <Text style={[styles.distance, { color: theme.colors.primary }]}>
                {formatDistance(item.distance_meters)}
              </Text>

              <View style={styles.statGrid}>
                <View style={styles.statBadge}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.statBadgeText, { color: theme.colors.text }]}>
                    {formatDuration(item.duration_seconds)}
                  </Text>
                </View>

                <View style={styles.statBadge}>
                  <Ionicons
                    name="speedometer-outline"
                    size={13}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.statBadgeText, { color: theme.colors.text }]}>
                    {formatPace(item.avg_pace_seconds_per_km || 0)}
                  </Text>
                </View>

                {item.calories ? (
                  <View style={styles.statBadge}>
                    <Ionicons
                      name="flame-outline"
                      size={13}
                      color={theme.colors.accent}
                    />
                    <Text style={[styles.statBadgeText, { color: theme.colors.accent }]}>
                      {item.calories} kcal
                    </Text>
                  </View>
                ) : null}
              </View>

              {item.spotify_track_name ? (
                <View style={styles.spotifyTag}>
                  <Ionicons name="musical-notes" size={12} color="#1DB954" />
                  <Text style={styles.spotifyTagText} numberOfLines={1}>
                    {item.spotify_track_name}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.mapThumb}>
              <RoutePath
                points={item.route_points}
                width={100}
                height={80}
                strokeWidth={2.5}
                showPins={false}
              />
            </View>
          </View>
        </GlassSurface>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
          Histórico de Corridas
        </Text>
        <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
          {runs ? `${runs.length} atividades gravadas` : ''}
        </Text>
      </View>

      {isLoading ? (
        <LoadingView message="Carregando histórico..." />
      ) : !runs || runs.length === 0 ? (
        <EmptyState
          icon="trail-sign-outline"
          title="Nenhuma corrida gravada"
          message="Seu histórico aparecerá aqui assim que você concluir seu primeiro percurso."
          actionTitle="Iniciar corrida agora"
          onAction={() => router.push('/(app)/run/active')}
        />
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item.id}
          renderItem={renderRunItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricsColumn: {
    flex: 1,
    paddingRight: 10,
  },
  distance: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  spotifyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  spotifyTagText: {
    fontSize: 11,
    color: '#1DB954',
    fontWeight: '600',
    marginLeft: 4,
  },
  mapThumb: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
