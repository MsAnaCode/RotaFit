import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SpotifyPlayerCard } from '@/components/spotify/SpotifyPlayerCard';
import { RoutePath } from '@/components/RoutePath';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';
import { useRuns, useWeeklyStats } from '@/hooks/useRuns';
import { greetingForHour } from '@/utils/greeting';
import { formatDistance, formatDuration, formatPace } from '@/utils/geo';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { data: runs } = useRuns();
  const { data: stats } = useWeeklyStats();

  const greeting = greetingForHour(new Date().getHours());
  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    'Corredor';

  const recentRuns = runs?.slice(0, 2) || [];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com saudação */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {greeting},
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {userName} 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/profile')}
            style={[
              styles.avatarBtn,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <Ionicons name="person" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Card de Resumo Semanal */}
        <Card style={styles.statsCard} glow>
          <View style={styles.statsHeader}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
              Resumo Semanal
            </Text>
            <Text style={[styles.weekTag, { color: theme.colors.primary }]}>
              Esta semana
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {stats ? stats.total_distance_km.toFixed(1) : '0.0'}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                km rodados
              </Text>
            </View>

            <View
              style={[styles.metricDivider, { backgroundColor: theme.colors.cardBorder }]}
            />

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {stats ? stats.total_duration_minutes : 0}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                minutos
              </Text>
            </View>

            <View
              style={[styles.metricDivider, { backgroundColor: theme.colors.cardBorder }]}
            />

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {stats?.avg_pace_seconds_per_km
                  ? formatPace(stats.avg_pace_seconds_per_km).replace(' /km', '')
                  : `--'--"`}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                ritmo médio
              </Text>
            </View>
          </View>
        </Card>

        {/* Botão de Destaque para Iniciar Corrida */}
        <View style={styles.startSection}>
          <Button
            title="INICIAR NOVA CORRIDA"
            variant="primary"
            size="lg"
            onPress={() => router.push('/(app)/run/active')}
            icon={<Ionicons name="play" size={24} color="#FFFFFF" />}
            style={styles.startBtn}
          />
        </View>

        {/* Tocador Spotify Integrado */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Música em Reprodução
          </Text>
        </View>
        <SpotifyPlayerCard />

        {/* Últimas Corridas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Atividades Recentes
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/history')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              Ver todas
            </Text>
          </TouchableOpacity>
        </View>

        {recentRuns.length === 0 ? (
          <GlassSurface style={styles.emptyCard}>
            <Ionicons
              name="walk-outline"
              size={36}
              color={theme.colors.textMuted}
              style={{ marginBottom: 6 }}
            />
            <Text style={[styles.emptyCardText, { color: theme.colors.textSecondary }]}>
              Nenhuma corrida recente ainda.
            </Text>
            <Text style={[styles.emptyCardSub, { color: theme.colors.textMuted }]}>
              Toque em "Iniciar Nova Corrida" para gravar seu primeiro trajeto!
            </Text>
          </GlassSurface>
        ) : (
          recentRuns.map((run) => (
            <TouchableOpacity
              key={run.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/(app)/run/${run.id}`)}
            >
              <GlassSurface style={styles.runItemCard}>
                <View style={styles.runItemHeader}>
                  <Text style={[styles.runTitle, { color: theme.colors.text }]}>
                    {run.title || 'Corrida'}
                  </Text>
                  <Text style={[styles.runDate, { color: theme.colors.textSecondary }]}>
                    {new Date(run.started_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>

                <View style={styles.runPreviewRow}>
                  <View style={styles.runPreviewStats}>
                    <Text style={[styles.runDistance, { color: theme.colors.primary }]}>
                      {formatDistance(run.distance_meters)}
                    </Text>
                    <Text style={[styles.runMeta, { color: theme.colors.textSecondary }]}>
                      ⏱ {formatDuration(run.duration_seconds)} • ⚡{' '}
                      {formatPace(run.avg_pace_seconds_per_km || 0)}
                    </Text>
                    {run.spotify_track_name ? (
                      <View style={styles.trackTag}>
                        <Ionicons
                          name="musical-note"
                          size={12}
                          color="#1DB954"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.trackTagText} numberOfLines={1}>
                          {run.spotify_track_name}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <RoutePath
                    points={run.route_points}
                    width={90}
                    height={60}
                    strokeWidth={2}
                    showPins={false}
                  />
                </View>
              </GlassSurface>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 36,
  },
  startSection: {
    marginVertical: 12,
  },
  startBtn: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  emptyCardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  runItemCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  runItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  runTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  runDate: {
    fontSize: 12,
  },
  runPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  runPreviewStats: {
    flex: 1,
  },
  runDistance: {
    fontSize: 18,
    fontWeight: '800',
  },
  runMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  trackTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    maxWidth: 180,
  },
  trackTagText: {
    fontSize: 11,
    color: '#1DB954',
    fontWeight: '600',
  },
});
