import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technique } from '../types';

const KEYS = {
  LEARNING_PLANS: 'learning_plans',
  STREAK: 'streak_data',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  MASTERED_HOBBIES: 'mastered_hobbies',
  LEVEL_HISTORY: 'level_history',
} as const;

export const MAX_CONCURRENT_PLANS = 4;

export interface LearningPlanData {
  id: string;
  hobby: string;
  hobbyIcon: string;
  level: string;
  techniques: Technique[];
  createdAt: string;
}

export interface MasteredHobby {
  hobby: string;
  hobbyIcon: string;
  masteredAt: string;
}

export interface LevelHistoryEntry {
  hobby: string;
  hobbyIcon: string;
  level: string;
  completed: number;
  skipped: number;
  total: number;
  endedAt: string;
}

export const isPlanComplete = (plan: LearningPlanData): boolean =>
  plan.techniques.every((t) => t.status === 'completed' || t.status === 'skipped');

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalXp: number;
  techniquesCompleted: number;
}

export const getLevelHistory = async (): Promise<LevelHistoryEntry[]> => {
  const data = await AsyncStorage.getItem(KEYS.LEVEL_HISTORY);
  const entries: LevelHistoryEntry[] = data ? JSON.parse(data) : [];
  // Filters out entries written before archiving required completion, so
  // already-stored abandoned plans stop showing up without a migration.
  return entries.filter((e) => e.total > 0 && e.completed + e.skipped === e.total);
};

// Snapshots a plan into Level History before it's replaced or removed — but
// only if it was actually finished. An abandoned/untouched plan isn't a real
// record of anything, so it's dropped rather than logged as noise.
const archiveLevel = async (plan: LearningPlanData): Promise<void> => {
  if (!isPlanComplete(plan)) return;

  const history = await getLevelHistory();
  const entry: LevelHistoryEntry = {
    hobby: plan.hobby,
    hobbyIcon: plan.hobbyIcon,
    level: plan.level,
    completed: plan.techniques.filter((t) => t.status === 'completed').length,
    skipped: plan.techniques.filter((t) => t.status === 'skipped').length,
    total: plan.techniques.length,
    endedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEYS.LEVEL_HISTORY, JSON.stringify([...history, entry]));
};

export const getLearningPlans = async (): Promise<LearningPlanData[]> => {
  const data = await AsyncStorage.getItem(KEYS.LEARNING_PLANS);
  return data ? JSON.parse(data) : [];
};

export const getLearningPlanById = async (
  planId: string
): Promise<LearningPlanData | null> => {
  const plans = await getLearningPlans();
  return plans.find((p) => p.id === planId) || null;
};

const saveLearningPlans = async (plans: LearningPlanData[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.LEARNING_PLANS, JSON.stringify(plans));
};

// Adds a new plan as a concurrent hobby, or replaces the existing plan for
// that same hobby if one is already active (leveling up, or regenerating).
export const upsertLearningPlan = async (
  plan: LearningPlanData
): Promise<LearningPlanData[]> => {
  const plans = await getLearningPlans();
  const existingIndex = plans.findIndex(
    (p) => p.hobby.toLowerCase() === plan.hobby.toLowerCase()
  );

  if (existingIndex >= 0) {
    const existing = plans[existingIndex];
    if (existing.id !== plan.id) {
      await archiveLevel(existing);
    }
    plans[existingIndex] = plan;
  } else {
    plans.push(plan);
  }

  await saveLearningPlans(plans);
  return plans;
};

export const removeLearningPlan = async (
  planId: string
): Promise<LearningPlanData[]> => {
  const plans = await getLearningPlans();
  const target = plans.find((p) => p.id === planId);
  if (target) {
    await archiveLevel(target);
  }

  const updated = plans.filter((p) => p.id !== planId);
  await saveLearningPlans(updated);
  return updated;
};

export const updateTechnique = async (
  planId: string,
  techniqueId: string,
  updates: Partial<Technique>
): Promise<LearningPlanData | null> => {
  const plans = await getLearningPlans();
  const index = plans.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const plan = { ...plans[index] };
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

  plans[index] = plan;
  await saveLearningPlans(plans);
  return plan;
};

export const replaceTechnique = async (
  planId: string,
  oldTechniqueId: string,
  newTechnique: Technique
): Promise<LearningPlanData | null> => {
  const plans = await getLearningPlans();
  const index = plans.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const plan = { ...plans[index] };
  plan.techniques = plan.techniques.map((t) =>
    t.id === oldTechniqueId
      ? { ...newTechnique, id: t.id, order: t.order, status: t.status }
      : t
  );

  plans[index] = plan;
  await saveLearningPlans(plans);
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

export const getMasteredHobbies = async (): Promise<MasteredHobby[]> => {
  const data = await AsyncStorage.getItem(KEYS.MASTERED_HOBBIES);
  return data ? JSON.parse(data) : [];
};

export const addMasteredHobby = async (
  entry: MasteredHobby
): Promise<MasteredHobby[]> => {
  const existing = await getMasteredHobbies();
  if (existing.some((h) => h.hobby.toLowerCase() === entry.hobby.toLowerCase())) {
    return existing;
  }

  const updated = [...existing, entry];
  await AsyncStorage.setItem(KEYS.MASTERED_HOBBIES, JSON.stringify(updated));
  return updated;
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
  await AsyncStorage.removeItem(KEYS.LEARNING_PLANS);
  await AsyncStorage.removeItem(KEYS.STREAK);
};
