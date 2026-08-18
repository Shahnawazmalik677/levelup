import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  verticalContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  verticalContent: {
    padding: spacing.sm,
  },
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  horizontalThumbnailWrapper: {
    width: 140,
    height: 80,
    position: 'relative',
  },
  horizontalThumbnail: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    marginBottom: 2,
  },
  channel: {
    color: colors.textSecondary,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
