import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';

interface CompletionCelebrationProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  xpLabel?: string;
}

export const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  visible,
  title,
  subtitle,
  xpLabel,
}) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.5);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.circle, { transform: [{ scale }], opacity }]}
      >
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>
      <Animated.View style={[styles.textGroup, { opacity }]}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        {xpLabel && <Text style={styles.xp}>{xpLabel}</Text>}
      </Animated.View>
    </View>
  );
};
