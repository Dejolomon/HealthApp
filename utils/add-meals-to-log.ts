import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'healthapp:metrics:v1';

type DaySummary = {
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
 * Add meals to today's meal log
 * Meals: Hummus with Veggies (180 cal) and Apple with Almond Butter (220 cal)
 */
export async function addMealsToLog(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!raw) {
      throw new Error('No health data found. Please initialize the app first.');
    }

    const data: MetricsState = JSON.parse(raw);
    const today = data.today;
    const todayKey = new Date().toISOString().slice(0, 10);

    // Check if today's date matches
    if (today.date !== todayKey) {
      throw new Error('Date mismatch. Please ensure you are logging meals for today.');
    }

    // Meal calories:
    // - Hummus with Veggies: 180 calories
    // - Apple with Almond Butter: 220 calories
    // Total: 400 calories
    const totalCaloriesToAdd = 180 + 220;

    // Update today's calories
    const updatedToday: DaySummary = {
      ...today,
      calories: today.calories + totalCaloriesToAdd,
    };

    // Save updated data
    const updatedData: MetricsState = {
      ...data,
      today: updatedToday,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    return Promise.resolve();
  } catch (error) {
    throw error;
  }
}

