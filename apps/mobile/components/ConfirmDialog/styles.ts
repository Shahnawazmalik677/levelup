import { StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
  },
  message: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
