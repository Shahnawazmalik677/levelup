import React, { useEffect, useRef } from 'react';
import { View, Animated, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { isOnboardingComplete } from '../../store/storage';
import { apiService } from '../../services/api';
import { styles } from './styles';

// Hobby icons converge toward the center and give way to the app mark — a
// visual shorthand for "any hobby becomes one focused path." Evenly spaced
// around a circle rather than randomly scattered, so it reads as composed
// rather than chaotic.
const CONVERGING_ICONS = ['♟️', '🎸', '🎨', '🧘', '💻'];
const RADIUS = 120;
const iconOffsets = CONVERGING_ICONS.map((_, i) => {
  const angle = (i / CONVERGING_ICONS.length) * 2 * Math.PI - Math.PI / 2;
  return { dx: Math.cos(angle) * RADIUS, dy: Math.sin(angle) * RADIUS };
});

const MIN_DURATION_MS = 2600;

export function IntroScreen() {
  const router = useRouter();
  const converge = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(converge, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        toValue: 1,
        friction: 6,
        delay: 750,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        delay: 1300,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 1300,
        useNativeDriver: true,
      }),
    ]).start();

    // Fire-and-forget: on a free-tier host the server may be asleep. Pinging
    // it now, during the animation's own dead time, gives it a head start
    // waking up instead of waiting for the first real request to trigger it.
    apiService.healthCheck().catch(() => {});

    const navigate = async () => {
      const completed = await isOnboardingComplete();
      router.replace(completed ? '/(tabs)' : '/onboarding');
    };

    const timer = setTimeout(navigate, MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router, converge, markScale, textOpacity, textTranslateY]);

  return (
    <View style={styles.container}>
      <View style={styles.convergeArea}>
        {CONVERGING_ICONS.map((icon, i) => {
          const { dx, dy } = iconOffsets[i];
          return (
            <Animated.Text
              key={icon}
              style={[
                styles.icon,
                {
                  opacity: converge.interpolate({
                    inputRange: [0, 0.4, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateX: converge.interpolate({
                        inputRange: [0, 1],
                        outputRange: [dx, 0],
                      }),
                    },
                    {
                      translateY: converge.interpolate({
                        inputRange: [0, 1],
                        outputRange: [dy, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {icon}
            </Animated.Text>
          );
        })}

        <Animated.View style={[styles.mark, { transform: [{ scale: markScale }] }]}>
          <Image
            source={require('../../assets/android-icon-foreground.png')}
            style={styles.markImage}
          />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.textGroup,
          { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
        ]}
      >
        <Text variant="headlineLarge" style={styles.wordmark}>
          LevelUp
        </Text>
        <Text variant="bodyMedium" style={styles.tagline}>
          Master any hobby, technique by technique.
        </Text>
      </Animated.View>
    </View>
  );
}
