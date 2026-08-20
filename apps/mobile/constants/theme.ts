import { Appearance } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'Fraunces_600SemiBold' },
  displayMedium: { fontFamily: 'Fraunces_600SemiBold' },
  displaySmall: { fontFamily: 'Fraunces_600SemiBold' },
  headlineLarge: { fontFamily: 'Fraunces_600SemiBold' },
  headlineMedium: { fontFamily: 'Fraunces_600SemiBold' },
  headlineSmall: { fontFamily: 'Fraunces_600SemiBold' },
  titleLarge: { fontFamily: 'PublicSans_600SemiBold' },
  titleMedium: { fontFamily: 'PublicSans_600SemiBold' },
  titleSmall: { fontFamily: 'PublicSans_600SemiBold' },
  bodyLarge: { fontFamily: 'PublicSans_400Regular' },
  bodyMedium: { fontFamily: 'PublicSans_400Regular' },
  bodySmall: { fontFamily: 'PublicSans_400Regular' },
  labelLarge: { fontFamily: 'PublicSans_600SemiBold' },
  labelMedium: { fontFamily: 'PublicSans_600SemiBold' },
  labelSmall: { fontFamily: 'PublicSans_600SemiBold' },
};

const darkColors = {
  background: '#121214',
  surface: '#1A1A1E',
  surfaceLight: '#222227',
  card: '#1D1D22',
  border: '#2C2C33',

  text: '#F1EFEA',
  textSecondary: '#B5B2AC',
  textMuted: '#79766F',

  primary: '#D8A34A',
  primaryLight: '#E8C685',
  primaryDark: '#A9782E',
  onPrimary: '#1A1305',

  error: '#C1666B',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

const lightColors = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceLight: '#EDEAE2',
  card: '#FFFFFF',
  border: '#E6E1D6',

  text: '#221F1A',
  textSecondary: '#5C574C',
  textMuted: '#8D8778',

  primary: '#A9782E',
  primaryLight: '#D8A34A',
  primaryDark: '#7D5A22',
  onPrimary: '#FFFFFF',

  error: '#A6434B',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const isDarkMode = Appearance.getColorScheme() !== 'light';

export const colors = isDarkMode ? darkColors : lightColors;

export const fontFamilies = {
  numeric: 'JetBrainsMono_500Medium',
};

const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

export const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: colors.primary,
    secondary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onPrimary,
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
