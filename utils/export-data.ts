import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'healthapp:metrics:v1';

export type DaySummary = {
  date: string;
  bmi: number;
  bloodPressure: string;
  bloodSugar: number;
  steps: number;
  sleep: number;
  weight: number;
  water: number;
  calories: number;
  activity: number;
};

type MetricsState = {
  today: DaySummary;
  history: DaySummary[];
};

/**
 * Export meal log data (calories and related nutrition info)
 */
export async function exportMealLog(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error('No meal log data found. Please log some meals first.');
    }

    const data: MetricsState = JSON.parse(raw);
    const allDays = [data.today, ...(data.history || [])];

    // Format meal log data
    const mealLogData = allDays.map((day) => ({
      date: day.date,
      calories: day.calories,
      water: day.water,
      weight: day.weight,
      bmi: day.bmi,
    }));

    const jsonContent = JSON.stringify(mealLogData, null, 2);
    const fileName = `meal-log-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share Meal Log',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Export exercise log data (steps, activity, and related metrics)
 */
export async function exportExerciseLog(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error('No exercise log data found. Please log some exercises first.');
    }

    const data: MetricsState = JSON.parse(raw);
    const allDays = [data.today, ...(data.history || [])];

    // Format exercise log data
    const exerciseLogData = allDays.map((day) => ({
      date: day.date,
      steps: day.steps,
      activity: day.activity,
      sleep: day.sleep,
      weight: day.weight,
      bmi: day.bmi,
    }));

    const jsonContent = JSON.stringify(exerciseLogData, null, 2);
    const fileName = `exercise-log-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share Exercise Log',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    throw error;
  }
}

