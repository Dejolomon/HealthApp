import React, { useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';

type Task = {
  id: string;
  label: string;
  completed: boolean;
};

export default function PlanScreen() {
  const { today, goals, addSteps, addWater, updateGoals } = useHealthData();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'walk', label: 'Take a 10-minute walk', completed: today.steps >= 2000 },
    { id: 'water', label: 'Drink 2 glasses of water', completed: today.water >= 16 },
    { id: 'stretch', label: '5-minute stretch', completed: today.activity >= 20 },
  ]);

  const completion = useMemo(() => {
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={{ marginBottom: 8 }} lightColor="#1a1f2e">
        Plan for today
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" lightColor="#1a1f2e">Daily goals</ThemedText>
        <View style={styles.goalRow}>
          <View style={{ flex: 1 }}>
            <ThemedText lightColor="#1a1f2e">Steps target</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{goals.steps.toLocaleString()}</ThemedText>
          </View>
          <Switch value={today.steps >= goals.steps} />
        </View>
        <View style={styles.goalRow}>
          <View style={{ flex: 1 }}>
            <ThemedText lightColor="#1a1f2e">Water target</ThemedText>
            <ThemedText type="title" lightColor="#1a1f2e">{goals.water} oz</ThemedText>
          </View>
          <Switch value={today.water >= goals.water} />
        </View>
        <View style={styles.actions}>
          <ThemedText style={styles.link} onPress={() => addSteps(500)} lightColor="#0369a1">
            +500 steps
          </ThemedText>
          <ThemedText style={styles.link} onPress={() => addWater(8)} lightColor="#0369a1">
            +8 oz water
          </ThemedText>
          <ThemedText style={styles.link} onPress={() => updateGoals({ steps: goals.steps + 500 })} lightColor="#0369a1">
            Raise steps goal
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" lightColor="#1a1f2e">Quick tasks</ThemedText>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <Switch value={task.completed} onValueChange={() => toggleTask(task.id)} />
            <ThemedText style={{ flex: 1 }} lightColor="#1a1f2e">{task.label}</ThemedText>
          </View>
        ))}
        <ThemedText lightColor="#1a1f2e">Completed: {completion}%</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  link: {
    color: '#0369a1',
    fontWeight: '800',
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
});


