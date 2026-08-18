import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technique } from '../types';

const KEYS = {
  LEARNING_PLAN: 'learning_plan',
  STREAK: 'streak_data',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

export interface LearningPlanData {
  id: string;
  hobby: string;
  hobbyIcon: string;
  hobbyColor: string;
  level: string;
  techniques: Technique[];
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalXp: number;
  techniquesCompleted: number;
}

export const saveLearningPlan = async (plan: LearningPlanData): Promise<void> => {
  await AsyncStorage.setItem(KEYS.LEARNING_PLAN, JSON.stringify(plan));
};

export const getLearningPlan = async (): Promise<LearningPlanData | null> => {
  const data = await AsyncStorage.getItem(KEYS.LEARNING_PLAN);
  return data ? JSON.parse(data) : null;
};

export const clearLearningPlan = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.LEARNING_PLAN);
};

export const updateTechnique = async (
  techniqueId: string,
  updates: Partial<Technique>
): Promise<LearningPlanData | null> => {
  const plan = await getLearningPlan();
  if (!plan) return null;

  plan.techniques = plan.techniques.map((t) =>
    t.id === techniqueId ? { ...t, ...updates } : t
  );

  if (updates.status === 'completed' || updates.status === 'skipped') {
    const currentIndex = plan.techniques.findIndex((t) => t.id === techniqueId);
    const nextTechnique = plan.techniques[currentIndex + 1];
    if (nextTechnique && nextTechnique.status === 'locked') {
      plan.techniques[currentIndex + 1] = {
        ...nextTechnique,
        status: 'active',
      };
    }
  }

  await saveLearningPlan(plan);
  return plan;
};

export const replaceTechnique = async (
  oldTechniqueId: string,
  newTechnique: Technique
): Promise<LearningPlanData | null> => {
  const plan = await getLearningPlan();
  if (!plan) return null;

  plan.techniques = plan.techniques.map((t) =>
    t.id === oldTechniqueId ? { ...newTechnique, order: t.order, status: t.status } : t
  );

  await saveLearningPlan(plan);
  return plan;
};

export const getStreakData = async (): Promise<StreakData> => {
  const data = await AsyncStorage.getItem(KEYS.STREAK);
  if (data) return JSON.parse(data);

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalXp: 0,
    techniquesCompleted: 0,
  };
};

export const updateStreak = async (xpEarned: number = 0): Promise<StreakData> => {
  const streak = await getStreakData();
  const today = new Date().toISOString().split('T')[0];

  if (streak.lastActiveDate === today) {
    streak.totalXp += xpEarned;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastActiveDate === yesterdayStr) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    streak.totalXp += xpEarned;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  }

  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  return streak;
};

export const incrementTechniquesCompleted = async (): Promise<StreakData> => {
  const streak = await getStreakData();
  streak.techniquesCompleted += 1;
  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  return streak;
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return value === 'true';
};

export const setOnboardingComplete = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
};

export const resetOnboarding = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.ONBOARDING_COMPLETE);
  await AsyncStorage.removeItem(KEYS.LEARNING_PLAN);
  await AsyncStorage.removeItem(KEYS.STREAK);
};
