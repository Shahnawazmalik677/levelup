import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillTree } from '../../components/SkillTree';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { colors, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { plan, loading } = useLearningPlan();
  const { streak } = useStreak();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading your path...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="🎯"
          title="No Learning Plan Yet"
          description="Pick a hobby and let AI craft your personalized skill tree"
          actionLabel="Get Started"
          onAction={() => router.push('/onboarding')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with streak */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.hobbyIcon}>{plan.hobbyIcon}</Text>
            <View>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                {plan.hobby}
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                {plan.level} level
              </Text>
            </View>
          </View>
          <StreakBadge
            count={streak.currentStreak}
            size="small"
            showLabel={false}
          />
        </View>

        {/* Skill Tree */}
        <SkillTree
          techniques={plan.techniques}
          onTechniquePress={(technique) => {
            if (technique.status !== 'locked') {
              router.push(`/technique/${technique.id}`);
            }
          }}
          accentColor={plan.hobbyColor}
        />
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
  loadingText: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hobbyIcon: {
    fontSize: 32,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
