import React, { useState, useRef } from 'react';
import { View, ScrollView, Animated, Alert } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillLevel, SKILL_LEVEL_LABELS } from '../../types';
import { HobbyCard } from '../../components/HobbyCard';
import { LevelOption } from '../../components/LevelOption';
import { colors } from '../../constants/theme';
import { PRESET_HOBBIES } from '../../constants/hobbies';
import { apiService } from '../../services/api';
import { saveLearningPlan, setOnboardingComplete } from '../../store/storage';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { styles } from './styles';

type Step = 'hobby' | 'level' | 'loading';

export function ExploreScreen() {
  const router = useRouter();
  const { plan, refreshPlan } = useLearningPlan();
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

  const handleStartLearning = () => {
    if (!selectedLevel) {
      setError('Pick your skill level');
      return;
    }
    setError('');

    if (plan) {
      Alert.alert(
        'Start New Hobby?',
        `This will replace your current ${plan.hobby} learning plan. Are you sure?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Start Fresh', onPress: generatePlan },
        ]
      );
    } else {
      generatePlan();
    }
  };

  const generatePlan = async () => {
    if (!selectedLevel) return;

    animateTransition('loading');

    const hobbyName = selectedHobby?.name || customHobby.trim();

    try {
      const result = await apiService.generateLearningPlan({
        hobby: hobbyName,
        level: selectedLevel,
      });

      await saveLearningPlan({
        id: result.id,
        hobby: result.hobby,
        hobbyIcon: selectedHobby?.icon || '🎯',
        level: result.level,
        techniques: result.techniques,
        createdAt: result.createdAt,
      });

      await setOnboardingComplete();
      await refreshPlan();

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
    </SafeAreaView>
  );
}
