import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
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
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { CompletionCelebration } from '../../components/CompletionCelebration';
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { useStreak } from '../../hooks/useStreak';
import { apiService } from '../../services/api';
import { isPlanComplete } from '../../store/storage';
import { colors } from '../../constants/theme';
import { styles } from './styles';

const TECHNIQUE_COMPLETION_XP = 50;
const CHECKLIST_ITEM_XP = 5;

export function TechniqueDetailScreen() {
  const { planId, id } = useLocalSearchParams<{ planId: string; id: string }>();
  const router = useRouter();
  const {
    plans,
    loading,
    toggleChecklistItem,
    markTechniqueComplete,
    skipTechnique,
    swapTechnique,
  } = useLearningPlans();
  const { recordActivity, recordTechniqueCompletion } = useStreak();

  const plan = plans.find((p) => p.id === planId);

  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [completeDialogVisible, setCompleteDialogVisible] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [skipDialogVisible, setSkipDialogVisible] = useState(false);
  const [swapResultDialog, setSwapResultDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const technique = plan?.techniques.find((t) => t.id === id);

  useEffect(() => {
    if (technique && plan) {
      loadVideos();
    }
  }, [technique?.id, technique?.name]);

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
    if (!technique || !plan) return;
    await toggleChecklistItem(plan.id, technique.id, itemId);
    await recordActivity(CHECKLIST_ITEM_XP);
  };

  const handleComplete = () => {
    if (!technique) return;
    setCompleteDialogVisible(true);
  };

  const confirmComplete = async () => {
    if (!technique || !plan) return;
    setCompleteDialogVisible(false);
    setCelebrating(true);

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1300));
    const persist = (async () => {
      const updatedPlan = await markTechniqueComplete(plan.id, technique.id);
      await recordActivity(TECHNIQUE_COMPLETION_XP);
      await recordTechniqueCompletion();
      return updatedPlan;
    })();

    const [, updatedPlan] = await Promise.all([minDelay, persist]);

    if (updatedPlan && isPlanComplete(updatedPlan)) {
      router.replace({ pathname: '/level-complete', params: { planId: plan.id } });
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    if (!technique) return;
    setSkipDialogVisible(true);
  };

  const confirmSkip = async () => {
    if (!technique || !plan) return;
    setSkipDialogVisible(false);
    await skipTechnique(plan.id, technique.id);
    router.back();
  };

  const handleSwap = async () => {
    if (!technique || !plan) return;

    setSwapping(true);
    try {
      const result = await apiService.swapTechnique({
        hobby: plan.hobby,
        level: plan.level,
        currentTechnique: technique.name,
        existingTechniques: plan.techniques.map((t) => t.name),
      });

      await swapTechnique(plan.id, technique.id, result.technique);
      setSwapResultDialog({
        visible: true,
        title: 'Swapped!',
        message: `Replaced with "${result.technique.name}"`,
      });
    } catch (error) {
      setSwapResultDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to find a replacement. Try again.',
      });
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
  const checklistComplete = totalItems === 0 || completedItems === totalItems;

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

        {technique.status === 'active' && (
          <>
            <Button
              mode="contained"
              onPress={handleComplete}
              disabled={!checklistComplete}
              style={[styles.completeButton, !checklistComplete && styles.completeButtonDisabled]}
              labelStyle={[styles.completeLabel, !checklistComplete && styles.completeLabelDisabled]}
              contentStyle={styles.completeContent}
              icon="check-circle"
            >
              Mark as Mastered (+{TECHNIQUE_COMPLETION_XP} XP)
            </Button>
            {!checklistComplete && (
              <Text variant="bodySmall" style={styles.completeHint}>
                Complete all {totalItems} practice steps to mark this as mastered
              </Text>
            )}
          </>
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

      <CompletionCelebration
        visible={celebrating}
        title="Technique Mastered!"
        subtitle={technique.name}
        xpLabel={`+${TECHNIQUE_COMPLETION_XP} XP`}
      />

      <ConfirmDialog
        visible={completeDialogVisible}
        title="Mark as Complete?"
        message={`Great job mastering "${technique.name}"! You'll earn ${TECHNIQUE_COMPLETION_XP} XP.`}
        confirmLabel="Complete!"
        cancelLabel="Not Yet"
        onConfirm={confirmComplete}
        onDismiss={() => setCompleteDialogVisible(false)}
      />

      <ConfirmDialog
        visible={skipDialogVisible}
        title="Skip this technique?"
        message={`"${technique.name}" will be struck through and the next one unlocked.`}
        confirmLabel="Skip"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmSkip}
        onDismiss={() => setSkipDialogVisible(false)}
      />

      <ConfirmDialog
        visible={swapResultDialog.visible}
        title={swapResultDialog.title}
        message={swapResultDialog.message}
        confirmLabel="OK"
        onConfirm={() => setSwapResultDialog((prev) => ({ ...prev, visible: false }))}
        onDismiss={() => setSwapResultDialog((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
