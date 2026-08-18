import { useState, useEffect, useCallback } from 'react';
import { Technique } from '../types';
import {
  LearningPlanData,
  getLearningPlan,
  saveLearningPlan,
  updateTechnique,
  replaceTechnique,
  clearLearningPlan,
} from '../store/storage';

export const useLearningPlan = () => {
  const [plan, setPlan] = useState<LearningPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLearningPlan();
      setPlan(data);
    } catch (error) {
      console.error('Failed to load learning plan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const savePlan = useCallback(async (newPlan: LearningPlanData) => {
    await saveLearningPlan(newPlan);
    setPlan(newPlan);
  }, []);

  const markTechniqueComplete = useCallback(async (techniqueId: string) => {
    const updated = await updateTechnique(techniqueId, {
      status: 'completed',
      progress: 100,
    });
    if (updated) setPlan(updated);
    return updated;
  }, []);

  const skipTechnique = useCallback(async (techniqueId: string) => {
    const updated = await updateTechnique(techniqueId, {
      status: 'skipped',
      progress: 0,
    });
    if (updated) setPlan(updated);
    return updated;
  }, []);

  const updateProgress = useCallback(
    async (techniqueId: string, progress: number) => {
      const updated = await updateTechnique(techniqueId, { progress });
      if (updated) setPlan(updated);
      return updated;
    },
    []
  );

  const toggleChecklistItem = useCallback(
    async (techniqueId: string, itemId: string) => {
      if (!plan) return null;

      const technique = plan.techniques.find((t) => t.id === techniqueId);
      if (!technique) return null;

      const updatedChecklist = technique.practiceChecklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      const completedCount = updatedChecklist.filter((i) => i.completed).length;
      const progress = Math.round(
        (completedCount / updatedChecklist.length) * 100
      );

      const updated = await updateTechnique(techniqueId, {
        practiceChecklist: updatedChecklist,
        progress,
      });

      if (updated) setPlan(updated);
      return updated;
    },
    [plan]
  );

  const swapTechnique = useCallback(
    async (oldId: string, newTechnique: Technique) => {
      const updated = await replaceTechnique(oldId, newTechnique);
      if (updated) setPlan(updated);
      return updated;
    },
    []
  );

  const resetPlan = useCallback(async () => {
    await clearLearningPlan();
    setPlan(null);
  }, []);

  return {
    plan,
    loading,
    savePlan,
    markTechniqueComplete,
    skipTechnique,
    updateProgress,
    toggleChecklistItem,
    swapTechnique,
    resetPlan,
    refreshPlan: loadPlan,
  };
};
