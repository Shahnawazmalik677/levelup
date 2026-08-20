import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convergeArea: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    fontSize: 32,
  },
  mark: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markImage: {
    width: 96,
    height: 96,
  },
  textGroup: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  wordmark: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
