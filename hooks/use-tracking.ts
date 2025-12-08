import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Reading = {
  id: string;
  heartRate: number;
  steps: number;
  timestamp: string;
};

const STORAGE_KEY = 'healthapp:tracking:readings';

function sampleReading(): Reading {
  const heartRate = 55 + Math.floor(Math.random() * 60);
  const steps = Math.floor(Math.random() * 15000);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    heartRate,
    steps,
    timestamp: new Date().toISOString(),
  };
}

export function useTracking() {
  const [readings, setReadings] = useState<Reading[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Reading[] = JSON.parse(raw);
        setReadings(parsed.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)));
      }
    } catch (e) {
      // ignore for now
    }
  }, []);

  const save = useCallback(async (items: Reading[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, []);

  const addSampleReading = useCallback(async () => {
    const r = sampleReading();
    const newList = [r, ...readings];
    setReadings(newList);
    await save(newList);
  }, [readings, save]);

  const clearReadings = useCallback(async () => {
    setReadings([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { readings, addSampleReading, clearReadings } as const;
}
