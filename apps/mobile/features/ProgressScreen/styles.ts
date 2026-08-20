import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamilies } from '../../constants/theme';

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hobbySwitcher: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  overallSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressPercent: {
    color: colors.primary,
    fontFamily: fontFamilies.numeric,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  breakdownSection: {
    marginTop: spacing.lg,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  techniqueInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  techniqueName: {
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  skippedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  miniProgress: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
    marginTop: 4,
  },
  techniquePercent: {
    color: colors.textMuted,
    width: 36,
    textAlign: 'right',
    fontFamily: fontFamilies.numeric,
  },
  historySection: {
    marginTop: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  historyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  historyLevel: {
    color: colors.text,
  },
  historyDate: {
    color: colors.textMuted,
    marginTop: 2,
  },
  historyCount: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.numeric,
  },
  masteredSection: {
    marginTop: spacing.lg,
  },
  masteredRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  masteredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  masteredChipIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  masteredChipLabel: {
    color: colors.text,
  },
  resetButton: {
    borderColor: colors.error,
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
  },
});
