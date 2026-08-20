import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatCard } from '../../components/StatCard';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SKILL_LEVEL_LABELS } from '../../types';
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { useStreak } from '../../hooks/useStreak';
import { useMasteredHobbies } from '../../hooks/useMasteredHobbies';
import { useLevelHistory } from '../../hooks/useLevelHistory';
import { colors } from '../../constants/theme';
import { styles } from './styles';

export function ProgressScreen() {
  const router = useRouter();
  const { plans, activePlanId, setActivePlan, loading, removePlan, refreshPlans } = useLearningPlans();
  const { streak, refreshStreak } = useStreak();
  const { masteredHobbies, refreshMasteredHobbies } = useMasteredHobbies();
  const { levelHistory, refreshLevelHistory } = useLevelHistory();
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshPlans(true);
      refreshStreak(true);
      refreshMasteredHobbies(true);
      refreshLevelHistory(true);
    }, [refreshPlans, refreshStreak, refreshMasteredHobbies, refreshLevelHistory])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pastLevels = [...levelHistory].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
  );

  const masteredSection = masteredHobbies.length > 0 && (
    <View style={styles.masteredSection}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        🏆 Mastered
      </Text>
      <View style={styles.masteredRow}>
        {masteredHobbies.map((hobby) => (
          <View key={hobby.hobby} style={styles.masteredChip}>
            <Text style={styles.masteredChipIcon}>{hobby.hobbyIcon}</Text>
            <Text variant="bodyMedium" style={styles.masteredChipLabel}>
              {hobby.hobby}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const levelHistorySection = pastLevels.length > 0 && (
    <View style={styles.historySection}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Level History
      </Text>
      {pastLevels.map((entry) => (
        <View key={`${entry.level}-${entry.endedAt}`} style={styles.historyRow}>
          <Text style={styles.historyIcon}>{entry.hobbyIcon}</Text>
          <View style={styles.historyInfo}>
            <Text variant="bodyMedium" style={styles.historyLevel}>
              {entry.hobby} · {SKILL_LEVEL_LABELS[entry.level].title}
            </Text>
            <Text variant="bodySmall" style={styles.historyDate}>
              {new Date(entry.endedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.historyCount}>
            {entry.completed}/{entry.total}
          </Text>
        </View>
      ))}
    </View>
  );

  if (plans.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          icon="📊"
          title="No Progress Yet"
          description="Start learning a hobby to see your stats here"
          actionLabel="Pick a Hobby"
          onAction={() => router.push('/onboarding')}
        />
        {masteredSection}
        {levelHistorySection}
      </SafeAreaView>
    );
  }

  const plan = plans.find((p) => p.id === activePlanId) || plans[0];

  const completed = plan.techniques.filter((t) => t.status === 'completed').length;
  const skipped = plan.techniques.filter((t) => t.status === 'skipped').length;
  const active = plan.techniques.filter((t) => t.status === 'active').length;
  const total = plan.techniques.length;
  const effectiveTotal = total - skipped;
  const overallProgress = effectiveTotal > 0 ? completed / effectiveTotal : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Your Progress
        </Text>

        {/* Streak section */}
        <View style={styles.streakCard}>
          <StreakBadge
            count={streak.currentStreak}
            size="large"
            label="day streak"
          />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="✅" value={streak.techniquesCompleted} label="Completed" />
          <StatCard icon="⭐" value={streak.totalXp} label="Total XP" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={streak.longestStreak} label="Best Streak" />
          <StatCard icon="📚" value={active} label="In Progress" />
        </View>

        {levelHistorySection}
        {masteredSection}

        {plans.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hobbySwitcher}
          >
            {plans.map((p) => (
              <Text
                key={p.id}
                onPress={() => setActivePlan(p.id)}
                style={[
                  styles.hobbyChip,
                  p.id === plan.id && styles.hobbyChipActive,
                ]}
              >
                {p.hobbyIcon} {p.hobby}
              </Text>
            ))}
          </ScrollView>
        )}

        {/* Overall progress */}
        <View style={styles.overallSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {plan.hobbyIcon} {plan.hobby} Journey
          </Text>
          <View style={styles.progressRow}>
            <Text variant="bodySmall" style={styles.progressLabel}>
              {completed} of {effectiveTotal} techniques mastered
            </Text>
            <Text variant="bodySmall" style={styles.progressPercent}>
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={overallProgress}
            color={colors.primary}
            style={styles.progressBar}
          />
        </View>

        {/* Technique breakdown */}
        <View style={styles.breakdownSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Techniques
          </Text>
          {plan.techniques.map((technique) => (
            <View key={technique.id} style={styles.techniqueRow}>
              <Text style={styles.statusIcon}>
                {technique.status === 'completed'
                  ? '✅'
                  : technique.status === 'skipped'
                  ? '⏭️'
                  : technique.status === 'active'
                  ? '▶️'
                  : '🔒'}
              </Text>
              <View style={styles.techniqueInfo}>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.techniqueName,
                    technique.status === 'completed' && styles.completedText,
                    technique.status === 'skipped' && styles.skippedText,
                  ]}
                  numberOfLines={1}
                >
                  {technique.name}
                </Text>
                {technique.status === 'active' && (
                  <ProgressBar
                    progress={technique.progress / 100}
                    color={colors.primary}
                    style={styles.miniProgress}
                  />
                )}
              </View>
              <Text variant="bodySmall" style={styles.techniquePercent}>
                {technique.progress}%
              </Text>
            </View>
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={() => setRemoveDialogVisible(true)}
          style={styles.resetButton}
          textColor={colors.error}
        >
          Remove {plan.hobby}
        </Button>
      </ScrollView>

      <ConfirmDialog
        visible={removeDialogVisible}
        title={`Remove ${plan.hobby}?`}
        message={`This clears your ${plan.hobby} plan and progress. Your streak, XP, level history, and mastered hobbies aren't affected — and neither are your other active hobbies.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setRemoveDialogVisible(false);
          removePlan(plan.id);
        }}
        onDismiss={() => setRemoveDialogVisible(false)}
      />
    </SafeAreaView>
  );
}
