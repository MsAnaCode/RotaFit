import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useSpotify } from '@/context/SpotifyContext';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useTheme } from '@/theme';
import { GlassSurface } from '../glass/GlassSurface';
import { Button } from '../Button';

export function SpotifyPlayerCard() {
  const { isConnected, connectSpotify } = useSpotify();
  const { track, isPlaying, togglePlay, next, previous } = useSpotifyPlayer();
  const { theme, isDark } = useTheme();

  if (!isConnected) {
    return (
      <GlassSurface style={styles.card} borderRadius={theme.radius.lg}>
        <View style={styles.connectRow}>
          <View style={[styles.spotifyLogoCircle, { backgroundColor: '#1DB954' }]}>
            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.connectInfo}>
            <Text style={[styles.connectTitle, { color: theme.colors.text }]}>
              Trilha Sonora da Corrida
            </Text>
            <Text style={[styles.connectSubtitle, { color: theme.colors.textSecondary }]}>
              Conecte o Spotify para ouvir e sincronizar suas músicas
            </Text>
          </View>
        </View>
        <Button
          title="Conectar Spotify"
          onPress={connectSpotify}
          variant="primary"
          size="sm"
          style={styles.connectButton}
          icon={<FontAwesome name="spotify" size={18} color="#FFFFFF" />}
        />
      </GlassSurface>
    );
  }

  return (
    <GlassSurface style={styles.card} borderRadius={theme.radius.lg} glow>
      <View style={styles.playerRow}>
        {track?.albumCoverUrl ? (
          <Image source={{ uri: track.albumCoverUrl }} style={styles.albumCover} />
        ) : (
          <View
            style={[
              styles.albumCoverPlaceholder,
              { backgroundColor: isDark ? '#222' : '#E5E5E5' },
            ]}
          >
            <Ionicons name="musical-notes" size={24} color={theme.colors.textMuted} />
          </View>
        )}

        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {track?.name ?? 'Nenhuma faixa reproduzindo'}
          </Text>
          <Text
            style={[styles.artistName, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {track?.artist ?? 'Abra o Spotify para sincronizar'}
          </Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={previous}
          style={styles.controlButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          style={[
            styles.playPauseButton,
            {
              backgroundColor: '#1DB954',
              shadowColor: '#1DB954',
            },
          ]}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={next}
          style={styles.controlButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-forward" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginVertical: 8,
  },
  connectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotifyLogoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  connectInfo: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  connectSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  connectButton: {
    marginTop: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  albumCoverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '700',
  },
  artistName: {
    fontSize: 13,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 28,
  },
  controlButton: {
    padding: 6,
  },
  playPauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
