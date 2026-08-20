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
    padding: spacing.xl,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgePro: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  badgeIcon: {
    fontSize: 40,
  },
  textGroup: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  primaryButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    width: '100%',
    marginBottom: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    height: 48,
  },
  loadingTitle: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
