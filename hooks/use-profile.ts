import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type UserProfile = {
  name: string;
  height: number; // inches
  weight: number; // lbs
  dateOfBirth?: string;
  address?: string;
  email?: string;
  profilePhoto?: string;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
};

const STORAGE_KEY = 'healthapp:profile:v1';

const defaultProfile: UserProfile = {
  name: 'Alex',
  height: 70, // 5'10"
  weight: 165,
  dateOfBirth: '',
  address: '',
  email: '',
  profilePhoto: '',
  theme: 'blue',
};

// Calculate BMI using Imperial formula: BMI = (weight in pounds × 703) / (height in inches)²
// Formula: BMI = (weight × 703) / (height²)
export function calculateBMI(weight: number, height: number): number {
  if (height <= 0 || weight <= 0) return 0;
  return (weight * 703) / (height * height);
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserProfile>;
        setProfile({ ...defaultProfile, ...parsed });
      }
    } catch {
      // ignore load errors
    }
  }, []);

  const save = useCallback(async (next: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors
    }
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      const next = { ...profile, ...patch };
      setProfile(next);
      await save(next);
    },
    [profile, save]
  );

  const saveProfile = useCallback(
    async (newProfile: UserProfile) => {
      setProfile(newProfile);
      await save(newProfile);
    },
    [save]
  );

  const bmi = useMemo(() => calculateBMI(profile.weight, profile.height), [profile.weight, profile.height]);

  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }, [bmi]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    profile,
    updateProfile,
    saveProfile,
    bmi,
    bmiCategory,
  } as const;
}

