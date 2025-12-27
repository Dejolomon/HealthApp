import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type MealLogEntry = {
  id: string;
  date: string; // YYYY-MM-DD format
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  notes?: string;
  timestamp: number; // Unix timestamp for sorting
};

const STORAGE_KEY = 'healthapp:meal-logs:v1';

export function useMealLog() {
  const [logs, setLogs] = useState<MealLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MealLogEntry[];
        // Sort by timestamp (newest first)
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(sorted);
      }
    } catch (error) {
      console.error('Error loading meal logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (newLogs: MealLogEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
      setLogs(newLogs);
    } catch (error) {
      console.error('Error saving meal logs:', error);
    }
  }, []);

  const addMealLog = useCallback(
    async (entry: Omit<MealLogEntry, 'id' | 'timestamp'>) => {
      const newEntry: MealLogEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...logs];
      await save(updated);
      return newEntry;
    },
    [logs, save]
  );

  const deleteMealLog = useCallback(
    async (id: string) => {
      const updated = logs.filter((log) => log.id !== id);
      await save(updated);
    },
    [logs, save]
  );

  const getLogsByDate = useCallback(
    (date: string) => {
      return logs.filter((log) => log.date === date);
    },
    [logs]
  );

  const getTotalCaloriesForDate = useCallback(
    (date: string) => {
      const dayLogs = getLogsByDate(date);
      return dayLogs.reduce((total, log) => total + log.calories, 0);
    },
    [getLogsByDate]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    logs,
    loading,
    addMealLog,
    deleteMealLog,
    getLogsByDate,
    getTotalCaloriesForDate,
    refresh: load,
  };
}



