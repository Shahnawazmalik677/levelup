import { useState, useEffect, useCallback } from 'react';
import {
  MasteredHobby,
  getMasteredHobbies,
  addMasteredHobby as addMasteredHobbyStorage,
} from '../store/storage';

export const useMasteredHobbies = () => {
  const [masteredHobbies, setMasteredHobbies] = useState<MasteredHobby[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMasteredHobbies = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getMasteredHobbies();
      setMasteredHobbies(data);
    } catch (error) {
      console.error('Failed to load mastered hobbies:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMasteredHobbies();
  }, [loadMasteredHobbies]);

  const addMasteredHobby = useCallback(async (entry: MasteredHobby) => {
    const updated = await addMasteredHobbyStorage(entry);
    setMasteredHobbies(updated);
    return updated;
  }, []);

  return {
    masteredHobbies,
    loading,
    addMasteredHobby,
    refreshMasteredHobbies: loadMasteredHobbies,
  };
};
