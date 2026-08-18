import React from 'react';
import { Pressable, View, Image, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';

interface VideoCardProps {
  title: string;
  thumbnailUrl: string;
  channelName: string;
  duration?: string;
  url: string;
  onPress?: () => void;
  layout?: 'horizontal' | 'vertical';
  width?: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  thumbnailUrl,
  channelName,
  duration,
  url,
  onPress,
  layout = 'vertical',
  width,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Linking.openURL(url);
    }
  };

  if (layout === 'horizontal') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={styles.horizontalContainer}>
          <View style={styles.horizontalThumbnailWrapper}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.horizontalThumbnail}
              resizeMode="cover"
            />
            {duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{duration}</Text>
              </View>
            )}
          </View>
          <View style={styles.horizontalContent}>
            <Text variant="bodyMedium" style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text variant="bodySmall" style={styles.channel} numberOfLines={1}>
              {channelName}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        pressed && styles.pressed,
        width ? { width } : undefined,
      ]}
    >
      <View style={[styles.verticalContainer, width ? { width } : undefined]}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          )}
          <View style={styles.playOverlay}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
        <View style={styles.verticalContent}>
          <Text variant="bodyMedium" style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.channel} numberOfLines={1}>
            {channelName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
