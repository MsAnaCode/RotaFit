export interface ThemeTokens {
  mode: 'light' | 'dark';
  colors: {
    bgStart: string;
    bgEnd: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryGlow: string;
    accent: string;
    accentGlow: string;
    danger: string;
    dangerGlow: string;
    cardBg: string;
    cardBorder: string;
    highlight: string;
    tabBarBg: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    mapBg: string;
    mapRoute: string;
    mapDot: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  blur: {
    card: number;
    tabBar: number;
    modal: number;
  };
}

export const lightTheme: ThemeTokens = {
  mode: 'light',
  colors: {
    bgStart: '#FFF9E6',
    bgEnd: '#FFF3BF',
    text: '#201815',
    textSecondary: '#6F5C54',
    textMuted: '#9E887E',
    primary: '#B81104',
    primaryGlow: 'rgba(184, 17, 4, 0.35)',
    accent: '#D97706',
    accentGlow: 'rgba(217, 119, 6, 0.30)',
    danger: '#DC2626',
    dangerGlow: 'rgba(220, 38, 38, 0.35)',
    cardBg: 'rgba(255, 255, 255, 0.65)',
    cardBorder: 'rgba(184, 17, 4, 0.20)',
    highlight: 'rgba(255, 255, 255, 0.70)',
    tabBarBg: 'rgba(255, 250, 205, 0.75)',
    tabBarBorder: 'rgba(184, 17, 4, 0.15)',
    tabBarActive: '#B81104',
    tabBarInactive: '#9E887E',
    mapBg: 'rgba(255, 255, 255, 0.40)',
    mapRoute: '#B81104',
    mapDot: '#201815',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    pill: 9999,
  },
  blur: {
    card: 20,
    tabBar: 30,
    modal: 40,
  },
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  colors: {
    bgStart: '#0B0B0D',
    bgEnd: '#1A0406',
    text: '#FFFFFF',
    textSecondary: '#D0A3A7',
    textMuted: '#7D5F63',
    primary: '#E6141E',
    primaryGlow: 'rgba(230, 20, 30, 0.55)',
    accent: '#B81104',
    accentGlow: 'rgba(184, 17, 4, 0.40)',
    danger: '#FF3B47',
    dangerGlow: 'rgba(255, 59, 71, 0.50)',
    cardBg: 'rgba(26, 4, 6, 0.50)',
    cardBorder: 'rgba(230, 20, 30, 0.30)',
    highlight: 'rgba(255, 255, 255, 0.25)',
    tabBarBg: 'rgba(11, 11, 13, 0.75)',
    tabBarBorder: 'rgba(230, 20, 30, 0.25)',
    tabBarActive: '#E6141E',
    tabBarInactive: '#7D5F63',
    mapBg: 'rgba(11, 11, 13, 0.60)',
    mapRoute: '#E6141E',
    mapDot: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    pill: 9999,
  },
  blur: {
    card: 25,
    tabBar: 35,
    modal: 45,
  },
};
