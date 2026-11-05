import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Button } from '@/components/Button';
import { RoutePath } from '@/components/RoutePath';
import { SpotifyPlayerCard } from '@/components/spotify/SpotifyPlayerCard';
import { useRunTracker } from '@/hooks/useRunTracker';
import { useSaveRun } from '@/hooks/useRuns';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useTheme } from '@/theme';
import { formatDistance, formatDuration, formatPace } from '@/utils/geo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActiveRunScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const tracker = useRunTracker();
  const saveRunMutation = useSaveRun();
  const { track: currentSpotifyTrack } = useSpotifyPlayer();

  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [runTitle, setRunTitle] = useState('Corrida RotaFit');

  // Inicia rastreamento automático ao abrir a tela
  useEffect(() => {
    tracker.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePause = () => {
    tracker.pause();
  };

  const handleResume = () => {
    tracker.resume();
  };

  const handleFinishPrompt = () => {
    tracker.finish();
    const now = new Date();
    const hours = now.getHours();
    let period = 'Corrida Noturna';
    if (hours >= 5 && hours < 12) period = 'Corrida Matinal';
    else if (hours >= 12 && hours < 18) period = 'Corrida da Tarde';
    setRunTitle(period);
    setIsFinishModalVisible(true);
  };

  const handleCancelRun = () => {
    Alert.alert('Descartar corrida?', 'Esta atividade não será salva no seu histórico.', [
      { text: 'Continuar correndo', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          tracker.reset();
          router.back();
        },
      },
    ]);
  };

  const handleConfirmSave = async () => {
    try {
      const saved = await saveRunMutation.mutateAsync({
        title: runTitle.trim() || 'Corrida RotaFit',
        started_at: new Date(tracker.startedAt || Date.now()).toISOString(),
        ended_at: new Date(tracker.endedAt || Date.now()).toISOString(),
        duration_seconds: tracker.seconds,
        distance_meters: tracker.distanceMeters,
        avg_pace_seconds_per_km: tracker.currentPace,
        calories: tracker.calories,
        route_points: tracker.points,
        spotify_track_uri: currentSpotifyTrack?.uri || null,
        spotify_track_name: currentSpotifyTrack?.name || null,
        spotify_artist_name: currentSpotifyTrack?.artist || null,
      });

      setIsFinishModalVisible(false);
      tracker.reset();
      router.replace(`/(app)/run/${saved.id}`);
    } catch (err) {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar a corrida no momento.');
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header superior com botão fechar / descartar */}
        <View style={styles.topBar}>
          <Button
            title=""
            variant="ghost"
            onPress={handleCancelRun}
            icon={<Ionicons name="close" size={26} color={theme.colors.text} />}
            style={styles.closeBtn}
          />

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    tracker.status === 'running'
                      ? '#10B981'
                      : tracker.status === 'paused'
                        ? theme.colors.accent
                        : theme.colors.primary,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              {tracker.status === 'running'
                ? 'EM ANDAMENTO'
                : tracker.status === 'paused'
                  ? 'PAUSADO'
                  : 'FINALIZADO'}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Visualização da rota em SVG */}
        <View style={styles.mapContainer}>
          <RoutePath
            points={tracker.points}
            width={SCREEN_WIDTH - 40}
            height={220}
            strokeWidth={4}
            showPins={true}
          />
        </View>

        {/* Bloco de Métricas Principais em Liquid Glass */}
        <GlassSurface style={styles.metricsCard} glow>
          {/* Distância */}
          <View style={styles.mainMetricRow}>
            <Text style={[styles.mainMetricValue, { color: theme.colors.primary }]}>
              {formatDistance(tracker.distanceMeters)}
            </Text>
            <Text style={[styles.mainMetricLabel, { color: theme.colors.textSecondary }]}>
              DISTÂNCIA TOTAL
            </Text>
          </View>

          <View
            style={[styles.metricsDivider, { backgroundColor: theme.colors.cardBorder }]}
          />

          {/* Duração, Ritmo e Calorias */}
          <View style={styles.secondaryMetricsRow}>
            <View style={styles.subMetricItem}>
              <Text style={[styles.subMetricValue, { color: theme.colors.text }]}>
                {formatDuration(tracker.seconds)}
              </Text>
              <Text
                style={[styles.subMetricLabel, { color: theme.colors.textSecondary }]}
              >
                TEMPO
              </Text>
            </View>

            <View style={styles.subMetricItem}>
              <Text style={[styles.subMetricValue, { color: theme.colors.text }]}>
                {formatPace(tracker.currentPace).replace(' /km', '')}
              </Text>
              <Text
                style={[styles.subMetricLabel, { color: theme.colors.textSecondary }]}
              >
                RITMO (MIN/KM)
              </Text>
            </View>

            <View style={styles.subMetricItem}>
              <Text style={[styles.subMetricValue, { color: theme.colors.accent }]}>
                {tracker.calories}
              </Text>
              <Text
                style={[styles.subMetricLabel, { color: theme.colors.textSecondary }]}
              >
                KCAL
              </Text>
            </View>
          </View>
        </GlassSurface>

        {/* Tocador Spotify integrado na corrida */}
        <View style={styles.spotifySection}>
          <SpotifyPlayerCard />
        </View>

        {/* Controles de Corrida (Pausar, Retomar, Concluir) */}
        <View style={styles.actionsBar}>
          {tracker.status === 'running' ? (
            <Button
              title="PAUSAR CORRIDA"
              variant="secondary"
              size="lg"
              onPress={handlePause}
              icon={<Ionicons name="pause" size={22} color={theme.colors.text} />}
              style={styles.actionButton}
            />
          ) : (
            <View style={styles.pausedButtonsRow}>
              <Button
                title="RETOMAR"
                variant="primary"
                size="lg"
                onPress={handleResume}
                icon={<Ionicons name="play" size={22} color="#FFFFFF" />}
                style={styles.halfButton}
              />
              <Button
                title="FINALIZAR"
                variant="dark"
                size="lg"
                onPress={handleFinishPrompt}
                icon={<Ionicons name="checkmark-done" size={22} color="#FFFFFF" />}
                style={styles.halfButton}
              />
            </View>
          )}
        </View>
      </View>

      {/* Modal de Conclusão e Salvamento */}
      <Modal visible={isFinishModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassSurface style={styles.modalCard} glow>
            <View style={styles.modalHeader}>
              <Ionicons name="trophy-outline" size={36} color={theme.colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Corrida Concluída! 🎉
              </Text>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Excelente treino! Dê um título para salvar no seu histórico.
            </Text>

            <TextInput
              value={runTitle}
              onChangeText={setRunTitle}
              placeholder="Ex: Treino no Parque"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.cardBorder,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Button
                title="Salvar Treino"
                variant="primary"
                onPress={handleConfirmSave}
                loading={saveRunMutation.isPending}
                style={{ width: '100%' }}
              />
            </View>
          </GlassSurface>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mapContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  metricsCard: {
    padding: 18,
    borderRadius: 20,
  },
  mainMetricRow: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  mainMetricValue: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mainMetricLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  metricsDivider: {
    height: 1,
    marginVertical: 10,
  },
  secondaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  subMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  subMetricValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  subMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  spotifySection: {
    marginVertical: 4,
  },
  actionsBar: {
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
  },
  pausedButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    width: '100%',
  },
});
