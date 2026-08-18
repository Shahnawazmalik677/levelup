import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

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
    fontWeight: '700',
    color: colors.warning,
    marginTop: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
