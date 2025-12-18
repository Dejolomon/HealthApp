import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    goals,
    recommendations,
  } = useHealthData();

  const metricData: MetricCardProps[] = [
    { label: 'BMI', value: today.bmi.toFixed(1), helper: 'Healthy range', icon: '🩺' },
    { label: 'Blood Pressure', value: today.bloodPressure, helper: 'Resting', icon: '❤️' },
    { label: 'Blood Sugar', value: `${today.bloodSugar} mg/dL`, helper: 'Fasting', icon: '🩸' },
    { label: 'Steps', value: today.steps.toLocaleString(), helper: 'Today', icon: '👟' },
    { label: 'Sleep', value: `${today.sleep}h`, helper: 'Last night', icon: '😴' },
    { label: 'Weight', value: `${today.weight} lbs`, helper: 'Recent', icon: '⚖️' },
  ];

  const progressData = [
    {
      label: 'Water',
      icon: '💧',
      color: '#4da6ff',
      percent: (today.water / goals.water) * 100,
    },
    {
      label: 'Calories',
      icon: '🍽️',
      color: '#ff914d',
      percent: (today.calories / goals.calories) * 100,
    },
    {
      label: 'Activity',
      icon: '🏃',
      color: '#36c690',
      percent: today.activity,
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <ThemedView style={styles.avatarCircle}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {profile.name.charAt(0)}
          </ThemedText>
        </ThemedView>
        <ThemedText type="defaultSemiBold" style={styles.appTitle} lightColor="#111827">
          Health Sync360
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Image
            source={require('../../assets/images/Gear.png')}
            style={styles.gearIcon}
          />
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.heroCard}>
        <ThemedText type="defaultSemiBold" style={styles.heroGreeting} lightColor="#ffffff">
          Good morning, {profile.name}
        </ThemedText>
        <ThemedText style={styles.heroSub} lightColor="#e7f4ff">
          Your health metrics look great today!
        </ThemedText>
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
        <View style={styles.progressRow}>
          {progressData.map((item) => {
            const clamped = Math.min(Math.max(item.percent, 0), 100);
            return (
              <View key={item.label} style={styles.progressItem}>
                <View style={[styles.progressIcon, { backgroundColor: item.color }]}>
                  <ThemedText style={styles.progressIconText}>{item.icon}</ThemedText>
                </View>
                <ThemedText style={styles.progressLabel} lightColor="#4b5563">
                  {item.label}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.progressPercent} lightColor="#111827">
                  {Math.round(clamped)}%
                </ThemedText>
              </View>
            );
          })}
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '700',
  },
  gearIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  heroCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heroGreeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    color: '#e7f4ff',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressIconText: {
    fontSize: 26,
  },
  progressLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
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
    padding: 10,
    gap: 4,
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
