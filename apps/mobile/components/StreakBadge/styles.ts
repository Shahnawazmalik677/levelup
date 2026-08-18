import { StyleSheet } from 'react-native';
import { colors, spacing, fontFamilies } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: colors.primary,
    marginTop: spacing.xs,
    fontFamily: fontFamilies.numeric,
  },
  label: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
