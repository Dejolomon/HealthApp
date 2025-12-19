import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { calculateBMI } from './use-profile';

export type DaySummary = {
  date: string; // ISO date (yyyy-mm-dd)
  bmi: number;
  bloodPressure: string;
  bloodSugar: number;
  steps: number;
  sleep: number; // hours
  weight: number; // lbs
  water: number; // oz
  calories: number; // kcal
  activity: number; // %
};

export type DailyGoals = {
  steps: number;
  water: number;
  sleep: number;
  calories: number;
};

type MetricsState = {
  today: DaySummary;
  history: DaySummary[]; // most recent first, excludes today
};

const STORAGE_KEY = 'healthapp:metrics:v1';
const GOALS_KEY = 'healthapp:goals:v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultDay = (): DaySummary => ({
  date: todayKey(),
  bmi: 23.5,
  bloodPressure: '120/80',
  bloodSugar: 95,
  steps: 5420,
  sleep: 3,
  weight: 165,
  water: 48, // oz - 60% of 80 oz goal
  calories: 1680, // kcal - 76% of 2200 goal
  activity: 68, // percentage
});

const defaultGoals: DailyGoals = {
  steps: 8000,
  water: 80,
  sleep: 7.5,
  calories: 2200,
};

function normalizeHistory(list: DaySummary[]) {
  return list
    .filter((item) => item?.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);
}

async function sendGoalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  } catch {
    // ignore notification errors
  }
}

function evaluateGoalsAndNotify(day: DaySummary, goals: DailyGoals) {
  const ratios = {
    steps: goals.steps ? day.steps / goals.steps : 0,
    water: goals.water ? day.water / goals.water : 0,
    sleep: goals.sleep ? day.sleep / goals.sleep : 0,
    calories: goals.calories ? day.calories / goals.calories : 0,
  };

  const metCount = ['steps', 'water', 'sleep', 'calories'].filter(
    (k) => ratios[k as keyof typeof ratios] >= 1,
  ).length;

  const farOffCount = ['steps', 'water', 'sleep', 'calories'].filter(
    (k) => ratios[k as keyof typeof ratios] < 0.5,
  ).length;

  if (metCount >= 3) {
    void sendGoalNotification(
      'Goals completed 🎉',
      'You hit most of your health goals today. Great work keeping on track!',
    );
  } else if (farOffCount >= 2) {
    void sendGoalNotification(
      "Let's refocus",
      'You were quite far from your goals today. Small changes tomorrow can make a big difference.',
    );
  }
}

export function useHealthData() {
  const [state, setState] = useState<MetricsState>({ today: defaultDay(), history: [] });
  const [goals, setGoals] = useState<DailyGoals>(defaultGoals);

  const save = useCallback(async (next: MetricsState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors for now
    }
  }, []);

  const saveGoals = useCallback(async (next: DailyGoals) => {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors for now
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const rawGoals = await AsyncStorage.getItem(GOALS_KEY);
      const rawProfile = await AsyncStorage.getItem('healthapp:profile:v1');

      if (rawGoals) {
        try {
          setGoals({ ...defaultGoals, ...(JSON.parse(rawGoals) as Partial<DailyGoals>) });
        } catch {
          setGoals(defaultGoals);
        }
      }

      // Sync profile data if available
      let profileData: { weight?: number; bmi?: number } = {};
      if (rawProfile) {
        try {
          const profile = JSON.parse(rawProfile);
          if (profile.weight && profile.height) {
            profileData.weight = profile.weight;
            profileData.bmi = calculateBMI(profile.weight, profile.height);
          }
        } catch {
          // ignore profile parse errors
        }
      }

      if (!raw) {
        // Initialize with profile data if available
        if (profileData.weight && profileData.bmi) {
          const nextToday = { ...defaultDay(), weight: profileData.weight, bmi: profileData.bmi };
          setState({ today: nextToday, history: [] });
          await save({ today: nextToday, history: [] });
        }
        return;
      }

      const parsed = JSON.parse(raw) as MetricsState;
      const storedToday = parsed?.today;
      const history = normalizeHistory(parsed?.history ?? []);

      if (storedToday?.date === todayKey()) {
        // Sync profile data to today if available
        if (profileData.weight && profileData.bmi) {
          const syncedToday = { ...storedToday, weight: profileData.weight, bmi: profileData.bmi };
          setState({ today: syncedToday, history });
          await save({ today: syncedToday, history });
        } else {
          setState({ today: storedToday, history });
        }
        return;
      }

      // move previous "today" into history and start fresh
      const nextToday = {
        ...defaultDay(),
        ...(profileData.weight && profileData.bmi
          ? { weight: profileData.weight, bmi: profileData.bmi }
          : {}),
      };
      const nextHistory = storedToday ? normalizeHistory([storedToday, ...history]) : history;
      const nextState = { today: nextToday, history: nextHistory };
      setState(nextState);
      await save(nextState);
    } catch {
      // ignore load errors for now
    }
  }, [save]);

  const updateToday = useCallback(
    async (patch: Partial<DaySummary>) => {
      setState((prev) => {
        const next: MetricsState = { ...prev, today: { ...prev.today, ...patch } };
        void save(next);
        return next;
      });
    },
    [save],
  );

  const updateGoals = useCallback(
    async (patch: Partial<DailyGoals> | DailyGoals) => {
      setGoals((prev) => {
        const next = 'steps' in patch && 'water' in patch && 'sleep' in patch && 'calories' in patch
          ? (patch as DailyGoals)
          : { ...prev, ...(patch as Partial<DailyGoals>) };
        void saveGoals(next);
        return next;
      });
    },
    [saveGoals],
  );

  const setMetric = useCallback(
    <K extends keyof DaySummary>(key: K, value: DaySummary[K]) =>
      updateToday({ [key]: value } as Partial<DaySummary>),
    [updateToday],
  );

  const addSteps = useCallback(
    (amount: number) => updateToday({ steps: Math.max(0, state.today.steps + amount) }),
    [state.today.steps, updateToday],
  );

  const addWater = useCallback(
    (amount: number) => updateToday({ water: Math.max(0, state.today.water + amount) }),
    [state.today.water, updateToday],
  );

  const addCalories = useCallback(
    (amount: number) => updateToday({ calories: Math.max(0, state.today.calories + amount) }),
    [state.today.calories, updateToday],
  );

  const logDay = useCallback(async () => {
    const completedDay = state.today;
    setState((prev) => {
      const nextHistory = normalizeHistory([prev.today, ...(prev.history ?? [])]);
      const nextState = { today: defaultDay(), history: nextHistory };
      void save(nextState);
      return nextState;
    });
    evaluateGoalsAndNotify(completedDay, goals);
  }, [goals, save, state.today]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (state.today.steps < goals.steps)
      recs.push('Time for a 10-minute walk to boost your steps.');
    if (state.today.water < goals.water)
      recs.push('Drink 2 glasses of water to stay hydrated.');
    if (state.today.sleep < goals.sleep)
      recs.push('Aim for at least 7 hours of sleep tonight.');
    if (state.today.activity < 60)
      recs.push('Add a short stretching or cycling session.');
    if (state.today.bloodSugar > 110)
      recs.push('Take a short walk to help stabilize blood sugar.');
    if (state.today.calories > goals.calories)
      recs.push('Balance calories with a light, protein-rich snack.');
    if (recs.length === 0)
      recs.push("Great job! Keep maintaining today’s healthy rhythm.");
    return recs.slice(0, 4);
  }, [goals.calories, goals.sleep, goals.steps, goals.water, state.today]);

  const weeklyStats = useMemo(() => {
    const days = [state.today, ...state.history].slice(0, 7);
    const avg = (key: keyof DaySummary) =>
      days.reduce((sum, d) => sum + (typeof d[key] === 'number' ? (d[key] as number) : 0), 0) /
      (days.length || 1);
    return {
      avgSteps: Math.round(avg('steps')),
      avgSleep: parseFloat(avg('sleep').toFixed(1)),
      avgWater: Math.round(avg('water')),
    };
  }, [state.history, state.today]);

  const longTerm = useMemo(() => {
    const days = [state.today, ...state.history];
    const last30 = days.slice(0, 30);
    const hydrationDays = last30.filter((d) => d.water >= goals.water).length;
    const activityDays = last30.filter((d) => d.activity >= 60).length;
    const bestSteps =
      last30.reduce((best, day) => (day.steps > (best?.steps ?? 0) ? day : best), last30[0]) ??
      defaultDay();
    const avgWeight =
      last30.reduce((sum, d) => sum + (d.weight || 0), 0) / (last30.length || 1);
    return {
      hydrationScore: Math.round((hydrationDays / (last30.length || 1)) * 100),
      activeDays: activityDays,
      bestStepsDay: bestSteps,
      avgWeight: parseFloat(avgWeight.toFixed(1)),
    };
  }, [goals.water, state.history, state.today]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    today: state.today,
    history: state.history,
    goals,
    updateToday,
    setMetric,
    addSteps,
    addWater,
    addCalories,
    logDay,
    recommendations,
    weeklyStats,
    longTerm,
    updateGoals,
  } as const;
}
