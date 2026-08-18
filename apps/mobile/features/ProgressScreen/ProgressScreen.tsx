import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatCard } from '../../components/StatCard';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { colors } from '../../constants/theme';
import { styles } from './styles';

export function ProgressScreen() {
  const router = useRouter();
  const { plan, loading, resetPlan } = useLearningPlan();
  const { streak } = useStreak();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          <StatCard icon="✅" value={completed} label="Completed" />
          <StatCard icon="⭐" value={streak.totalXp} label="Total XP" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={streak.longestStreak} label="Best Streak" />
          <StatCard icon="📚" value={active} label="In Progress" />
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
