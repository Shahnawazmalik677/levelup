import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillLevel, SKILL_LEVEL_LABELS } from '../../types';
import { HobbyCard } from '../../components/HobbyCard';
import { LevelOption } from '../../components/LevelOption';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { PRESET_HOBBIES } from '../../constants/hobbies';
import { apiService } from '../../services/api';
import { saveLearningPlan, setOnboardingComplete } from '../../store/storage';
import { useLearningPlan } from '../../hooks/useLearningPlan';

export default function ExploreScreen() {
  const router = useRouter();
  const { plan, refreshPlan } = useLearningPlan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHobby, setSelectedHobby] = useState<typeof PRESET_HOBBIES[0] | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [generating, setGenerating] = useState(false);

  const filteredHobbies = PRESET_HOBBIES.filter((hobby) =>
    hobby.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartNewHobby = async () => {
    if (!selectedHobby || !selectedLevel) return;

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
    if (!selectedHobby || !selectedLevel) return;

    setGenerating(true);
    try {
      const result = await apiService.generateLearningPlan({
        hobby: selectedHobby.name,
        level: selectedLevel,
      });

      await saveLearningPlan({
        id: result.id,
        hobby: result.hobby,
        hobbyIcon: selectedHobby.icon,
        hobbyColor: selectedHobby.color,
        level: result.level,
        techniques: result.techniques,
        createdAt: result.createdAt,
      });

      await setOnboardingComplete();
      await refreshPlan();

      setSelectedHobby(null);
      setSelectedLevel(null);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate learning plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Explore Hobbies
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Pick a new hobby to learn
        </Text>

        <Searchbar
          placeholder="Search hobbies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.textMuted}
          placeholderTextColor={colors.textMuted}
        />

        <View style={styles.hobbyGrid}>
          {filteredHobbies.map((hobby) => (
            <HobbyCard
              key={hobby.id}
              name={hobby.name}
              icon={hobby.icon}
              color={hobby.color}
              description={hobby.description}
              selected={selectedHobby?.id === hobby.id}
              onPress={() => setSelectedHobby(hobby)}
            />
          ))}
        </View>

        {selectedHobby && (
          <View style={styles.levelSection}>
            <Text variant="titleMedium" style={styles.levelTitle}>
              Choose your level for {selectedHobby.name}
            </Text>
            {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, { title: string; description: string }][]).map(
              ([key, { title, description }]) => (
                <LevelOption
                  key={key}
                  title={title}
                  description={description}
                  selected={selectedLevel === key}
                  onPress={() => setSelectedLevel(key)}
                  accentColor={selectedHobby.color}
                />
              )
            )}

            <Button
              mode="contained"
              onPress={handleStartNewHobby}
              disabled={!selectedLevel || generating}
              loading={generating}
              style={styles.startButton}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {generating ? 'Generating...' : 'Start Learning'}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    color: colors.text,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  levelSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  levelTitle: {
    color: colors.text,
    marginBottom: spacing.md,
  },
  startButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});
