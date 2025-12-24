import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const THEME_PREFERENCE_KEY = 'healthapp:theme-preference:v1';

export type ThemePreference = 'light' | 'dark';

/**
 * Hook to manage theme preference stored in AsyncStorage
 */
export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreference();
  }, []);

  const loadPreference = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        setPreference(stored as ThemePreference);
      }
    } catch {
      // ignore errors, use default
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const savePreference = useCallback(async (newPreference: ThemePreference) => {
    // Update state immediately for instant UI feedback
    setPreference(newPreference);
    // Save to storage asynchronously (non-blocking)
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
    } catch {
      // ignore errors
    }
  }, []);

  return {
    preference,
    setPreference: savePreference,
    isLoaded,
  } as const;
}
