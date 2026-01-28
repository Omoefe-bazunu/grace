import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ Added Theme Support
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const { translations } = useLanguage();
  const { colors } = useTheme(); // ✅ Access dynamic theme colors

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Error',
        translations.fillAllFields || 'Please fill in all fields',
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
          translations.invalidCredentials || 'Invalid email or password',
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    router.push('/(auth)/reset-password');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    // ✅ Root background follows the theme
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ Title color follows theme */}
        <Text style={[styles.title, { color: colors.text }]}>
          {translations.loginTitle || 'Log in'}
        </Text>

        <View style={styles.form}>
          {/* ✅ Inputs adapt to theme background/text */}
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={translations.enterEmail || 'Email Address'}
            style={[
              styles.inputField,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            placeholderTextColor={colors.textSecondary}
          />

          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={translations.enterPassword || 'Password'}
            style={[
              styles.inputField,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            onPress={handleResetPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text
              style={[styles.forgotPasswordText, { color: colors.primary }]}
            >
              {translations.forgotPassword || 'Forgot Password?'}
            </Text>
          </TouchableOpacity>

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

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Back to Home Screen
            </Text>
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/(auth)/signup')}
          disabled={isLoading}
        >
          <Text style={[styles.signupText, { color: colors.textSecondary }]}>
            {translations.dontHaveAccount || "Don't have an account?"}{' '}
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {translations.signup || 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputField: {
    borderRadius: 15,
    height: 55,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: width * 0.85,
    fontSize: 16,
    // Subtle border for dark mode visibility
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  forgotPasswordContainer: {
    width: width * 0.85,
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#ffc700', // Kept brand yellow
    borderRadius: 15,
    height: 55,
    width: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#0d326f', // Deep blue for high contrast on yellow
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  signupLink: {
    marginTop: 30,
    paddingBottom: 20,
  },
  signupText: {
    fontSize: 15,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: 'bold',
  },
});
