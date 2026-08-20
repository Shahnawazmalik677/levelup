import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hobbyIcon: {
    fontSize: 32,
  },
  headerTitle: {
    color: colors.text,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  hobbySwitcher: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  hobbyChip: {
    color: colors.textSecondary,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  hobbyChipActive: {
    color: colors.onPrimary,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    fontWeight: '600',
  },
});
