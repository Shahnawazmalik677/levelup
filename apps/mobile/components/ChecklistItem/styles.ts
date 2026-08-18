import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    flex: 1,
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
});
