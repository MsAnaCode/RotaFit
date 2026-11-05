import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Button } from '@/components/Button';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const { signInWithGoogle, signInAsDemoUser } = useAuth();
  const { theme, isDark } = useTheme();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    await signInAsDemoUser();
  };

  return (
    <Screen style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.brandContainer}>
        <View
          style={[
            styles.logoBadge,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="flame" size={44} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandTitle, { color: theme.colors.text }]}>RotaFit</Text>
        <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
          Rastreamento de corrida em tempo real com trilha sonora integrada
        </Text>
      </View>

      <GlassSurface style={styles.card} borderRadius={theme.radius.lg} glow>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Bem-vindo</Text>
        <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
          Acesse para sincronizar suas rotas, ritmo e progresso semanal na nuvem.
        </Text>

        {errorMsg ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: isDark
                  ? 'rgba(220, 38, 38, 0.2)'
                  : 'rgba(220, 38, 38, 0.1)',
                borderColor: theme.colors.danger,
              },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={18}
              color={theme.colors.danger}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        <Button
          title="Entrar com Google"
          variant="secondary"
          onPress={handleGoogleLogin}
          loading={loadingGoogle}
          icon={<GoogleIcon size={20} />}
          style={styles.googleBtn}
        />

        <View style={styles.dividerRow}>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.colors.cardBorder }]}
          />
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>OU</Text>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.colors.cardBorder }]}
          />
        </View>

        <Button
          title="Continuar como Visitante"
          variant="ghost"
          onPress={handleDemoLogin}
          icon={
            <Ionicons
              name="person-circle-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          }
        />
      </GlassSurface>

      <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
        OAuth 2.0 PKCE seguro • Sem senhas no dispositivo
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  googleBtn: {
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
  },
});
