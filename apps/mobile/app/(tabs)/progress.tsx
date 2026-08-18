import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatCard } from '../../components/StatCard';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { colors, spacing, borderRadius } from '../../constants/theme';

export default function ProgressScreen() {
  const router = useRouter();
  const { plan, loading, resetPlan } = useLearningPlan();
  const { streak } = useStreak();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="📊"
          title="No Progress Yet"
          description="Start learning a hobby to see your stats here"
          actionLabel="Pick a Hobby"
          onAction={() => router.push('/onboarding')}
        />
      </SafeAreaView>
    );
  }

  const completed = plan.techniques.filter((t) => t.status === 'completed').length;
  const skipped = plan.techniques.filter((t) => t.status === 'skipped').length;
  const active = plan.techniques.filter((t) => t.status === 'active').length;
  const total = plan.techniques.length;
  const effectiveTotal = total - skipped;
  const overallProgress = effectiveTotal > 0 ? completed / effectiveTotal : 0;

  return (
    <SafeAreaView style={styles.container}>
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
          <StatCard
            icon="✅"
            value={completed}
            label="Completed"
            accentColor={colors.success}
          />
          <StatCard
            icon="⭐"
            value={streak.totalXp}
            label="Total XP"
            accentColor={colors.warning}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="🔥"
            value={streak.longestStreak}
            label="Best Streak"
            accentColor={colors.secondary}
          />
          <StatCard
            icon="📚"
            value={active}
            label="In Progress"
            accentColor={colors.primary}
          />
        </View>

        {/* Overall progress */}
        <View style={styles.overallSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {plan.hobbyIcon} {plan.hobby} Journey
          </Text>
          <View style={styles.progressRow}>
            <Text variant="bodySmall" style={styles.progressLabel}>
              {completed} of {effectiveTotal} techniques mastered
            </Text>
            <Text variant="bodySmall" style={[styles.progressPercent, { color: plan.hobbyColor }]}>
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={overallProgress}
            color={plan.hobbyColor}
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
                    color={plan.hobbyColor}
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

        {/* Reset */}
        <Button
          mode="outlined"
          onPress={() => {
            resetPlan();
            router.replace('/onboarding');
          }}
          style={styles.resetButton}
          textColor={colors.error}
        >
          Start Over with New Hobby
        </Button>
      </ScrollView>
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
    marginBottom: spacing.lg,
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  overallSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressPercent: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  breakdownSection: {
    marginTop: spacing.lg,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  techniqueInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  techniqueName: {
    color: colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  skippedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  miniProgress: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
    marginTop: 4,
  },
  techniquePercent: {
    color: colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
  resetButton: {
    borderColor: colors.error,
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
  },
});
