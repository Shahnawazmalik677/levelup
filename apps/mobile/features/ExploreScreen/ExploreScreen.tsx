import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillLevel, SKILL_LEVEL_LABELS } from '../../types';
import { HobbyCard } from '../../components/HobbyCard';
import { LevelOption } from '../../components/LevelOption';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { colors } from '../../constants/theme';
import { PRESET_HOBBIES } from '../../constants/hobbies';
import { apiService } from '../../services/api';
import { upsertLearningPlan, setOnboardingComplete, MAX_CONCURRENT_PLANS } from '../../store/storage';
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { styles } from './styles';

type Step = 'hobby' | 'level' | 'loading';

export function ExploreScreen() {
  const router = useRouter();
  const { plans, refreshPlans } = useLearningPlans();

  useFocusEffect(
    useCallback(() => {
      refreshPlans(true);
    }, [refreshPlans])
  );

  const [step, setStep] = useState<Step>('hobby');
  const [selectedHobby, setSelectedHobby] = useState<typeof PRESET_HOBBIES[0] | null>(null);
  const [customHobby, setCustomHobby] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [error, setError] = useState('');
  const [confirmReplaceVisible, setConfirmReplaceVisible] = useState(false);

  const hobbyName = selectedHobby?.name || customHobby.trim();
  const existingPlan = plans.find(
    (p) => p.hobby.toLowerCase() === hobbyName.toLowerCase()
  );

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

  const handleStartLearning = () => {
    if (!selectedLevel) {
      setError('Pick your skill level');
      return;
    }

    if (existingPlan) {
      setError('');
      setConfirmReplaceVisible(true);
      return;
    }

    if (plans.length >= MAX_CONCURRENT_PLANS) {
      setError(
        `You're already tracking ${MAX_CONCURRENT_PLANS} hobbies at once. Finish or remove one before adding another.`
      );
      return;
    }

    setError('');
    generatePlan();
  };

  const generatePlan = async () => {
    if (!selectedLevel) return;

    animateTransition('loading');

    try {
      const result = await apiService.generateLearningPlan({
        hobby: hobbyName,
        level: selectedLevel,
      });

      await upsertLearningPlan({
        id: result.id,
        hobby: result.hobby,
        hobbyIcon: selectedHobby?.icon || '🎯',
        level: result.level,
        techniques: result.techniques,
        createdAt: result.createdAt,
      });

      await setOnboardingComplete();
      await refreshPlans();

      setSelectedHobby(null);
      setCustomHobby('');
      setSelectedLevel(null);
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
        Explore Hobbies
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Pick a new hobby to learn
      </Text>

      {plans.length > 0 && (
        <Text variant="bodySmall" style={styles.activeHobbiesHint}>
          Currently learning: {plans.map((p) => `${p.hobbyIcon} ${p.hobby}`).join('  ·  ')}
        </Text>
      )}

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
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          textColor={colors.textSecondary}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleStartLearning}
          style={[styles.nextButton, { flex: 1 }]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          disabled={!selectedLevel}
        >
          Start Learning
        </Button>
      </View>
    </View>
  );

  const renderLoadingStep = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="headlineSmall" style={styles.loadingTitle}>
        Crafting your plan...
      </Text>
      <Text variant="bodyMedium" style={styles.loadingSubtitle}>
        AI is picking the best {selectedHobby?.name || customHobby} techniques for you
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

      <ConfirmDialog
        visible={confirmReplaceVisible}
        title="Replace This Plan?"
        message={`You already have a ${existingPlan?.level} plan for ${existingPlan?.hobby}. Generating a new one will replace it. Are you sure?`}
        confirmLabel="Yes, Replace It"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmReplaceVisible(false);
          generatePlan();
        }}
        onDismiss={() => setConfirmReplaceVisible(false)}
      />
    </SafeAreaView>
  );
}
