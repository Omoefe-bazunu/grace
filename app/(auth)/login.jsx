import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions, // Import Dimensions for dynamic styling
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../../components/ui/Input'; // Assuming Input component is flexible
import { Button } from '../../components/ui/Button'; // Assuming Button component is flexible
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
            style={styles.inputField} // Apply custom style
            placeholderTextColor="#888" // Adjust placeholder text color
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
            style={styles.inputField} // Apply custom style
            placeholderTextColor="#888" // Adjust placeholder text color
          />

          {/* Login Button */}
          <Button
            title={
              isLoading
                ? translations.loading || 'Loading...'
                : translations.login || 'Login'
            }
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton} // Apply custom style
            textStyle={styles.loginButtonText} // Apply custom text style
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
    backgroundColor: '#0d326f', // Deep blue background from the image
  },
  // --- Top Left Curve ---
  topLeftCurve: {
    position: 'absolute',
    top: -50, // Adjust as needed to match the curve's visibility
    left: -50, // Adjust as needed
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
  },
  // --- Language Switcher ---
  languageSwitcherContainer: {
    position: 'absolute',
    top: 30, // Consistent with onboarding skip button
    right: 30, // Consistent with onboarding skip button
    zIndex: 10,
    // Add a slight shadow if desired to make it pop
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
    justifyContent: 'center', // Center content vertically
    // Pushing content down slightly to account for top controls
    paddingTop: height * 0.1,
  },
  // --- Title ---
  title: {
    fontSize: 32, // Larger font size
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    marginBottom: 40, // More space below title
  },
  // --- Form Elements ---
  form: {
    marginBottom: 24,
    width: '100%', // Ensure form takes full width for centering
    alignItems: 'center', // Center input fields and button
  },
  inputLabel: {
    fontSize: 18, // Slightly larger label
    fontWeight: '500',
    color: '#FFFFFF', // White text
    marginBottom: 8, // Space between label and input
    textAlign: 'center',
    width: '90%', // Match input width
  },
  inputField: {
    backgroundColor: '#FFFFFF', // White background for inputs
    borderRadius: 30, // More rounded corners
    height: 55, // Taller input fields
    paddingHorizontal: 20, // More horizontal padding
    marginBottom: 20, // Space between inputs
    width: 300, // Fixed width for inputs to look consistent
    fontSize: 16,
    color: '#333333', // Dark text color for input
  },
  // --- Login Button ---
  loginButton: {
    marginTop: 10, // Adjust margin top
    backgroundColor: '#ffc700', // Yellow/Gold background
    borderRadius: 30, // Rounded corners
    height: 55, // Taller button
    width: '90%', // Match input width
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#333333', // Dark text for contrast on yellow
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- Sign Up Link ---
  signupLink: {
    alignItems: 'center',
    marginTop: 20, // Space above sign up link
  },
  signupText: {
    fontSize: 16,
    color: '#FFFFFF', // White text
  },
  linkText: {
    color: '#ffc700', // Yellow/Gold for the link
    fontWeight: '600',
  },
});
