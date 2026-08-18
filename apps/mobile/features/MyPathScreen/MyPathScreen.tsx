import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillTree } from '../../components/SkillTree';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { useLearningPlan } from '../../hooks/useLearningPlan';
import { useStreak } from '../../hooks/useStreak';
import { styles } from './styles';

export function MyPathScreen() {
  const router = useRouter();
  const { plan, loading } = useLearningPlan();
  const { streak } = useStreak();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        />
      </ScrollView>
    </SafeAreaView>
  );
}
