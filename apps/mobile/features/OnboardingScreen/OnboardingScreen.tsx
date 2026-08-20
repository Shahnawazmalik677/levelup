import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillLevel, SKILL_LEVEL_LABELS } from '../../types';
import { HobbyCard } from '../../components/HobbyCard';
import { LevelOption } from '../../components/LevelOption';
import { colors } from '../../constants/theme';
import { PRESET_HOBBIES } from '../../constants/hobbies';
import { apiService } from '../../services/api';
import { upsertLearningPlan, setOnboardingComplete } from '../../store/storage';
import { styles } from './styles';

type Step = 'hobby' | 'level' | 'loading';

export function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hobby');
  const [selectedHobby, setSelectedHobby] = useState<typeof PRESET_HOBBIES[0] | null>(null);
  const [customHobby, setCustomHobby] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  const animateTransition = (nextStep: Step) => {
    setStep(nextStep);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fadeAnim.setValue(0);
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
  }, [step, fadeAnim, slideAnim]);

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

      await upsertLearningPlan({
        id: plan.id,
        hobby: plan.hobby,
        hobbyIcon: selectedHobby?.icon || '🎯',
        level: plan.level,
        techniques: plan.techniques,
        createdAt: plan.createdAt,
      });

      await setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate your plan. Please try again.');
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

      <ScrollView
        style={styles.levelOptionsScroll}
        contentContainerStyle={styles.levelOptions}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

      {error ? (
        <Text variant="bodySmall" style={styles.error}>{error}</Text>
      ) : null}

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => animateTransition('hobby')}
          style={[styles.backButton]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}
