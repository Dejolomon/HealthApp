import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';

export default function InsightsScreen() {
  const { today, history, weeklyStats, longTerm, recommendations } = useHealthData();

  const timeline = useMemo(() => {
    // Filter out today from history to avoid duplicate keys
    const filteredHistory = history.filter((item) => item.date !== today.date);
    return [today, ...filteredHistory];
  }, [history, today]);

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.header} lightColor="#1a1f2e">
        Insights & Trends
      </ThemedText>

      <View style={styles.cardRow}>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Hydration score</ThemedText>
          <ThemedText type="title" lightColor="#1a1f2e">{longTerm.hydrationScore}%</ThemedText>
          <ThemedText lightColor="#1a1f2e">{longTerm.activeDays} active days last 30d</ThemedText>
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">Best steps day</ThemedText>
          <ThemedText type="title" lightColor="#1a1f2e">{longTerm.bestStepsDay.steps.toLocaleString()}</ThemedText>
          <ThemedText lightColor="#1a1f2e">{longTerm.bestStepsDay.date}</ThemedText>
        </ThemedView>
      </View>

      <ThemedView style={styles.cardWide}>
        <ThemedText type="subtitle" lightColor="#1a1f2e">Weekly averages</ThemedText>
        <View style={styles.statRow}>
          <ThemedText lightColor="#1a1f2e">Steps</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {weeklyStats.avgSteps.toLocaleString()} / day
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText lightColor="#1a1f2e">Water</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{weeklyStats.avgWater} oz / day</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText lightColor="#1a1f2e">Sleep</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{weeklyStats.avgSleep} hrs</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.cardWide}>
        <ThemedText type="subtitle" lightColor="#1a1f2e">Latest recommendations</ThemedText>
        {recommendations.map((rec) => (
          <ThemedText key={rec} style={styles.recommendation} lightColor="#1a1f2e">
            • {rec}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={[styles.cardWide, { flex: 1 }]}>
        <ThemedText type="subtitle" lightColor="#1a1f2e">History</ThemedText>
        <FlatList
          data={timeline}
          keyExtractor={(item) => item.date}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <ThemedView style={styles.historyItem}>
              <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{item.date}</ThemedText>
              <View style={styles.historyStats}>
                <ThemedText lightColor="#1a1f2e">{item.steps.toLocaleString()} steps</ThemedText>
                <ThemedText lightColor="#1a1f2e">{item.water} oz</ThemedText>
                <ThemedText lightColor="#1a1f2e">{item.sleep} h</ThemedText>
              </View>
              <ThemedText lightColor="#1a1f2e">BP {item.bloodPressure} • {item.weight} lbs</ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={<ThemedText lightColor="#1a1f2e">No history yet.</ThemedText>}
        />
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
  header: {
    marginBottom: 8,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 18,
    borderRadius: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardWide: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  recommendation: {
    color: '#4a5568',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
  },
  historyItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 14,
  },
});


