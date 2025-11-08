// app/(auth)/login.jsx
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

export default function LoginScreen() {
  const { login } = useAuth(); // ← From JWT AuthContext
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LanguageSwitcher />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Grace</Text>
        </View>

        <Text style={styles.title}>
          {translations.loginTitle || 'Welcome Back'}
        </Text>

        <View style={styles.form}>
          <Input
            label={translations.email || 'Email'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={translations.enterEmail || 'Enter your email'}
          />

          <Input
            label={translations.password || 'Password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={translations.enterPassword || 'Enter your password'}
          />

          <Button
            title={
              isLoading
                ? translations.loading || 'Loading...'
                : translations.login || 'Login'
            }
            onPress={handleLogin}
            disabled={isLoading}
            size="large"
            style={styles.loginButton}
          />
        </View>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/(auth)/signup')}
          disabled={isLoading}
        >
          <Text style={styles.signupText}>
            {translations.dontHaveAccount || "Don't have an account?"}{' '}
            <Text style={styles.linkText}>
              {translations.signup || 'Sign up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ← Styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 16,
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkText: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});
