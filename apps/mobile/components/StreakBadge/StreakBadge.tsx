import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';

interface StreakBadgeProps {
  count: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showLabel?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  count,
  label = 'day streak',
  size = 'medium',
  animated = true,
  showLabel = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated && count > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [animated, count, pulseAnim]);

  const sizeConfig = {
    small: { icon: 18, text: 14, container: 28 },
    medium: { icon: 24, text: 18, container: 36 },
    large: { icon: 36, text: 28, container: 48 },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.flameContainer,
          {
            width: config.container,
            height: config.container,
            transform: animated ? [{ scale: pulseAnim }] : [],
          },
        ]}
      >
        <Text style={{ fontSize: config.icon }}>🔥</Text>
      </Animated.View>
      <Text style={[styles.count, { fontSize: config.text }]}>
        {count}
      </Text>
      {showLabel && (
        <Text variant="bodySmall" style={styles.label}>
          {label}
        </Text>
      )}
    </View>
  );
};
