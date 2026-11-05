import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ThemePicker } from '@/components/ThemePicker';
import { useAuth } from '@/context/AuthContext';
import { useSpotify } from '@/context/SpotifyContext';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const { user, signOut, isDemoMode } = useAuth();
  const { isConnected, connectSpotify, disconnectSpotify } = useSpotify();
  const { theme, isDark } = useTheme();

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Corredor RotaFit';

  const userEmail = user?.email || 'corredor@rotafit.app';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
          Perfil & Preferências
        </Text>

        {/* Card do Usuário */}
        <Card style={styles.userCard} glow>
          <View style={styles.userRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {userName}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {userEmail}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDemoMode
                      ? 'rgba(217, 119, 6, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDemoMode ? theme.colors.accent : '#10B981' },
                  ]}
                >
                  {isDemoMode ? 'Modo Demonstração' : 'Google OAuth PKCE'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Seção Tema */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Aparência (Liquid Glass)
          </Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
            Escolha entre o tema Claro (Milano Red/Lemon Chiffon) ou Escuro (Flamengo
            Rubro-Negro).
          </Text>
          <ThemePicker />
        </View>

        {/* Seção Spotify */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Integração Spotify
          </Text>
          <Card style={styles.spotifyCard}>
            <View style={styles.spotifyHeader}>
              <View style={styles.spotifyIconRow}>
                <FontAwesome name="spotify" size={24} color="#1DB954" />
                <Text style={[styles.spotifyStatus, { color: theme.colors.text }]}>
                  {isConnected ? 'Conta conectada' : 'Não conectado'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? '#10B981' : theme.colors.textMuted },
                ]}
              />
            </View>

            <Text style={[styles.spotifyCardText, { color: theme.colors.textSecondary }]}>
              {isConnected
                ? 'Sua trilha sonora está sincronizada com o painel de reprodução durante as corridas.'
                : 'Conecte sua conta do Spotify para controlar músicas diretamente na tela de rastreamento.'}
            </Text>

            {isConnected ? (
              <Button
                title="Desconectar Spotify"
                variant="secondary"
                size="sm"
                onPress={disconnectSpotify}
                style={styles.actionBtn}
              />
            ) : (
              <Button
                title="Conectar com Spotify"
                variant="primary"
                size="sm"
                onPress={connectSpotify}
                style={styles.actionBtn}
              />
            )}
          </Card>
        </View>

        {/* Seção Banco e Segurança */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Segurança & Backend
          </Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
                Row Level Security (RLS)
              </Text>
              <Text style={[styles.infoValue, { color: '#10B981' }]}>Ativo</Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: theme.colors.cardBorder }]}
            />
            <View style={styles.infoRow}>
              <Ionicons name="server-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
                PostgreSQL Engine
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
                Supabase
              </Text>
            </View>
          </Card>
        </View>

        {/* Botão Sair */}
        <View style={styles.logoutSection}>
          <Button
            title="Sair da Conta"
            variant="danger"
            onPress={signOut}
            icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  spotifyCard: {
    padding: 16,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spotifyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotifyStatus: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spotifyCardText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionBtn: {
    alignSelf: 'flex-start',
  },
  infoCard: {
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  logoutSection: {
    marginTop: 10,
  },
});
