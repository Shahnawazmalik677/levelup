import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Technique, VideoResult } from '../../types';
import { VideoCard } from '../../components/VideoCard';
import { ChecklistItem } from '../../components/ChecklistItem';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { apiService } from '../../services/api';
import { colors, spacing, borderRadius } from '../../constants/theme';

export default function TechniqueDetailScreen() {
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
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    technique.difficulty === 'easy'
                      ? `${colors.success}20`
                      : technique.difficulty === 'medium'
                      ? `${colors.warning}20`
                      : `${colors.error}20`,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    technique.difficulty === 'easy'
                      ? colors.success
                      : technique.difficulty === 'medium'
                      ? colors.warning
                      : colors.error,
                  fontSize: 12,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {technique.difficulty}
              </Text>
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
              accentColor={plan?.hobbyColor || colors.primary}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  timeText: {
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  whyBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  whyLabel: {
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  whyText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  videoLoader: {
    marginVertical: spacing.lg,
  },
  videoList: {
    gap: spacing.xs,
  },
  noVideos: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklistCount: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  completeButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    backgroundColor: colors.success,
  },
  completeLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  completeContent: {
    paddingVertical: spacing.xs,
  },
  swapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: {
    color: colors.text,
    marginTop: spacing.md,
  },
});
