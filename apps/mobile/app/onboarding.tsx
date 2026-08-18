import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TextInput as RNTextInput,
} from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SkillLevel, SKILL_LEVEL_LABELS } from '../types';
import { HobbyCard } from '../components/HobbyCard';
import { LevelOption } from '../components/LevelOption';
import { colors, spacing, borderRadius } from '../constants/theme';
import { PRESET_HOBBIES } from '../constants/hobbies';
import { apiService } from '../services/api';
import { saveLearningPlan, setOnboardingComplete } from '../store/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Step = 'hobby' | 'level' | 'loading';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hobby');
  const [selectedHobby, setSelectedHobby] = useState<typeof PRESET_HOBBIES[0] | null>(null);
  const [customHobby, setCustomHobby] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: Step) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleHobbyNext = () => {
    if (!selectedHobby && !customHobby.trim()) {
      setError('Pick a hobby or type your own');
      return;
    }
    setError('');
    animateTransition('level');
  };

  const handleGeneratePlan = async () => {
    if (!selectedLevel) {
      setError('Pick your skill level');
      return;
    }

    setError('');
    animateTransition('loading');

    const hobbyName = selectedHobby?.name || customHobby.trim();

    try {
      const plan = await apiService.generateLearningPlan({
        hobby: hobbyName,
        level: selectedLevel,
      });

      await saveLearningPlan({
        id: plan.id,
        hobby: plan.hobby,
        hobbyIcon: selectedHobby?.icon || '🎯',
        hobbyColor: selectedHobby?.color || colors.primary,
        level: plan.level,
        techniques: plan.techniques,
        createdAt: plan.createdAt,
      });

      await setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setError('Failed to generate your plan. Please try again.');
      animateTransition('level');
    }
  };

  const renderHobbyStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        What do you want to learn?
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Pick a hobby or type your own
      </Text>

      <ScrollView
        style={styles.hobbyScroll}
        contentContainerStyle={styles.hobbyGrid}
        showsVerticalScrollIndicator={false}
      >
        {PRESET_HOBBIES.map((hobby) => (
          <HobbyCard
            key={hobby.id}
            name={hobby.name}
            icon={hobby.icon}
            color={hobby.color}
            description={hobby.description}
            selected={selectedHobby?.id === hobby.id}
            onPress={() => {
              setSelectedHobby(hobby);
              setCustomHobby('');
              setError('');
            }}
          />
        ))}
      </ScrollView>

      <Text variant="bodyMedium" style={styles.orText}>
        or type your own
      </Text>

      <TextInput
        mode="outlined"
        placeholder="e.g., Origami, Skateboarding..."
        value={customHobby}
        onChangeText={(text) => {
          setCustomHobby(text);
          setSelectedHobby(null);
          setError('');
        }}
        style={styles.input}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
        placeholderTextColor={colors.textMuted}
      />

      {error ? (
        <Text variant="bodySmall" style={styles.error}>{error}</Text>
      ) : null}

      <Button
        mode="contained"
        onPress={handleHobbyNext}
        style={styles.nextButton}
        labelStyle={styles.buttonLabel}
        contentStyle={styles.buttonContent}
      >
        Continue
      </Button>
    </View>
  );

  const renderLevelStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        How deep do you want to go?
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        This decides the complexity of your {selectedHobby?.name || customHobby} techniques
      </Text>

      <View style={styles.levelOptions}>
        {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, { title: string; description: string }][]).map(
          ([key, { title, description }]) => (
            <LevelOption
              key={key}
              title={title}
              description={description}
              selected={selectedLevel === key}
              onPress={() => {
                setSelectedLevel(key);
                setError('');
              }}
              icon={key === 'curious' ? '👀' : key === 'beginner' ? '🌱' : '🚀'}
              accentColor={selectedHobby?.color || colors.primary}
            />
          )
        )}
      </View>

      {error ? (
        <Text variant="bodySmall" style={styles.error}>{error}</Text>
      ) : null}

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => animateTransition('hobby')}
          style={[styles.backButton]}
          labelStyle={styles.buttonLabel}
          textColor={colors.textSecondary}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleGeneratePlan}
          style={[styles.nextButton, { flex: 1 }]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          disabled={!selectedLevel}
        >
          Generate My Plan
        </Button>
      </View>
    </View>
  );

  const renderLoadingStep = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={selectedHobby?.color || colors.primary} />
      <Text variant="headlineSmall" style={styles.loadingTitle}>
        Crafting your plan...
      </Text>
      <Text variant="bodyMedium" style={styles.loadingSubtitle}>
        AI is picking the best {selectedHobby?.name || customHobby} techniques for you
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {step === 'hobby' && renderHobbyStep()}
        {step === 'level' && renderLevelStep()}
        {step === 'loading' && renderLoadingStep()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  hobbyScroll: {
    flex: 1,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  orText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  levelOptions: {
    flex: 1,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nextButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingTitle: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
