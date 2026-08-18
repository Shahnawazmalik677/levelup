import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamilies } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  hobbyName: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressPercent: {
    fontFamily: fontFamilies.numeric,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
  },
  tree: {
    paddingTop: spacing.md,
  },
});
