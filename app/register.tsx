import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DateOfBirthPicker } from '@/components/date-of-birth-picker';
import { AddressPicker } from '@/components/address-picker';
import { HeightPicker } from '@/components/height-picker';
import { Colors } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';

export default function RegisterScreen() {
  const { saveProfile } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    age: '',
    height: 70, // Default height in inches (5'10")
    weight: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return false;
    }
    const age = calculateAge(formData.dateOfBirth);
    if (age === null || age < 0) {
      Alert.alert('Error', 'Please enter a valid date of birth');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!formData.height || formData.height <= 0) {
      Alert.alert('Error', 'Please enter your height');
      return false;
    }
    if (!formData.weight || parseFloat(formData.weight.toString()) <= 0) {
      Alert.alert('Error', 'Please enter your weight');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Save profile data
      const height = typeof formData.height === 'number' ? formData.height : parseFloat(formData.height.toString()) || 70;
      const weight = parseFloat(formData.weight.toString()) || 165;
      
      await saveProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        address: formData.address.trim(),
        height: height,
        weight: weight,
        profilePhoto: '',
        theme: 'blue',
      });

      // TODO: Implement actual registration/auth logic (save password, etc.)
      // For now, this is a placeholder for the authentication part
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Welcome to Health Sync 360!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Registration Failed', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1f2e" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
            Create Account
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle} lightColor="#4a5568">
            Sign up to get started with Health Sync 360
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1a1f2e">
              Full Name
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8b95a7"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1a1f2e">
              Email
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8b95a7"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1a1f2e">
              Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password (min. 8 characters)"
                placeholderTextColor="#8b95a7"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#4a5568"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1a1f2e">
              Confirm Password
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#8b95a7"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#4a5568"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <DateOfBirthPicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(value) => {
                handleInputChange('dateOfBirth', value);
                // Auto-calculate age when date of birth changes
                const age = calculateAge(value);
                if (age !== null && age >= 0) {
                  handleInputChange('age', age.toString());
                } else {
                  handleInputChange('age', '');
                }
              }}
            />
            {formData.age && (
              <ThemedText type="default" style={styles.helperText} lightColor="#4a5568">
                Age: {formData.age} years old
              </ThemedText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <HeightPicker
              label="Height"
              value={typeof formData.height === 'number' ? formData.height : parseFloat(formData.height.toString()) || 70}
              onChange={(value) => handleInputChange('height', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1a1f2e">
              Weight
            </ThemedText>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                placeholder="Enter your weight"
                placeholderTextColor="#8b95a7"
                value={formData.weight.toString()}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="decimal-pad"
              />
              <ThemedText style={styles.weightUnit} lightColor="#4a5568">
                lbs
              </ThemedText>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <AddressPicker
              label="Address"
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <ThemedText type="defaultSemiBold" style={styles.registerButtonText} lightColor="#ffffff">
              {loading ? 'Creating Account...' : 'Create Account'}
            </ThemedText>
          </TouchableOpacity>

        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1a1f2e',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1f2e',
  },
  eyeIcon: {
    padding: 15,
  },
  registerButton: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
  },
  addressInput: {
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingRight: 16,
  },
  weightInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1f2e',
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a5568',
  },
});

