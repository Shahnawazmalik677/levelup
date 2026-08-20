import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillTree } from '../../components/SkillTree';
import { StreakBadge } from '../../components/StreakBadge';
import { EmptyState } from '../../components/EmptyState';
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { useStreak } from '../../hooks/useStreak';
import { styles } from './styles';

export function MyPathScreen() {
  const router = useRouter();
  const { plans, loading, refreshPlans } = useLearningPlans();
  const { streak, refreshStreak } = useStreak();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshPlans(true);
      refreshStreak(true);
    }, [refreshPlans, refreshStreak])
  );

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

  if (plans.length === 0) {
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

  const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];

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

        {/* Hobby switcher */}
        {plans.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hobbySwitcher}
          >
            {plans.map((p) => (
              <Text
                key={p.id}
                onPress={() => setSelectedPlanId(p.id)}
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

        {/* Skill Tree */}
        <SkillTree
          techniques={plan.techniques}
          onTechniquePress={(technique) => {
            if (technique.status !== 'locked') {
              router.push(`/technique/${plan.id}/${technique.id}`);
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
