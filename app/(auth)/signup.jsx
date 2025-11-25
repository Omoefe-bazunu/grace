// app/(auth)/signup.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const { signup } = useAuth();
  const { translations } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password || !confirmPassword) {
      Alert.alert(
        'Error',
        translations.fillAllFields || 'Please fill in all fields'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        'Error',
        translations.passwordsDontMatch || 'Passwords do not match'
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        'Error',
        translations.passwordTooShort ||
          'Password must be at least 8 characters'
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(trimmedEmail, password);
      if (success) {
        // You might navigate to a verification screen instead of home
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Signup failed. Try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert('Error', err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Left Curve Placeholder */}
      <View style={styles.topLeftCurve} />

      {/* Language Switcher - Positioned top right */}
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          {translations.createAccountTitle || 'Create Account'}
        </Text>

        <View style={styles.form}>
          {/* Email Input */}
          <Text style={styles.inputLabel}>{translations.email || 'Email'}</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={translations.enterEmail || 'Enter your email'}
            style={styles.inputField}
            placeholderTextColor="#888"
          />

          {/* Password Input */}
          <Text style={styles.inputLabel}>
            {translations.password || 'Password'}
          </Text>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={translations.enterPassword || 'Enter your password'}
            style={styles.inputField}
            placeholderTextColor="#888"
          />

          {/* Confirm Password Input */}
          <Text style={styles.inputLabel}>
            {translations.confirmPassword || 'Confirm Password'}
          </Text>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder={
              translations.confirmPasswordPlaceholder || 'Confirm your password'
            }
            style={styles.inputField}
            placeholderTextColor="#888"
          />

          {/* Sign Up Button */}
          <Button
            title={
              isLoading
                ? translations.creating || 'Creating...'
                : translations.signup || 'Sign Up'
            }
            onPress={handleSignup}
            disabled={isLoading}
            style={styles.signupButton}
            textStyle={styles.signupButtonText}
          />
        </View>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          disabled={isLoading}
        >
          <Text style={styles.loginText}>
            {translations.alreadyHaveAccount || 'Already have account?'}{' '}
            <Text style={styles.linkText}>
              {translations.login || 'Log in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d326f', // Deep blue background
  },
  // --- Top Left Curve ---
  topLeftCurve: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // --- Language Switcher ---
  languageSwitcherContainer: {
    position: 'absolute',
    top: 30,
    right: 30,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  // --- Main Content Area ---
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: height * 0.1,
  },
  // --- Title ---
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    marginBottom: 40,
  },
  // --- Form Elements ---
  form: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF', // White text
    marginBottom: 8,
    textAlign: 'center',
    width: '90%',
  },
  inputField: {
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 30,
    height: 55,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: 300,
    fontSize: 16,
    color: '#333333',
  },
  // --- Sign Up Button ---
  signupButton: {
    marginTop: 10,
    backgroundColor: '#ffc700', // Yellow/Gold background
    borderRadius: 30,
    height: 55,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#333333', // Dark text for contrast on yellow
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- Login Link ---
  loginText: {
    textAlign: 'center',
    color: '#FFFFFF', // White text
    fontSize: 16,
  },
  linkText: {
    color: '#ffc700', // Yellow/Gold link
    fontWeight: '600',
  },
  // Removing unused original styles
  header: { display: 'none' }, // Replaced by absolute positioned switcher
  logoContainer: { display: 'none' },
  appName: { display: 'none' },
  subtitle: { display: 'none' },
  resendText: { display: 'none' },
});
