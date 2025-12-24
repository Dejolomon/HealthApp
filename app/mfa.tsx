import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

export default function MFAScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual MFA verification logic
      // For now, this is a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify the code with your backend
      // For demo purposes, any 6-digit code will work
      Alert.alert(
        'Verification Successful',
        'You have been successfully authenticated.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      console.error('MFA verification error:', err);
      Alert.alert('Verification Failed', 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // TODO: Implement resend code logic
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (err) {
      console.error('Resend code error:', err);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1f2e" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={64} color={Colors.light.primary} />
          </View>
          <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
            Two-Factor Authentication
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle} lightColor="#4a5568">
            Enter the 6-digit code sent to your email
          </ThemedText>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <ThemedText type="defaultSemiBold" style={styles.verifyButtonText} lightColor="#ffffff">
            {loading ? 'Verifying...' : 'Verify'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <ThemedText type="default" style={styles.resendText} lightColor="#4a5568">
            Didn't receive the code?{' '}
          </ThemedText>
          <TouchableOpacity onPress={handleResend}>
            <ThemedText type="link" style={styles.resendLink}>
              Resend
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#1a1f2e',
    fontWeight: '600',
  },
  codeInputFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: '#f0fdf4',
  },
  verifyButton: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
  },
});

