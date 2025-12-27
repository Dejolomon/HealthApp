import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type ExerciseLogEntry = {
  id: string;
  date: string; // YYYY-MM-DD format
  exerciseType: string;
  duration: number; // minutes
  caloriesBurned: number;
  notes?: string;
  timestamp: number; // Unix timestamp for sorting
};

const STORAGE_KEY = 'healthapp:exercise-logs:v1';

export function useExerciseLog() {
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ExerciseLogEntry[];
        // Sort by timestamp (newest first)
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(sorted);
      }
    } catch (error) {
      console.error('Error loading exercise logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (newLogs: ExerciseLogEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
      setLogs(newLogs);
    } catch (error) {
      console.error('Error saving exercise logs:', error);
    }
  }, []);

  const addExerciseLog = useCallback(
    async (entry: Omit<ExerciseLogEntry, 'id' | 'timestamp'>) => {
      const newEntry: ExerciseLogEntry = {
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

  const deleteExerciseLog = useCallback(
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

  const getTotalCaloriesBurnedForDate = useCallback(
    (date: string) => {
      const dayLogs = getLogsByDate(date);
      return dayLogs.reduce((total, log) => total + log.caloriesBurned, 0);
    },
    [getLogsByDate]
  );

  const getTotalDurationForDate = useCallback(
    (date: string) => {
      const dayLogs = getLogsByDate(date);
      return dayLogs.reduce((total, log) => total + log.duration, 0);
    },
    [getLogsByDate]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    logs,
    loading,
    addExerciseLog,
    deleteExerciseLog,
    getLogsByDate,
    getTotalCaloriesBurnedForDate,
    getTotalDurationForDate,
    refresh: load,
  };
}



