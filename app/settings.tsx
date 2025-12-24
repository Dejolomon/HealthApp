import * as Calendar from 'expo-calendar';
import * as ImagePicker from 'expo-image-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { AddressForm } from '@/components/address-form';
import { DatePicker } from '@/components/date-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { calculateBMI, useProfile } from '@/hooks/use-profile';

function EditableField({
  label,
  value,
  onChange,
  unit,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        {unit && <ThemedText style={styles.unit}>{unit}</ThemedText>}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { profile, saveProfile, updateProfile } = useProfile();
  const { setMetric, updateToday } = useHealthData();
  const [inputs, setInputs] = useState({
    name: profile.name,
    height: profile.height.toString(),
    weight: profile.weight.toString(),
    dateOfBirth: profile.dateOfBirth || '',
    address: profile.address || '',
    email: profile.email || '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [photoPermission, setPhotoPermission] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [autoSyncBluetooth, setAutoSyncBluetooth] = useState(false);
  const [autoSyncWifi, setAutoSyncWifi] = useState(false);
  const [samsungConnected, setSamsungConnected] = useState(false);

  useEffect(() => {
    setInputs({
      name: profile.name,
      height: profile.height.toString(),
      weight: profile.weight.toString(),
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      email: profile.email || '',
      theme: profile.theme || 'blue',
    });
    setHasChanges(false);
  }, [profile.name, profile.height, profile.weight, profile.dateOfBirth, profile.address, profile.email, profile.theme]);

  useEffect(() => {
    requestPhotoPermission();
    requestCalendarPermission();
  }, []);

  const requestPhotoPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPhotoPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to select a profile photo.');
      }
    }
  };

  const requestCalendarPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setCalendarPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant calendar access to sync your health events.');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePhotoSelect = async () => {
    if (!photoPermission) {
      await requestPhotoPermission();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        await updateProfile({ profilePhoto: photoUri });
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleSave = async () => {
    const name = inputs.name.trim() || profile.name;
    const height = parseFloat(inputs.height) || profile.height;
    const weight = parseFloat(inputs.weight) || profile.weight;

    if (height > 0 && weight > 0) {
      const newProfile = {
        name,
        height,
        weight,
        dateOfBirth: inputs.dateOfBirth,
        address: inputs.address,
        email: inputs.email,
        profilePhoto: profile.profilePhoto || '',
      };
      await saveProfile(newProfile);

      // Update BMI and weight in health data
      const newBMI = calculateBMI(weight, height);
      setMetric('bmi', newBMI);
      setMetric('weight', weight);

      setHasChanges(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } else {
      Alert.alert('Error', 'Please enter valid height and weight values.');
    }
  };

  const openBluetoothSettings = async () => {
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS
        );
        return;
      }

      if (Platform.OS === 'ios') {
        // iOS does not officially support deep links to Bluetooth,
        // so fall back to the app's settings screen.
        await Linking.openSettings();
        return;
      }
    } catch {
      // ignore errors and fall back to generic settings
    }

    try {
      await Linking.openSettings();
    } catch {
      // ignore if settings cannot be opened
    }
  };

  const openWifiSettings = async () => {
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.WIFI_SETTINGS
        );
        return;
      }

      if (Platform.OS === 'ios') {
        // iOS does not allow direct Wi‑Fi deep links, open app settings instead.
        await Linking.openSettings();
        return;
      }
    } catch {
      // ignore errors and fall back to generic settings
    }

    try {
      await Linking.openSettings();
    } catch {
      // ignore if settings cannot be opened
    }
  };

  const handleBluetoothDevicesPress = async () => {
    await openBluetoothSettings();
    Alert.alert(
      'Bluetooth devices',
      'Once your device is connected, would you like Health Sync 360 to automatically sync health data from compatible Bluetooth devices?',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Yes, enable auto‑sync',
          onPress: () => setAutoSyncBluetooth(true),
        },
      ]
    );
  };

  const handleWifiDevicesPress = async () => {
    await openWifiSettings();
    Alert.alert(
      'Wi‑Fi devices',
      'Once your device is connected to this network, should Health Sync 360 automatically sync health data from compatible Wi‑Fi devices?',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Yes, enable auto‑sync',
          onPress: () => setAutoSyncWifi(true),
        },
      ]
    );
  };

  const handleSamsungHealthConnect = async () => {
    try {
      // Placeholder: call your backend or native Samsung Health integration here.
      // Expected response shape should match a partial DaySummary, for example:
      // { steps: number, sleep: number, water: number, calories: number, activity: number }

      // const response = await fetch('https://your-backend.example.com/sync/samsung-health');
      // if (!response.ok) throw new Error('Sync failed');
      // const latestMetrics = await response.json();
      // await updateToday(latestMetrics);

      setSamsungConnected(true);
      Alert.alert(
        'Samsung Health connected',
        'Samsung Health is now linked. Wire this button to your backend or Samsung Health API to pull real data into Health Sync 360.'
      );
    } catch {
      Alert.alert(
        'Samsung Health',
        'To fully sync Samsung Health data, you need to connect this app to a backend or Samsung Health SDK that returns your latest health metrics.'
      );
    }
  };

  const handleContactSupport = async () => {
    try {
      const email = 'help@HS360.com';
      const mailtoUrl = `mailto:${email}`;
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          'No email application is configured on this device. Please email us at help@HS360.com'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open email application. Please email us at help@HS360.com'
      );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
          Settings
        </ThemedText>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Personal Information
        </ThemedText>
        <TouchableOpacity style={styles.photoSection} onPress={handlePhotoSelect}>
          {profile.profilePhoto ? (
            <Image source={{ uri: profile.profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <ThemedText style={styles.profilePhotoText}>
                {profile.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <ThemedText type="defaultSemiBold" style={styles.photoButtonText} lightColor="#2563eb">
            Change Profile Photo
          </ThemedText>
        </TouchableOpacity>
        <EditableField
          label="Name"
          value={inputs.name}
          onChange={(value) => handleInputChange('name', value)}
          keyboardType="default"
        />
        <EditableField
          label="Email"
          value={inputs.email}
          onChange={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
        />
        <DatePicker
          label="Date of Birth"
          value={inputs.dateOfBirth}
          onChange={(value) => handleInputChange('dateOfBirth', value)}
        />
        <AddressForm
          label="Address"
          value={inputs.address}
          onChange={(value) => handleInputChange('address', value)}
        />
        <EditableField
          label="Height"
          value={inputs.height}
          onChange={(value) => handleInputChange('height', value)}
          unit="inches"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="Weight"
          value={inputs.weight}
          onChange={(value) => handleInputChange('weight', value)}
          unit="lbs"
          keyboardType="decimal-pad"
        />
        {hasChanges && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Connect Your Apps
        </ThemedText>
        <TouchableOpacity style={styles.appItem}>
          <View style={styles.appIconContainer}>
            <ThemedText style={styles.appIcon}>🍎</ThemedText>
          </View>
          <View style={styles.appInfo}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              Apple Health
            </ThemedText>
            <ThemedText style={styles.appSubtitle} lightColor="#718096">
              Sync health & activity data
            </ThemedText>
          </View>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appItem}>
          <View style={styles.appIconContainer}>
            <ThemedText style={styles.appIcon}>❤️</ThemedText>
          </View>
          <View style={styles.appInfo}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              Google Fit
            </ThemedText>
            <ThemedText style={styles.appSubtitle} lightColor="#718096">
              Connect fitness tracking
            </ThemedText>
          </View>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appItem}>
          <View style={styles.appIconContainer}>
            <ThemedText style={styles.appIcon}>⌚</ThemedText>
          </View>
          <View style={styles.appInfo}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              Fitbit
            </ThemedText>
            <ThemedText style={styles.appSubtitle} lightColor="#718096">
              Sync sleep & activity
            </ThemedText>
          </View>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appItem} onPress={handleSamsungHealthConnect}>
          <View style={styles.appIconContainer}>
            <ThemedText style={styles.appIcon}>📱</ThemedText>
          </View>
          <View style={styles.appInfo}>
            <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
              Samsung Health
            </ThemedText>
            <ThemedText style={styles.appSubtitle} lightColor="#718096">
              Sync data from Samsung devices
            </ThemedText>
          </View>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        {samsungConnected && (
          <ThemedText style={styles.connectedLabel} lightColor="#16a34a">
            Samsung Health connection enabled.
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          Smart Devices
        </ThemedText>
        <ThemedText style={styles.deviceDescription} lightColor="#4b5563">
          Connect wearables and home health devices using Bluetooth or your Wi‑Fi network.
        </ThemedText>
        <TouchableOpacity style={styles.settingItem} onPress={handleBluetoothDevicesPress}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            Bluetooth devices
          </ThemedText>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleWifiDevicesPress}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            Wi‑Fi devices
          </ThemedText>
          <ThemedText style={styles.chevron} lightColor="#718096">
            →
          </ThemedText>
        </TouchableOpacity>
        {autoSyncBluetooth && (
          <ThemedText style={styles.autoSyncLabel} lightColor="#16a34a">
            Auto‑sync from Bluetooth devices is enabled.
          </ThemedText>
        )}
        {autoSyncWifi && (
          <ThemedText style={styles.autoSyncLabel} lightColor="#16a34a">
            Auto‑sync from Wi‑Fi devices is enabled.
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <View style={styles.helpHeader}>
          <ThemedText style={styles.helpIcon}>❓</ThemedText>
          <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
            Need Help?
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.helpButton} onPress={handleContactSupport}>
          <ThemedText style={styles.helpButtonText}>Contact Support</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
          About
        </ThemedText>
        <TouchableOpacity style={styles.settingItem}>
          <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
            App Version
          </ThemedText>
          <ThemedText style={styles.version} lightColor="#718096">
            1.0.0
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e40af',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '800',
    fontSize: 18,
    color: '#1e40af',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profilePhotoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2563eb',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  unit: {
    color: '#718096',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  version: {
    fontSize: 14,
    fontWeight: '600',
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    fontSize: 24,
  },
  appInfo: {
    flex: 1,
    gap: 4,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  deviceDescription: {
    fontSize: 13,
    marginBottom: 4,
    color: '#4b5563',
  },
  autoSyncLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  connectedLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  helpIcon: {
    fontSize: 20,
  },
  helpButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
