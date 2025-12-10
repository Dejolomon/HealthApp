import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { useProfile, calculateBMI } from '@/hooks/use-profile';

function EditableField({
  label,
  value,
  onChange,
  unit,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        {unit && <ThemedText style={styles.unit}>{unit}</ThemedText>}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, saveProfile, bmi, bmiCategory } = useProfile();
  const { today, goals, weeklyStats, setMetric } = useHealthData();
  const [inputs, setInputs] = useState({
    name: profile.name,
    height: profile.height.toString(),
    weight: profile.weight.toString(),
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setInputs({
      name: profile.name,
      height: profile.height.toString(),
      weight: profile.weight.toString(),
    });
    setHasChanges(false);
  }, [profile.name, profile.height, profile.weight]);

  const handleNameChange = (value: string) => {
    setInputs((prev) => ({ ...prev, name: value }));
    setHasChanges(true);
  };

  const handleHeightChange = (value: string) => {
    setInputs((prev) => ({ ...prev, height: value }));
    setHasChanges(true);
  };

  const handleWeightChange = (value: string) => {
    setInputs((prev) => ({ ...prev, weight: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const name = inputs.name.trim() || profile.name;
    const height = parseFloat(inputs.height) || profile.height;
    const weight = parseFloat(inputs.weight) || profile.weight;

    if (height > 0 && weight > 0) {
      const newProfile = { name, height, weight };
      saveProfile(newProfile);
      
      // Update BMI and weight in health data
      const newBMI = calculateBMI(weight, height);
      setMetric('bmi', newBMI);
      setMetric('weight', weight);
      
      setHasChanges(false);
    }
  };

  const heightFeet = Math.floor((parseFloat(inputs.height) || profile.height) / 12);
  const heightInches = Math.round((parseFloat(inputs.height) || profile.height) % 12);
  const previewBMI = calculateBMI(parseFloat(inputs.weight) || profile.weight, parseFloat(inputs.height) || profile.height);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.headerCard}>
        <ThemedText type="title" lightColor="#ffffff">{profile.name}</ThemedText>
        <ThemedText lightColor="#e7f4ff">Your personalized health profile</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Personal Information
        </ThemedText>
        <EditableField
          label="Name"
          value={inputs.name}
          onChange={handleNameChange}
          keyboardType="default"
        />
        <EditableField
          label="Height"
          value={inputs.height}
          onChange={handleHeightChange}
          unit="inches"
          keyboardType="decimal-pad"
        />
        <View style={styles.heightDisplay}>
          <ThemedText style={styles.helperText} lightColor="#718096">
            {heightFeet}'{heightInches}" ({parseFloat(inputs.height) || profile.height} inches)
          </ThemedText>
        </View>
        <EditableField
          label="Weight"
          value={inputs.weight}
          onChange={handleWeightChange}
          unit="lbs"
          keyboardType="decimal-pad"
        />
        {hasChanges && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Body Mass Index (BMI)
        </ThemedText>
        <View style={styles.bmiContainer}>
          <ThemedText type="title" style={styles.bmiValue} lightColor="#1a1f2e">
            {hasChanges ? previewBMI.toFixed(1) : bmi.toFixed(1)}
          </ThemedText>
          <ThemedView style={[styles.bmiBadge, styles[`bmi${(hasChanges ? (previewBMI < 18.5 ? 'Underweight' : previewBMI < 25 ? 'Normal' : previewBMI < 30 ? 'Overweight' : 'Obese') : bmiCategory).replace(' ', '')}`]]}>
            <ThemedText style={styles.bmiCategory}>
              {hasChanges ? (previewBMI < 18.5 ? 'Underweight' : previewBMI < 25 ? 'Normal' : previewBMI < 30 ? 'Overweight' : 'Obese') : bmiCategory}
            </ThemedText>
          </ThemedView>
        </View>
        <ThemedText style={styles.helperText} lightColor="#718096">
          Calculated from your height and weight. BMI ranges: Underweight (&lt;18.5), Normal
          (18.5-24.9), Overweight (25-29.9), Obese (≥30)
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Today's Summary
        </ThemedText>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Steps</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{today.steps.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Water</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{today.water} oz</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Sleep</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{today.sleep} h</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Current Weight</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{today.weight} lbs</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Weekly Averages
        </ThemedText>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Steps</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{weeklyStats.avgSteps.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Water</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{weeklyStats.avgWater} oz</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Sleep</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{weeklyStats.avgSleep} h</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    margintop: 20,
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  headerCard: {
    backgroundColor: '#3fb1ff',
    borderRadius: 20,
    padding: 24,
    gap: 6,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: '#4a5568',
    fontWeight: '800',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
  },
  unit: {
    color: '#718096',
    fontSize: 15,
    fontWeight: '800',
  },
  heightDisplay: {
    marginTop: -2,
  },
  helperText: {
    color: '#718096',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
    lineHeight: 18,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  bmiValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  bmiBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bmiCategory: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  bmiUnderweight: {
    backgroundColor: '#3fb1ff',
  },
  bmiNormal: {
    backgroundColor: '#36c690',
  },
  bmiOverweight: {
    backgroundColor: '#ff914d',
  },
  bmiObese: {
    backgroundColor: '#e74c3c',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#36c690',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#36c690',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
});


