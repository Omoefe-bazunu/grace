import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import apiClient from '../../utils/api'; // Ensure correct path to your api.js

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  // 0 = Enter Email, 1 = Enter Code & New Password
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- STEP 1: Request OTP ---
  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Call Backend
      await apiClient.requestPasswordReset(email.trim());

      Alert.alert(
        'Success',
        'If an account exists, a reset code has been sent.'
      );
      setStep(1); // Move to next step
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Verify & Change Password ---
  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter the code and your new password');
      return;
    }

    setIsLoading(true);
    try {
      // Call Backend
      await apiClient.confirmPasswordReset(
        email.trim(),
        otp.trim(),
        newPassword
      );

      Alert.alert('Success', 'Your password has been reset!', [
        { text: 'Login', onPress: () => router.back() }, // Go back to Login
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Shapes */}
      <View style={styles.topLeftCurve} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 0
            ? 'Enter your email to receive a reset code.'
            : `Enter the 6-digit code sent to ${email}`}
        </Text>

        <View style={styles.form}>
          {step === 0 ? (
            // --- STEP 0: Email Input ---
            <>
              <Text style={styles.inputLabel}>Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                style={styles.inputField}
                placeholderTextColor="#888"
              />
              <Button
                title={isLoading ? 'Sending...' : 'Send Code'}
                onPress={handleRequestCode}
                disabled={isLoading}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
            </>
          ) : (
            // --- STEP 1: Code + New Password Input ---
            <>
              <Text style={styles.inputLabel}>Reset Code</Text>
              <Input
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholder="Ex: 123456"
                style={styles.inputField}
                placeholderTextColor="#888"
                maxLength={6}
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Enter new password"
                style={styles.inputField}
                placeholderTextColor="#888"
              />

              <Button
                title={isLoading ? 'Updating...' : 'Reset Password'}
                onPress={handleResetPassword}
                disabled={isLoading}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />

              <TouchableOpacity
                onPress={() => setStep(0)}
                style={styles.linkButton}
                disabled={isLoading}
              >
                <Text style={styles.linkText}>Wrong email? Go back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d326f',
  },
  topLeftCurve: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center', // Better readability
    width: 300,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 55,
    paddingHorizontal: 20,
    marginBottom: 16,
    width: 300,
    fontSize: 16,
    color: '#333333',
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: '#ffc700',
    borderRadius: 30,
    height: 55,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#ffc700',
    fontWeight: '600',
  },
});
