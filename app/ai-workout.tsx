import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { generateAIWorkoutPlan, isAIConfigured, type AIWorkoutPlan } from '@/utils/ai-service';

export default function AIWorkoutScreen() {
  const [workoutPlan, setWorkoutPlan] = useState<AIWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    duration: '30',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    focus: 'full body',
    equipment: '',
  });

  const handleGenerateWorkout = async () => {
    if (!isAIConfigured()) {
      Alert.alert(
        'AI Not Configured',
        'Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables to use AI workout plans.',
      );
      return;
    }

    setLoading(true);
    try {
      const plan = await generateAIWorkoutPlan({
        duration: parseInt(preferences.duration, 10) || 30,
        difficulty: preferences.difficulty,
        focus: preferences.focus,
        availableEquipment: preferences.equipment
          ? preferences.equipment.split(',').map((e) => e.trim())
          : [],
      });
      setWorkoutPlan(plan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout plan. Please try again.');
      console.error('Workout generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText} lightColor="#2563eb">
            ← Back
          </ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
          AI Workout Generator
        </ThemedText>
        <ThemedText style={styles.subtitle} lightColor="#6b7280">
          Get a personalized workout plan tailored to your goals
        </ThemedText>
      </View>

      <ThemedView style={styles.formCard}>
        <ThemedText type="subtitle" style={styles.formTitle} lightColor="#1a1f2e">
          Your Preferences
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label} lightColor="#4b5563">
            Duration (minutes)
          </ThemedText>
          <TextInput
            style={styles.input}
            value={preferences.duration}
            onChangeText={(text) => setPreferences({ ...preferences, duration: text })}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label} lightColor="#4b5563">
            Difficulty Level
          </ThemedText>
          <View style={styles.buttonRow}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  preferences.difficulty === level && styles.difficultyButtonActive,
                ]}
                onPress={() => setPreferences({ ...preferences, difficulty: level })}
              >
                <ThemedText
                  style={[
                    styles.difficultyButtonText,
                    preferences.difficulty === level && styles.difficultyButtonTextActive,
                  ]}
                  lightColor={preferences.difficulty === level ? '#ffffff' : '#4b5563'}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label} lightColor="#4b5563">
            Focus Area
          </ThemedText>
          <TextInput
            style={styles.input}
            value={preferences.focus}
            onChangeText={(text) => setPreferences({ ...preferences, focus: text })}
            placeholder="e.g., cardio, strength, flexibility, full body"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label} lightColor="#4b5563">
            Available Equipment (comma-separated)
          </ThemedText>
          <TextInput
            style={styles.input}
            value={preferences.equipment}
            onChangeText={(text) => setPreferences({ ...preferences, equipment: text })}
            placeholder="e.g., dumbbells, resistance bands, yoga mat"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateWorkout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.generateButtonText} lightColor="#ffffff">
              🤖 Generate Workout Plan
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      {workoutPlan && (
        <ThemedView style={styles.workoutCard}>
          <ThemedText type="title" style={styles.workoutTitle} lightColor="#1a1f2e">
            {workoutPlan.name}
          </ThemedText>

          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <ThemedText style={styles.metaLabel} lightColor="#6b7280">
                Duration
              </ThemedText>
              <ThemedText style={styles.metaValue} lightColor="#1a1f2e">
                {workoutPlan.duration} min
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <ThemedText style={styles.metaLabel} lightColor="#6b7280">
                Calories
              </ThemedText>
              <ThemedText style={styles.metaValue} lightColor="#1a1f2e">
                ~{workoutPlan.caloriesBurned}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <ThemedText style={styles.metaLabel} lightColor="#6b7280">
                Difficulty
              </ThemedText>
              <ThemedText style={styles.metaValue} lightColor="#1a1f2e">
                {workoutPlan.difficulty}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.focusText} lightColor="#2563eb">
            Focus: {workoutPlan.focus}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.exercisesTitle} lightColor="#1a1f2e">
            Exercises
          </ThemedText>

          {workoutPlan.exercises.map((exercise, index) => (
            <ThemedView key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <ThemedView style={styles.exerciseNumber}>
                  <ThemedText style={styles.exerciseNumberText} lightColor="#ffffff">
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="defaultSemiBold" style={styles.exerciseName} lightColor="#1a1f2e">
                  {exercise.name}
                </ThemedText>
              </View>
              <View style={styles.exerciseDetails}>
                {exercise.sets && exercise.reps && (
                  <ThemedText style={styles.exerciseDetail} lightColor="#6b7280">
                    {exercise.sets} sets × {exercise.reps} reps
                  </ThemedText>
                )}
                {exercise.duration && (
                  <ThemedText style={styles.exerciseDetail} lightColor="#6b7280">
                    {exercise.duration} minutes
                  </ThemedText>
                )}
                {exercise.rest && (
                  <ThemedText style={styles.exerciseDetail} lightColor="#9ca3af">
                    Rest: {exercise.rest}s
                  </ThemedText>
                )}
              </View>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1f2e',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  difficultyButtonTextActive: {
    color: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  focusText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  exerciseItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  exerciseDetails: {
    marginLeft: 44,
    gap: 4,
  },
  exerciseDetail: {
    fontSize: 13,
    fontWeight: '600',
  },
});

