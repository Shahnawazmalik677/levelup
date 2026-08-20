import { useState, useEffect, useCallback } from 'react';
import {
  StreakData,
  getStreakData,
  updateStreak as updateStreakStorage,
  incrementTechniquesCompleted,
} from '../store/storage';

export const useStreak = () => {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalXp: 0,
    techniquesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getStreakData();
      setStreak(data);
    } catch (error) {
      console.error('Failed to load streak:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const recordActivity = useCallback(async (xp: number = 10) => {
    const updated = await updateStreakStorage(xp);
    setStreak(updated);
    return updated;
  }, []);

  const recordTechniqueCompletion = useCallback(async () => {
    const updated = await incrementTechniquesCompleted();
    setStreak(updated);
    return updated;
  }, []);

  return {
    streak,
    loading,
    recordActivity,
    recordTechniqueCompletion,
    refreshStreak: loadStreak,
  };
};
