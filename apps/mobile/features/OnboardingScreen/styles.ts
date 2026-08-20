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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
    height: 48,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    height: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.xl,
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
