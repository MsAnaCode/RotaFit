import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { RoutePath } from '@/components/RoutePath';
import { LoadingView, ErrorState } from '@/components/StateViews';
import { useRun, useDeleteRun } from '@/hooks/useRuns';
import { useTheme } from '@/theme';
import { formatDistance, formatDuration, formatPace } from '@/utils/geo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { data: run, isLoading, error } = useRun(id as string);
  const deleteMutation = useDeleteRun();

  const handleDelete = () => {
    Alert.alert(
      'Excluir Corrida',
      'Tem certeza de que deseja apagar este percurso? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteMutation.mutateAsync(id);
              router.replace('/(app)/(tabs)/history');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <LoadingView message="Carregando detalhes do percurso..." />
      </Screen>
    );
  }

  if (error || !run) {
    return (
      <Screen>
        <ErrorState
          title="Corrida não encontrada"
          message="Não conseguimos carregar este registro."
          onRetry={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Detalhes do Percurso
          </Text>

          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Título & Horário */}
        <View style={styles.titleSection}>
          <Text style={[styles.runTitle, { color: theme.colors.text }]}>
            {run.title || 'Corrida RotaFit'}
          </Text>
          <Text style={[styles.runTimestamp, { color: theme.colors.textSecondary }]}>
            {new Date(run.started_at).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Mapa da Rota SVG */}
        <View style={styles.mapContainer}>
          <RoutePath
            points={run.route_points}
            width={SCREEN_WIDTH - 40}
            height={260}
            strokeWidth={4.5}
            showPins={true}
          />
        </View>

        {/* Grade de Estatísticas */}
        <View style={styles.gridContainer}>
          <Card style={styles.gridCard} glow>
            <Ionicons name="navigate-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.gridValue, { color: theme.colors.primary }]}>
              {formatDistance(run.distance_meters)}
            </Text>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>
              Distância Total
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <Ionicons name="time-outline" size={22} color={theme.colors.textSecondary} />
            <Text style={[styles.gridValue, { color: theme.colors.text }]}>
              {formatDuration(run.duration_seconds)}
            </Text>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>
              Tempo Decorrido
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <Ionicons name="speedometer-outline" size={22} color={theme.colors.accent} />
            <Text style={[styles.gridValue, { color: theme.colors.text }]}>
              {formatPace(run.avg_pace_seconds_per_km || 0)}
            </Text>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>
              Ritmo Médio
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <Ionicons name="flame-outline" size={22} color={theme.colors.danger} />
            <Text style={[styles.gridValue, { color: theme.colors.text }]}>
              {run.calories ? `${run.calories} kcal` : '--'}
            </Text>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>
              Calorias Queimadas
            </Text>
          </Card>
        </View>

        {/* Trilha Sonora do Spotify associada */}
        {run.spotify_track_name ? (
          <Card style={styles.spotifyCard}>
            <View style={styles.spotifyHeader}>
              <Ionicons name="musical-notes" size={24} color="#1DB954" />
              <View style={styles.spotifyInfo}>
                <Text
                  style={[styles.spotifyTagLabel, { color: theme.colors.textSecondary }]}
                >
                  TRILHA SONORA DESTA CORRIDA
                </Text>
                <Text style={[styles.spotifySong, { color: theme.colors.text }]}>
                  {run.spotify_track_name}
                </Text>
                {run.spotify_artist_name ? (
                  <Text
                    style={[styles.spotifyArtist, { color: theme.colors.textSecondary }]}
                  >
                    {run.spotify_artist_name}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : null}

        {/* Rodapé com info técnica do percurso */}
        <Text style={[styles.technicalInfo, { color: theme.colors.textMuted }]}>
          {run.route_points?.length || 0} coordenadas de GPS registradas • RLS Autenticado
        </Text>

        <Button
          title="Voltar ao Histórico"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.backButtonBottom}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
  titleSection: {
    marginBottom: 16,
  },
  runTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  runTimestamp: {
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    padding: 16,
    alignItems: 'flex-start',
  },
  gridValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  spotifyCard: {
    padding: 14,
    marginBottom: 20,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotifyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  spotifyTagLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spotifySong: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  spotifyArtist: {
    fontSize: 13,
  },
  technicalInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonBottom: {
    width: '100%',
  },
});
