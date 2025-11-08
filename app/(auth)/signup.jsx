// app/(auth)/signup.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; // ← New JWT context
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

export default function SignupScreen() {
  const { signup } = useAuth(); // ← From JWT AuthContext
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
      <View style={styles.header}>
        <LanguageSwitcher />
      </View>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Haven</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button
            title={isLoading ? 'Creating...' : 'Sign Up'}
            onPress={handleSignup}
            disabled={isLoading}
            size="large"
          />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>
            Already have account? <Text style={styles.linkText}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: { marginBottom: 24 },
  resendText: { textAlign: 'center', color: '#6B7280' },
  loginText: { textAlign: 'center', color: '#6B7280' },
  linkText: { color: '#1E3A8A', fontWeight: '600' },
});
