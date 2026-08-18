import { MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontWeight: '700' as const },
  displayMedium: { fontFamily: 'System', fontWeight: '700' as const },
  displaySmall: { fontFamily: 'System', fontWeight: '600' as const },
  headlineLarge: { fontFamily: 'System', fontWeight: '700' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const },
};

export const colors = {
  primary: '#7C5CFC',
  primaryLight: '#9B82FC',
  primaryDark: '#5A3AD4',
  secondary: '#FF6B8A',
  accent: '#4ECDC4',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',

  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  card: '#1E1E36',

  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',

  border: '#2A2A45',
  overlay: 'rgba(0, 0, 0, 0.6)',

  categoryMusic: '#FF6B8A',
  categorySports: '#4ECDC4',
  categoryGames: '#7C5CFC',
  categoryArt: '#F39C12',
  categoryCooking: '#E74C3C',
  categoryFitness: '#2ECC71',
  categoryTech: '#3498DB',
  categoryCrafts: '#E67E22',
  categoryOutdoor: '#1ABC9C',
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.text,
    outline: colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
