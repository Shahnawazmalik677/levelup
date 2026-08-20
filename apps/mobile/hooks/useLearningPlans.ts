import { useState, useEffect, useCallback } from 'react';
import { Technique } from '../types';
import {
  LearningPlanData,
  getLearningPlans,
  upsertLearningPlan,
  updateTechnique,
  replaceTechnique,
  removeLearningPlan,
} from '../store/storage';

export const useLearningPlans = () => {
  const [plans, setPlans] = useState<LearningPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getLearningPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load learning plans:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const addPlan = useCallback(async (newPlan: LearningPlanData) => {
    const updated = await upsertLearningPlan(newPlan);
    setPlans(updated);
    return updated;
  }, []);

  const markTechniqueComplete = useCallback(
    async (planId: string, techniqueId: string) => {
      const updated = await updateTechnique(planId, techniqueId, {
        status: 'completed',
        progress: 100,
      });
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      }
      return updated;
    },
    []
  );

  const skipTechnique = useCallback(
    async (planId: string, techniqueId: string) => {
      const updated = await updateTechnique(planId, techniqueId, {
        status: 'skipped',
        progress: 0,
      });
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      }
      return updated;
    },
    []
  );

  const toggleChecklistItem = useCallback(
    async (planId: string, techniqueId: string, itemId: string) => {
      const plan = plans.find((p) => p.id === planId);
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

      const updated = await updateTechnique(planId, techniqueId, {
        practiceChecklist: updatedChecklist,
        progress,
      });

      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      }
      return updated;
    },
    [plans]
  );

  const swapTechnique = useCallback(
    async (planId: string, oldId: string, newTechnique: Technique) => {
      const updated = await replaceTechnique(planId, oldId, newTechnique);
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      }
      return updated;
    },
    []
  );

  const removePlan = useCallback(async (planId: string) => {
    const updated = await removeLearningPlan(planId);
    setPlans(updated);
    return updated;
  }, []);

  return {
    plans,
    loading,
    addPlan,
    markTechniqueComplete,
    skipTechnique,
    toggleChecklistItem,
    swapTechnique,
    removePlan,
    refreshPlans: loadPlans,
  };
};
