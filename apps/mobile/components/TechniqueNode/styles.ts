import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamilies } from '../../constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nodeSection: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 16,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  progressRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
  },
  connector: {
    width: 2.5,
    height: 40,
    marginTop: spacing.xs,
  },
  contentSection: {
    flex: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  name: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  completedName: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  skippedName: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.textSecondary,
  },
  progressText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fontFamilies.numeric,
  },
});
