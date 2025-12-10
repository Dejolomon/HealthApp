import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Resource = {
  title: string;
  url: string;
  tag: string;
};

const resources: Resource[] = [
  { title: 'CDC Physical Activity Guidelines', url: 'https://www.cdc.gov/physicalactivity/basics/index.htm', tag: 'Activity' },
  { title: 'Hydration 101', url: 'https://www.hsph.harvard.edu/nutritionsource/water/', tag: 'Hydration' },
  { title: 'Sleep Hygiene Tips', url: 'https://www.sleepfoundation.org/sleep-hygiene', tag: 'Sleep' },
  { title: 'Heart Health Basics', url: 'https://www.heart.org/en/healthy-living', tag: 'Heart' },
];

export default function ResourcesScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={{ marginBottom: 8 }} lightColor="#1a1f2e">
        Resources
      </ThemedText>
      <ThemedText style={{ marginBottom: 12 }} lightColor="#1a1f2e">
        Evidence-based links and quick tips to support your daily plan.
      </ThemedText>

      <View style={styles.list}>
        {resources.map((item) => (
          <TouchableOpacity key={item.url} onPress={() => Linking.openURL(item.url)}>
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">{item.title}</ThemedText>
              <ThemedText style={styles.tag} lightColor="#718096">{item.tag}</ThemedText>
              <ThemedText style={styles.link} lightColor="#0369a1">Open</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </View>
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
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tag: {
    color: '#718096',
    fontWeight: '800',
    fontSize: 13,
  },
  link: {
    color: '#0369a1',
    fontWeight: '800',
    fontSize: 15,
  },
});


