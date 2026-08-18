import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  hobbyScroll: {
    flex: 1,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  orText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  levelOptions: {
    flex: 1,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nextButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  backButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
