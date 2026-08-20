import { useState, useEffect, useCallback } from 'react';
import { LevelHistoryEntry, getLevelHistory } from '../store/storage';

export const useLevelHistory = () => {
  const [levelHistory, setLevelHistory] = useState<LevelHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLevelHistory = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getLevelHistory();
      setLevelHistory(data);
    } catch (error) {
      console.error('Failed to load level history:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLevelHistory();
  }, [loadLevelHistory]);

  return {
    levelHistory,
    loading,
    refreshLevelHistory: loadLevelHistory,
  };
};
