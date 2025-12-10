import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { useProfile } from '@/hooks/use-profile';

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: string;
};

type ProgressProps = {
  label: string;
  percent: number;
  color: string;
  icon: string;
};

function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <ThemedView style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <ThemedText>{icon}</ThemedText>
      </View>
      <ThemedText type="title" style={styles.metricValue}>
        {value}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.metricLabel}>
        {label}
      </ThemedText>
      {!!helper && <ThemedText style={styles.metricHelper}>{helper}</ThemedText>}
    </ThemedView>
  );
}

function ProgressRow({ label, percent, color, icon }: ProgressProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <ThemedText type="defaultSemiBold">{icon} {label}</ThemedText>
        <ThemedText type="defaultSemiBold">{Math.round(clamped)}%</ThemedText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function RecommendationItem({ text }: { text: string }) {
  return (
    <View style={styles.recommendationItem}>
      <ThemedText style={styles.bullet} lightColor="#1a1f2e">•</ThemedText>
      <ThemedText lightColor="#1a1f2e">{text}</ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  const { profile } = useProfile();
  const {
    today,
    history,
    goals,
    setMetric,
    addSteps,
    addWater,
    addCalories,
    recommendations,
    weeklyStats,
    longTerm,
    updateGoals,
    logDay,
  } = useHealthData();
  const [inputs, setInputs] = useState({ water: '', steps: '', sleep: '', weight: '' });
  const [goalInputs, setGoalInputs] = useState({
    steps: goals.steps.toString(),
    water: goals.water.toString(),
  });

  React.useEffect(() => {
    setGoalInputs({
      steps: goals.steps.toString(),
      water: goals.water.toString(),
    });
  }, [goals.steps, goals.water]);

  const historyPreview = useMemo(() => history.slice(0, 3), [history]);

  const handleNumberChange = (field: 'water' | 'steps' | 'sleep' | 'weight', value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setMetric(field === 'weight' ? 'weight' : field, parsed as never);
    }
  };

  const handleGoalChange = (field: 'steps' | 'water', value: string) => {
    setGoalInputs((prev) => ({ ...prev, [field]: value }));
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      updateGoals({ [field]: parsed });
    }
  };

  const metricData: MetricCardProps[] = [
    { label: 'BMI', value: today.bmi.toFixed(1), helper: 'Healthy range', icon: '🩺' },
    { label: 'Blood Pressure', value: today.bloodPressure, helper: 'Resting', icon: '❤️' },
    { label: 'Blood Sugar', value: `${today.bloodSugar} mg/dL`, helper: 'Fasting', icon: '🩸' },
    { label: 'Steps', value: today.steps.toLocaleString(), helper: 'Today', icon: '👟' },
    { label: 'Sleep', value: `${today.sleep}h`, helper: 'Last night', icon: '😴' },
    { label: 'Weight', value: `${today.weight} lbs`, helper: 'Recent', icon: '⚖️' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.heroCard}>
        <ThemedText type="defaultSemiBold" style={styles.heroGreeting} lightColor="#ffffff">
          Good morning, {profile.name}
        </ThemedText>
        <ThemedText style={styles.heroSub} lightColor="#e7f4ff">Your health metrics look great today!</ThemedText>
      </ThemedView>

      <View style={styles.metricGrid}>
        {metricData.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Today's Progress
        </ThemedText>
        <ProgressRow
          label="Water"
          percent={(today.water / goals.water) * 100}
          color="#4da6ff"
          icon="💧"
        />
        <ProgressRow
          label="Calories"
          percent={(today.calories / goals.calories) * 100}
          color="#ff914d"
          icon="🔥"
        />
        <ProgressRow
          label="Activity"
          percent={today.activity}
          color="#36c690"
          icon="🏃"
        />
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => addWater(8)}>
            <ThemedText style={styles.actionText}>+8oz water</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => addSteps(500)}>
            <ThemedText style={styles.actionText}>+500 steps</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => addCalories(150)}>
            <ThemedText style={styles.actionText}>+150 kcal</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedView style={styles.inputsRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Water (oz)</ThemedText>
            <TextInput
              style={styles.input}
              value={inputs.water}
              onChangeText={(v) => handleNumberChange('water', v)}
              keyboardType="numeric"
              placeholder="Add water"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Steps</ThemedText>
            <TextInput
              style={styles.input}
              value={inputs.steps}
              onChangeText={(v) => handleNumberChange('steps', v)}
              keyboardType="numeric"
              placeholder="Add steps"
            />
          </View>
        </ThemedView>
        <ThemedView style={styles.inputsRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Sleep (h)</ThemedText>
            <TextInput
              style={styles.input}
              value={inputs.sleep}
              onChangeText={(v) => handleNumberChange('sleep', v)}
              keyboardType="decimal-pad"
              placeholder="Last night"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Weight (lbs)</ThemedText>
            <TextInput
              style={styles.input}
              value={inputs.weight}
              onChangeText={(v) => handleNumberChange('weight', v)}
              keyboardType="decimal-pad"
              placeholder="Current"
            />
          </View>
        </ThemedView>
        <View style={styles.goalRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Daily goals</ThemedText>
            <ThemedText style={styles.goalHelper}>
              Used for recommendations and progress bars.
            </ThemedText>
          </View>
          <View style={styles.goalInputs}>
            <TextInput
              style={styles.goalInput}
              value={goalInputs.steps}
              onChangeText={(v) => handleGoalChange('steps', v)}
              keyboardType="numeric"
              placeholder="Steps"
            />
            <TextInput
              style={styles.goalInput}
              value={goalInputs.water}
              onChangeText={(v) => handleGoalChange('water', v)}
              keyboardType="numeric"
              placeholder="Water"
            />
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Recommendations
        </ThemedText>
        {recommendations.map((rec) => (
          <RecommendationItem key={rec} text={rec} />
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Weekly Snapshot
        </ThemedText>
        <View style={styles.snapshotRow}>
          <ThemedView style={styles.snapshotCard}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Avg Steps</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{weeklyStats.avgSteps.toLocaleString()}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.snapshotCard}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Avg Sleep</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{weeklyStats.avgSleep}h</ThemedText>
          </ThemedView>
          <ThemedView style={styles.snapshotCard}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Avg Water</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{weeklyStats.avgWater}oz</ThemedText>
          </ThemedView>
        </View>
        <TouchableOpacity style={styles.logButton} onPress={logDay}>
          <ThemedText style={styles.logButtonText}>Close day & log to history</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Long-term & History
        </ThemedText>
        <View style={styles.snapshotRow}>
          <ThemedView style={styles.snapshotCard}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Best Steps</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">
              {longTerm.bestStepsDay.steps.toLocaleString()}
            </ThemedText>
            <ThemedText lightColor="#1a1f2e">{longTerm.bestStepsDay.date}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.snapshotCard}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Hydration score</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{longTerm.hydrationScore}%</ThemedText>
            <ThemedText lightColor="#1a1f2e">{longTerm.activeDays} active days</ThemedText>
          </ThemedView>
        </View>
        {historyPreview.length === 0 ? (
          <ThemedText lightColor="#1a1f2e">No past days yet. Close a day to start building history.</ThemedText>
        ) : (
          <View style={styles.historyList}>
            {historyPreview.map((day) => (
              <ThemedView key={day.date} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{day.date}</ThemedText>
                  <ThemedText lightColor="#1a1f2e">{day.sleep}h sleep • {day.water}oz water</ThemedText>
                </View>
                <ThemedText type="title" lightColor="#1a1f2e">{day.steps.toLocaleString()}</ThemedText>
              </ThemedView>
            ))}
          </View>
        )}
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
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#3fb1ff',
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroGreeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    color: '#e7f4ff',
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    marginTop: 6,
    fontWeight: '800',
    color: '#1a1f2e',
    fontSize: 20,
  },
  metricLabel: {
    color: '#1a1f2e',
    fontWeight: '700',
    fontSize: 12,
  },
  metricHelper: {
    color: '#4a5568',
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  progressRow: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 12,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  actionText: {
    color: '#0369a1',
    fontWeight: '800',
    fontSize: 14,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  input: {
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
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  goalHelper: {
    color: '#718096',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  goalInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  goalInput: {
    width: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1f2e',
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    marginTop: 2,
    fontWeight: '800',
    fontSize: 18,
    color: '#1a1f2e',
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  snapshotCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  logButton: {
    marginTop: 8,
    backgroundColor: '#36c690',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#36c690',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
});
