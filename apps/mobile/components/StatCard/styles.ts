import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamilies } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
  },
  containerSmall: {
    padding: spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    marginBottom: 2,
    fontFamily: fontFamilies.numeric,
  },
  label: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
