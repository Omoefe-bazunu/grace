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

export default function LoginScreen() {
  const { login } = useAuth();
  const { translations } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Error',
        translations.fillAllFields || 'Please fill in all fields'
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim().toLowerCase(), password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert(
          'Error',
          translations.invalidCredentials || 'Invalid email or password'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- New Password Reset Handler ---
  const handleResetPassword = () => {
    // Navigate to your reset password screen
    // Make sure to create this file: app/(auth)/reset-password.tsx
    router.push('/(auth)/reset-password');
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
        {/* "Log in" Title */}
        <Text style={styles.title}>{translations.loginTitle || 'Log in'}</Text>

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

          {/* --- Forgot Password Link --- */}
          <TouchableOpacity
            onPress={handleResetPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>
              {translations.forgotPassword || 'Forgot Password?'}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title={
              isLoading
                ? translations.loading || 'Loading...'
                : translations.login || 'Login'
            }
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/(auth)/signup')}
          disabled={isLoading}
        >
          <Text style={styles.signupText}>
            {translations.dontHaveAccount || "Don't have an account yet?"}{' '}
            <Text style={styles.linkText}>
              {translations.signup || 'Sign Up'}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: height * 0.1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    width: '90%',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 55,
    paddingHorizontal: 20,
    marginBottom: 2,
    width: 300,
    fontSize: 16,
    color: '#333333',
  },
  // --- Forgot Password Styles ---
  forgotPasswordContainer: {
    width: 300, // Matches input width
    alignItems: 'flex-end', // Aligns text to the right
    marginTop: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#ffc700', // Matches your theme yellow/gold
    fontWeight: '600',
    fontSize: 14,
  },
  // -----------------------------
  loginButton: {
    marginTop: 0, // Removed extra margin since forgot password adds spacing
    backgroundColor: '#ffc700',
    borderRadius: 30,
    height: 55,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  linkText: {
    color: '#ffc700',
    fontWeight: '600',
  },
});
