import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  pressable: {
    borderRadius: borderRadius.lg,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  container: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: `${colors.primary}1A`,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  iconDimmed: {
    opacity: 0.55,
  },
  name: {
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
  },
});
