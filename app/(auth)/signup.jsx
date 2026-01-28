// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import { router } from 'expo-router';
// import { useAuth } from '../../contexts/AuthContext';
// import { useLanguage } from '../../contexts/LanguageContext';
// import { useTheme } from '../../contexts/ThemeContext'; // ✅ Added Theme support
// import { Input } from '../../components/ui/Input';
// import { Button } from '../../components/ui/Button';
// import { LanguageSwitcher } from '../../components/LanguageSwitcher';

// const { width } = Dimensions.get('window');

// export default function SignupScreen() {
//   const { signup } = useAuth();
//   const { translations } = useLanguage();
//   const { colors } = useTheme(); // ✅ Access dynamic theme colors

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignup = async () => {
//     const trimmedEmail = email.trim().toLowerCase();

//     if (!trimmedEmail || !password || !confirmPassword) {
//       Alert.alert(
//         'Error',
//         translations.fillAllFields || 'Please fill in all fields',
//       );
//       return;
//     }
//     if (password !== confirmPassword) {
//       Alert.alert(
//         'Error',
//         translations.passwordsDontMatch || 'Passwords do not match',
//       );
//       return;
//     }
//     if (password.length < 8) {
//       Alert.alert(
//         'Error',
//         translations.passwordTooShort ||
//           'Password must be at least 8 characters',
//       );
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const success = await signup(trimmedEmail, password);
//       if (success) {
//         router.replace('/(tabs)/home');
//       } else {
//         Alert.alert('Error', 'Signup failed. Try again.');
//       }
//     } catch (err) {
//       console.error('Signup error:', err);
//       Alert.alert('Error', err.message || 'Failed to create account');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     // ✅ Root background now follows the theme
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//     >
//       <View style={styles.languageSwitcherContainer}>
//         <LanguageSwitcher />
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ✅ Title color follows theme */}
//         <Text style={[styles.title, { color: colors.text }]}>
//           {translations.createAccountTitle || 'Create Account'}
//         </Text>

//         <View style={styles.form}>
//           {/* ✅ Inputs adapt to theme background/text */}
//           <Input
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             placeholder={translations.enterEmail || 'Email Address'}
//             style={[
//               styles.inputField,
//               { backgroundColor: colors.card, color: colors.text },
//             ]}
//             placeholderTextColor={colors.textSecondary}
//           />

//           <Input
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             placeholder={translations.enterPassword || 'Password'}
//             style={[
//               styles.inputField,
//               { backgroundColor: colors.card, color: colors.text },
//             ]}
//             placeholderTextColor={colors.textSecondary}
//           />

//           <Input
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             secureTextEntry
//             placeholder={
//               translations.confirmPasswordPlaceholder || 'Confirm Password'
//             }
//             style={[
//               styles.inputField,
//               { backgroundColor: colors.card, color: colors.text },
//             ]}
//             placeholderTextColor={colors.textSecondary}
//           />

//           <Button
//             title={
//               isLoading
//                 ? translations.creating || 'Creating...'
//                 : translations.signup || 'Sign Up'
//             }
//             onPress={handleSignup}
//             disabled={isLoading}
//             style={styles.signupButton}
//             textStyle={styles.signupButtonText}
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.loginLink}
//           onPress={() => router.push('/(auth)/login')}
//           disabled={isLoading}
//         >
//           <Text style={[styles.loginText, { color: colors.textSecondary }]}>
//             {translations.alreadyHaveAccount || 'Already have an account?'}{' '}
//             <Text style={[styles.linkText, { color: colors.primary }]}>
//               {translations.login || 'Log in'}
//             </Text>
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   languageSwitcherContainer: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
//   },
//   content: {
//     flexGrow: 1,
//     paddingHorizontal: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 34,
//     fontWeight: 'bold',
//     marginBottom: 40,
//     textAlign: 'center',
//   },
//   form: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   inputField: {
//     borderRadius: 15,
//     height: 55,
//     paddingHorizontal: 20,
//     marginBottom: 15,
//     width: width * 0.85,
//     fontSize: 16,
//     // Add a subtle border for dark mode visibility
//     borderWidth: 1,
//     borderColor: 'rgba(0,0,0,0.05)',
//   },
//   signupButton: {
//     backgroundColor: '#ffc700', // Kept brand yellow
//     borderRadius: 15,
//     height: 55,
//     width: width * 0.85,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   signupButtonText: {
//     color: '#0d326f', // Deep blue text for contrast on yellow
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   loginLink: {
//     marginTop: 30,
//     paddingBottom: 20,
//   },
//   loginText: {
//     fontSize: 15,
//     textAlign: 'center',
//   },
//   linkText: {
//     fontWeight: 'bold',
//   },
// });
import { Text, View } from 'react-native';
import React, { Component } from 'react';

export class signup extends Component {
  render() {
    return (
      <View>
        <Text>signup</Text>
      </View>
    );
  }
}

export default signup;
