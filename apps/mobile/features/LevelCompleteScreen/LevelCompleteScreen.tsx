import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SKILL_LEVEL_LABELS, getNextLevel } from '../../types';
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { useMasteredHobbies } from '../../hooks/useMasteredHobbies';
import { apiService } from '../../services/api';
import { upsertLearningPlan } from '../../store/storage';
import { colors } from '../../constants/theme';
import { styles } from './styles';

export function LevelCompleteScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const { plans, loading, refreshPlans } = useLearningPlans();
  const { addMasteredHobby } = useMasteredHobbies();

  const plan = plans.find((p) => p.id === planId);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const masteredRecorded = useRef(false);

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const level = plan?.level;
  const nextLevel = level ? getNextLevel(level) : null;
  const isPro = !!plan && !nextLevel;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  useEffect(() => {
    if (isPro && plan && !masteredRecorded.current) {
      masteredRecorded.current = true;
      addMasteredHobby({
        hobby: plan.hobby,
        hobbyIcon: plan.hobbyIcon,
        masteredAt: new Date().toISOString(),
      });
    }
  }, [isPro, plan, addMasteredHobby]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!plan || !level) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Button onPress={() => router.replace('/(tabs)')} textColor={colors.primary}>
            Back to My Path
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinue = async () => {
    if (!nextLevel) return;

    setGenerating(true);
    setError('');
    try {
      const result = await apiService.generateLearningPlan({
        hobby: plan.hobby,
        level: nextLevel,
      });

      await upsertLearningPlan({
        id: result.id,
        hobby: result.hobby,
        hobbyIcon: plan.hobbyIcon,
        level: result.level,
        techniques: result.techniques,
        createdAt: result.createdAt,
      });

      await refreshPlans();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to generate next-level plan:', err);
      setError('Failed to generate your next plan. Please try again.');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="headlineSmall" style={styles.loadingTitle}>
            Crafting your next plan...
          </Text>
          <Text variant="bodyMedium" style={styles.loadingSubtitle}>
            AI is picking {SKILL_LEVEL_LABELS[nextLevel!].title.toLowerCase()} techniques for{' '}
            {plan.hobby}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Animated.View
          style={[styles.badge, isPro && styles.badgePro, { transform: [{ scale }], opacity }]}
        >
          <Text style={styles.badgeIcon}>{isPro ? '🏆' : plan.hobbyIcon}</Text>
        </Animated.View>

        <Animated.View style={[styles.textGroup, { opacity }]}>
          <Text variant="headlineMedium" style={styles.title}>
            {isPro ? `You're a ${plan.hobby} Pro!` : `${SKILL_LEVEL_LABELS[level].title} complete!`}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {isPro
              ? `You've mastered every level of ${plan.hobby} — from first steps to advanced technique. That's a real achievement.`
              : `You've mastered every technique in ${plan.hobby} — ${SKILL_LEVEL_LABELS[level].title}. Ready to go deeper?`}
          </Text>

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          {isPro ? (
            <>
              <Button
                mode="contained"
                onPress={() => router.replace('/(tabs)/explore')}
                style={styles.primaryButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                Explore a New Hobby
              </Button>
              <Button
                mode="text"
                onPress={() => router.replace('/(tabs)')}
                textColor={colors.textSecondary}
              >
                Back to My Path
              </Button>
            </>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={handleContinue}
                style={styles.primaryButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                Continue to {SKILL_LEVEL_LABELS[nextLevel!].title}
              </Button>
              <Button
                mode="text"
                onPress={() => router.replace('/(tabs)')}
                textColor={colors.textSecondary}
              >
                Not Now
              </Button>
            </>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
