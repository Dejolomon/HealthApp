import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';

export default function ModalScreen() {
  const { goals, updateGoals } = useHealthData();

  const [sleep, setSleep] = useState(goals.sleep.toString());
  const [steps, setSteps] = useState(goals.steps.toString());
  const [water, setWater] = useState(goals.water.toString());
  const [calories, setCalories] = useState(goals.calories.toString());

  const handleSave = async () => {
    const next = {
      sleep: parseFloat(sleep) || goals.sleep,
      steps: parseInt(steps, 10) || goals.steps,
      water: parseInt(water, 10) || goals.water,
      calories: parseInt(calories, 10) || goals.calories,
    };
    await updateGoals(next);
    router.back();
  };

  const Field = ({
    label,
    value,
    onChange,
    unit,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    unit: string;
  }) => (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={`Set ${label.toLowerCase()}`}
        />
        <ThemedText style={styles.unit}>{unit}</ThemedText>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title} lightColor="#111827">
            Update Health Plan
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ThemedText style={styles.subTitle} lightColor="#4b5563">
          Set your goals for the upcoming week. These targets are used to power your
          Insights and recommendations.
        </ThemedText>

        <ThemedView style={styles.card}>
          <Field
            label="Daily Sleep"
            value={sleep}
            onChange={setSleep}
            unit="hours"
          />
          <Field
            label="Daily Steps"
            value={steps}
            onChange={setSteps}
            unit="steps"
          />
          <Field
            label="Water Intake"
            value={water}
            onChange={setWater}
            unit="oz / day"
          />
          <Field
            label="Calories"
            value={calories}
            onChange={setCalories}
            unit="kcal / day"
          />
        </ThemedView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Save Health Plan</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
