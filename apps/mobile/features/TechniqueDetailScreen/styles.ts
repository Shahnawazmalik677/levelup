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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.textSecondary,
  },
  timeText: {
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  whyBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  whyLabel: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  whyText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  videoLoader: {
    marginVertical: spacing.lg,
  },
  videoList: {
    gap: spacing.xs,
  },
  noVideos: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklistCount: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.numeric,
  },
  completeButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  completeLabel: {
    fontSize: 16,
    color: colors.onPrimary,
  },
  completeContent: {
    paddingVertical: spacing.xs,
  },
  swapOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: {
    color: colors.text,
    marginTop: spacing.md,
  },
});
