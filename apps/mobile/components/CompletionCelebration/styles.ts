import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamilies } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkmark: {
    fontSize: 44,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  textGroup: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  xp: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: fontFamilies.numeric,
  },
});
