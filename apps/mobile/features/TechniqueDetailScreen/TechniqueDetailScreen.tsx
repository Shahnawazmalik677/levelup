import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoResult } from '../../types';
import { VideoCard } from '../../components/VideoCard';
import { ChecklistItem } from '../../components/ChecklistItem';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { apiService } from '../../services/api';
import { colors } from '../../constants/theme';
import { styles } from './styles';

export function TechniqueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    plan,
    toggleChecklistItem,
    markTechniqueComplete,
    skipTechnique,
    swapTechnique,
  } = useLearningPlan();
  const { recordActivity, recordTechniqueCompletion } = useStreak();

  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [swapping, setSwapping] = useState(false);

  const technique = plan?.techniques.find((t) => t.id === id);

  useEffect(() => {
    if (technique && plan) {
      loadVideos();
    }
  }, [technique?.id]);

  const loadVideos = async () => {
    if (!technique || !plan) return;

    setLoadingVideos(true);
    try {
      const query = `${technique.name} ${plan.hobby} tutorial ${plan.level}`;
      const result = await apiService.searchVideos(query, 5);
      setVideos(result.videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!technique) return;
    await toggleChecklistItem(technique.id, itemId);
    await recordActivity(5);
  };

  const handleComplete = async () => {
    if (!technique) return;

    Alert.alert(
      'Mark as Complete?',
      `Great job mastering "${technique.name}"! You'll earn 50 XP.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete!',
          onPress: async () => {
            await markTechniqueComplete(technique.id);
            await recordActivity(50);
            await recordTechniqueCompletion();
            router.back();
          },
        },
      ]
    );
  };

  const handleSkip = async () => {
    if (!technique) return;

    Alert.alert(
      'Skip this technique?',
      `"${technique.name}" will be struck through and the next one unlocked.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            await skipTechnique(technique.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSwap = async () => {
    if (!technique || !plan) return;

    setSwapping(true);
    try {
      const result = await apiService.swapTechnique({
        hobby: plan.hobby,
        level: plan.level as any,
        currentTechnique: technique.name,
        existingTechniques: plan.techniques.map((t) => t.name),
      });

      await swapTechnique(technique.id, result.technique);
      Alert.alert('Swapped!', `Replaced with "${result.technique.name}"`);
    } catch (error) {
      Alert.alert('Error', 'Failed to find a replacement. Try again.');
    } finally {
      setSwapping(false);
    }
  };

  if (!technique) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            Technique not found
          </Text>
          <Button onPress={() => router.back()} textColor={colors.primary}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const completedItems = technique.practiceChecklist.filter(
    (i) => i.completed
  ).length;
  const totalItems = technique.practiceChecklist.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor={colors.text}
          size={24}
          onPress={() => router.back()}
        />
        <View style={styles.headerActions}>
          <IconButton
            icon="swap-horizontal"
            iconColor={colors.textSecondary}
            size={20}
            onPress={handleSwap}
            disabled={swapping}
          />
          <IconButton
            icon="skip-next"
            iconColor={colors.textSecondary}
            size={20}
            onPress={handleSkip}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & meta */}
        <View style={styles.titleSection}>
          <Text variant="headlineSmall" style={styles.title}>
            {technique.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{technique.difficulty}</Text>
            </View>
            {technique.estimatedTime && (
              <Text variant="bodySmall" style={styles.timeText}>
                ⏱️ {technique.estimatedTime}
              </Text>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What & Why
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {technique.description}
          </Text>
          {technique.whyItMatters && (
            <View style={styles.whyBox}>
              <Text variant="bodySmall" style={styles.whyLabel}>
                💡 Why it matters
              </Text>
              <Text variant="bodyMedium" style={styles.whyText}>
                {technique.whyItMatters}
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Videos */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📺 Learn from Videos
          </Text>
          {loadingVideos ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.videoLoader}
            />
          ) : videos.length > 0 ? (
            <View style={styles.videoList}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnailUrl}
                  channelName={video.channelName}
                  duration={video.duration}
                  url={video.url}
                  layout="horizontal"
                />
              ))}
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.noVideos}>
              No videos found. Try searching YouTube for "{technique.name}"
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Practice checklist */}
        <View style={styles.section}>
          <View style={styles.checklistHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              ✅ Practice Checklist
            </Text>
            <Text variant="bodySmall" style={styles.checklistCount}>
              {completedItems}/{totalItems}
            </Text>
          </View>
          {technique.practiceChecklist.map((item) => (
            <ChecklistItem
              key={item.id}
              text={item.text}
              completed={item.completed}
              onToggle={() => handleToggleChecklist(item.id)}
            />
          ))}
        </View>

        {/* Complete button */}
        {technique.status === 'active' && (
          <Button
            mode="contained"
            onPress={handleComplete}
            style={styles.completeButton}
            labelStyle={styles.completeLabel}
            contentStyle={styles.completeContent}
            icon="check-circle"
          >
            Mark as Mastered (+50 XP)
          </Button>
        )}
      </ScrollView>

      {swapping && (
        <View style={styles.swapOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodyMedium" style={styles.swapText}>
            Finding a replacement...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
