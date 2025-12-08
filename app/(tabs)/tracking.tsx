import React from 'react';
import { Platform, StyleSheet, View, FlatList, Button } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTracking } from '@/hooks/use-tracking';

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function TrackingScreen() {
  const { readings, addSampleReading, clearReadings } = useTracking();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.controls}>
        <Button title="Add Sample Reading" onPress={addSampleReading} />
        <View style={{ width: 12 }} />
        <Button title="Clear" onPress={clearReadings} color="#d9534f" />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Latest</ThemedText>
        {readings.length === 0 ? (
          <ThemedText>No readings yet.</ThemedText>
        ) : (
          <ThemedText type="title">
            {readings[0].heartRate} bpm • {formatNumber(readings[0].steps)} steps
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.historyContainer}>
        <ThemedText type="subtitle">History</ThemedText>
        <FlatList
          data={readings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView style={styles.historyItem}>
              <ThemedText>{new Date(item.timestamp).toLocaleString()}</ThemedText>
              <ThemedText type="defaultSemiBold">{item.heartRate} bpm</ThemedText>
              <ThemedText>{formatNumber(item.steps)} steps</ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={<ThemedText>No history available.</ThemedText>}
        />
      </ThemedView>

      <View style={styles.noteContainer}>
        <ThemedText>
          {Platform.select({
            ios: 'Integrate with HealthKit for live data (future).',
            android: 'Integrate with Google Fit for live data (future).',
            web: 'This uses local storage for sample data.',
          })}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 8,
  },
  historyContainer: {
    flex: 1,
    marginTop: 8,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noteContainer: {
    marginTop: 8,
  },
});
