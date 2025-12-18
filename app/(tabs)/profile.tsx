import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { useProfile } from '@/hooks/use-profile';

export default function ProfileScreen() {
  const { profile, bmi, bmiCategory } = useProfile();
  const { today, weeklyStats } = useHealthData();

  const heightFeet = Math.floor(profile.height / 12);
  const heightInches = Math.round(profile.height % 12);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.headerCard}>
        <View style={styles.profilePhotoContainer}>
          {profile.profilePhoto ? (
            <Image source={{ uri: profile.profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <ThemedText style={styles.profilePhotoText} lightColor="#ffffff">
                {profile.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText type="title" style={styles.profileName} lightColor="#ffffff">
          {profile.name}
        </ThemedText>
        <ThemedText style={styles.profileSubtitle} lightColor="#e7f4ff">
          Your personalized health profile
        </ThemedText>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/settings')}
        >
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Personal Information
        </ThemedText>
        <View style={styles.row}>
          <ThemedText lightColor="#4a5568">Name</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {profile.name}
          </ThemedText>
        </View>
        {profile.email && (
          <View style={styles.row}>
            <ThemedText lightColor="#4a5568">Email</ThemedText>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              {profile.email}
            </ThemedText>
          </View>
        )}
        {profile.dateOfBirth && (
          <View style={styles.row}>
            <ThemedText lightColor="#4a5568">Date of Birth</ThemedText>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              {profile.dateOfBirth}
            </ThemedText>
          </View>
        )}
        {profile.address && (
          <View style={styles.row}>
            <ThemedText lightColor="#4a5568">Address</ThemedText>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e" style={styles.addressText}>
              {profile.address}
            </ThemedText>
          </View>
        )}
        <View style={styles.row}>
          <ThemedText lightColor="#4a5568">Height</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {heightFeet}'{heightInches}" ({profile.height} inches)
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#4a5568">Weight</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {profile.weight} lbs
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Body Mass Index (BMI)
        </ThemedText>
        <View style={styles.bmiContainer}>
          <ThemedText type="title" style={styles.bmiValue} lightColor="#1a1f2e">
            {bmi.toFixed(1)}
          </ThemedText>
          <ThemedView style={[styles.bmiBadge, styles[`bmi${bmiCategory.replace(' ', '')}`]]}>
            <ThemedText style={styles.bmiCategory}>
              {bmiCategory}
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
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {today.steps.toLocaleString()}
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Water</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {today.water} oz
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Sleep</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {today.sleep} h
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Current Weight</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {today.weight} lbs
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle} lightColor="#1a1f2e">
          Weekly Averages
        </ThemedText>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Steps</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {weeklyStats.avgSteps.toLocaleString()}
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Water</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {weeklyStats.avgWater} oz
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText lightColor="#1a1f2e">Sleep</ThemedText>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            {weeklyStats.avgSleep} h
          </ThemedText>
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
    marginTop: 20,
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  headerCard: {
    backgroundColor: '#3fb1ff',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    alignItems: 'center',
  },
  profilePhotoContainer: {
    marginBottom: 8,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  profilePhotoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#3fb1ff',
  },
  profileName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  profileSubtitle: {
    color: '#e7f4ff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  editButtonText: {
    color: '#3fb1ff',
    fontWeight: '800',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
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
  helperText: {
    color: '#718096',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
    lineHeight: 18,
  },
});
