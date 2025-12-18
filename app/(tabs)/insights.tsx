import { useMemo, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';

type TimeRangeKey =
  | 'today'
  | '3d'
  | '7d'
  | '14d'
  | '21d'
  | '30d'
  | '90d';

const TIME_RANGES: { key: TimeRangeKey; label: string; days: number }[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '3d', label: 'Last 3 days', days: 3 },
  { key: '7d', label: 'Last Week', days: 7 },
  { key: '14d', label: 'Last 2 Weeks', days: 14 },
  { key: '21d', label: 'Last 3 Weeks', days: 21 },
  { key: '30d', label: 'Last Month', days: 30 },
  { key: '90d', label: 'Last 3 Months', days: 90 },
];

export default function InsightsScreen() {
  const { today, history, goals, longTerm, recommendations } = useHealthData();
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>('7d');
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  const allDays = useMemo(() => [today, ...history], [today, history]);

  const rangeConfig = TIME_RANGES.find((r) => r.key === selectedRange) ?? TIME_RANGES[2];

  const rangeDays = useMemo(() => {
    const take = rangeConfig.days;
    return allDays.slice(0, take);
  }, [allDays, rangeConfig.days]);

  const rangeStats = useMemo(() => {
    const days = rangeDays.length ? rangeDays : [today];
    const avg = (key: 'steps' | 'sleep' | 'water' | 'calories' | 'activity') =>
      days.reduce((sum, d) => sum + (d[key] || 0), 0) / (days.length || 1);

    const avgSleep = parseFloat(avg('sleep').toFixed(1));
    const avgSteps = Math.round(avg('steps'));
    const avgWater = Math.round(avg('water'));
    const avgActivity = Math.round(avg('activity'));

    // Estimate "heart rate trend" from blood pressure numbers if present
    const parseBP = (bp: string) => {
      const [sys, dia] = bp.split('/').map((n) => parseInt(n, 10));
      return { sys: sys || 0, dia: dia || 0 };
    };
    const bpValues = days.map((d) => parseBP(d.bloodPressure));
    const avgSys =
      bpValues.reduce((sum, v) => sum + v.sys, 0) / (bpValues.length || 1);
    const avgDia =
      bpValues.reduce((sum, v) => sum + v.dia, 0) / (bpValues.length || 1);

    return {
      avgSleep,
      avgSteps,
      avgWater,
      avgActivity,
      avgSys: Math.round(avgSys),
      avgDia: Math.round(avgDia),
    };
  }, [rangeDays, today]);

  const sleepStreak = useMemo(() => {
    let streak = 0;
    for (const day of allDays) {
      if (day.sleep >= goals.sleep) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [allDays, goals.sleep]);

  const aiGoalSummary = useMemo(() => {
    const notes: string[] = [];
    if (rangeStats.avgSleep < goals.sleep) {
      notes.push(
        `Your average sleep (${rangeStats.avgSleep}h) is below your goal of ${goals.sleep}h. Consider setting a realistic bedtime for the upcoming week.`,
      );
    } else {
      notes.push(
        `Your sleep is on track at about ${rangeStats.avgSleep}h per night. Keep this consistent over the next week.`,
      );
    }

    if (rangeStats.avgSteps < goals.steps) {
      notes.push(
        `Steps are averaging ${rangeStats.avgSteps.toLocaleString()} vs your goal of ${goals.steps.toLocaleString()}. A small increase in daily walks could close this gap.`,
      );
    } else {
      notes.push(
        `Great job meeting your step target with an average of ${rangeStats.avgSteps.toLocaleString()} steps.`,
      );
    }

    if (rangeStats.avgWater < goals.water) {
      notes.push(
        `Water intake is slightly low at ~${rangeStats.avgWater} oz (goal ${goals.water} oz). Try scheduling water breaks through the day.`,
      );
    } else {
      notes.push(
        `Hydration looks strong with ~${rangeStats.avgWater} oz per day.`,
      );
    }

    return notes;
  }, [goals.sleep, goals.steps, goals.water, rangeStats]);

  const rangeLabel = rangeConfig.label === 'Last Week' ? 'This Week' : rangeConfig.label;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="defaultSemiBold" lightColor="#111827">
            HealthSync360
          </ThemedText>
          <ThemedText type="title" style={styles.headerTitle} lightColor="#111827">
            Insights
          </ThemedText>
        </View>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            activeOpacity={0.8}
            onPress={() => setShowRangeMenu((v) => !v)}
          >
            <ThemedText lightColor="#111827" style={styles.dropdownLabel}>
              {rangeLabel}
            </ThemedText>
            <ThemedText lightColor="#6b7280" style={styles.dropdownChevron}>
              ▾
            </ThemedText>
          </TouchableOpacity>
          {showRangeMenu && (
            <ThemedView style={styles.dropdownMenu}>
              {TIME_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.key}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedRange(range.key);
                    setShowRangeMenu(false);
                  }}
                >
                  <ThemedText
                    lightColor={
                      range.key === selectedRange ? '#2563eb' : '#111827'
                    }
                    style={[
                      styles.dropdownItemText,
                      range.key === selectedRange && { fontWeight: '700' },
                    ]}
                  >
                    {range.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          )}
        </View>
      </View>

      {/* Hero card – top of Insights_top.png */}
      <ThemedView style={styles.heroCard}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.heroTitle}
          lightColor="#ffffff"
        >
          Great Progress!
        </ThemedText>
        <ThemedText style={styles.heroSubtitle} lightColor="#e5f2ff">
          You’ve been improving steadily for {rangeLabel.toLowerCase()}.
        </ThemedText>
        <View style={styles.heroPill}>
          <ThemedText style={styles.heroPillText} lightColor="#0f172a">
            {sleepStreak > 0 ? `${sleepStreak} day sleep streak` : 'Start a new sleep streak'}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Metric cards (Sleep, Steps, Heart, Water) */}
      <View style={styles.metricRow}>
        <ThemedView style={styles.metricCard}>
          <ThemedText lightColor="#6b7280" style={styles.metricLabel}>
            Sleep Quality
          </ThemedText>
          <ThemedText type="title" lightColor="#111827" style={styles.metricValue}>
            {rangeStats.avgSleep} hrs
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.metricCard}>
          <ThemedText lightColor="#6b7280" style={styles.metricLabel}>
            Daily Steps
          </ThemedText>
          <ThemedText type="title" lightColor="#111827" style={styles.metricValue}>
            {rangeStats.avgSteps.toLocaleString()}
          </ThemedText>
        </ThemedView>
      </View>
      <View style={styles.metricRow}>
        <ThemedView style={styles.metricCard}>
          <ThemedText lightColor="#6b7280" style={styles.metricLabel}>
            Blood Pressure
          </ThemedText>
          <ThemedText type="title" lightColor="#111827" style={styles.metricValue}>
            {rangeStats.avgSys}/{rangeStats.avgDia}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.metricCard}>
          <ThemedText lightColor="#6b7280" style={styles.metricLabel}>
            Water Intake
          </ThemedText>
          <ThemedText type="title" lightColor="#111827" style={styles.metricValue}>
            {rangeStats.avgWater} oz
          </ThemedText>
        </ThemedView>
      </View>

      {/* Sleep duration chart (simplified) */}
      <ThemedView style={styles.chartCard}>
        <ThemedText type="subtitle" lightColor="#111827" style={styles.sectionTitle}>
          Sleep Duration
        </ThemedText>
        <View style={styles.chartArea}>
          {rangeDays
            .slice()
            .reverse()
            .map((d) => {
              const height = Math.max(4, Math.min(100, (d.sleep / (goals.sleep || 8)) * 100));
              return (
                <View key={d.date} style={styles.chartBarWrapper}>
                  <View style={[styles.chartBar, { height: `${height}%` }]} />
                  <ThemedText style={styles.chartLabel} lightColor="#9ca3af">
                    {new Date(d.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                    })}
                  </ThemedText>
                </View>
              );
            })}
        </View>
      </ThemedView>

      {/* Blood pressure trend – bottom of Insights_bottom.png */}
      <ThemedView style={styles.chartCard}>
        <ThemedText type="subtitle" lightColor="#111827" style={styles.sectionTitle}>
          Blood Pressure
        </ThemedText>
        <View style={styles.bpSummaryRow}>
          <ThemedText lightColor="#ef4444" style={styles.bpSummaryText}>
            Avg systolic: {rangeStats.avgSys}
          </ThemedText>
          <ThemedText lightColor="#3b82f6" style={styles.bpSummaryText}>
            Avg diastolic: {rangeStats.avgDia}
          </ThemedText>
        </View>
        <Image
          source={require('../../assets/images/Insights_bottom.png')}
          style={styles.bpImage}
          resizeMode="cover"
        />
      </ThemedView>

      {/* Health insights carousel */}
      <ThemedView style={styles.healthInsightsCard}>
        <ThemedText type="subtitle" lightColor="#111827" style={styles.sectionTitle}>
          Health Insights
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsRow}
        >
          <ThemedView style={styles.insightPill}>
            <ThemedText type="defaultSemiBold" lightColor="#111827">
              Sleep Pattern
            </ThemedText>
            <ThemedText lightColor="#6b7280" style={styles.insightText}>
              {aiGoalSummary[0]}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.insightPill}>
            <ThemedText type="defaultSemiBold" lightColor="#111827">
              Activity
            </ThemedText>
            <ThemedText lightColor="#6b7280" style={styles.insightText}>
              {aiGoalSummary[1] ?? recommendations[0]}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.insightPill}>
            <ThemedText type="defaultSemiBold" lightColor="#111827">
              Hydration
            </ThemedText>
            <ThemedText lightColor="#6b7280" style={styles.insightText}>
              {aiGoalSummary[2] ?? recommendations[1]}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      {/* Your Goals + Update Health Plan */}
      <ThemedView style={styles.goalsCard}>
        <ThemedText type="subtitle" lightColor="#111827" style={styles.sectionTitle}>
          Your Goals
        </ThemedText>
        <View style={styles.goalCircleRow}>
          <View style={styles.goalCircleWrapper}>
            <View style={styles.goalCircle}>
              <ThemedText type="defaultSemiBold" lightColor="#111827">
                {rangeStats.avgActivity}%
              </ThemedText>
            </View>
            <ThemedText style={styles.goalLabel} lightColor="#6b7280">
              Activity
            </ThemedText>
            <ThemedText style={styles.goalSub} lightColor="#9ca3af">
              Daily move target
            </ThemedText>
          </View>

          <View style={styles.goalCircleWrapper}>
            <View style={styles.goalCircle}>
              <ThemedText type="defaultSemiBold" lightColor="#111827">
                {Math.round((rangeStats.avgSleep / goals.sleep) * 100) || 0}%
              </ThemedText>
            </View>
            <ThemedText style={styles.goalLabel} lightColor="#6b7280">
              Sleep
            </ThemedText>
            <ThemedText style={styles.goalSub} lightColor="#9ca3af">
              {goals.sleep} hours
            </ThemedText>
          </View>

          <View style={styles.goalCircleWrapper}>
            <View style={styles.goalCircle}>
              <ThemedText type="defaultSemiBold" lightColor="#111827">
                {Math.round((rangeStats.avgWater / goals.water) * 100) || 0}%
              </ThemedText>
            </View>
            <ThemedText style={styles.goalLabel} lightColor="#6b7280">
              Water
            </ThemedText>
            <ThemedText style={styles.goalSub} lightColor="#9ca3af">
              {goals.water} oz
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.9}
          onPress={() => {
            // Open the Health Plan modal where the user can set goals for the upcoming week.
            // This uses the existing `/modal` route.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { router } = require('expo-router');
            router.push('/modal');
          }}
        >
          <ThemedText style={styles.updateButtonText} lightColor="#ffffff">
            Update Health Plan
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: 2,
    fontWeight: '800',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownChevron: {
    fontSize: 12,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 190,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 20,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 13,
  },
  heroCard: {
    marginTop: 16,
    backgroundColor: '#3fb1ff',
    borderRadius: 22,
    padding: 20,
    gap: 8,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  heroPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chartCard: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '800',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 12,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: 14,
    borderRadius: 999,
    backgroundColor: '#3fb1ff',
  },
  chartLabel: {
    marginTop: 6,
    fontSize: 11,
  },
  bpSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bpSummaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bpImage: {
    marginTop: 12,
    width: '100%',
    height: 140,
    borderRadius: 16,
  },
  healthInsightsCard: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  insightPill: {
    width: 220,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  goalsCard: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  goalCircleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  goalCircleWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  goalCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#3fb1ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  updateButton: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

