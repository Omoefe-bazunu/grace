import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGES } from '../../constants/languages';
import { Button } from '../../components/ui/Button';

export default function LanguageSelectionScreen() {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageSelect = async (languageCode) => {
    await setLanguage(languageCode);
  };

  const handleContinue = () => {
    // ✅ Change: Navigate to Onboarding FIRST so they see the beauty in their language!
    router.replace('/(onboarding)'); // This will lead to the onboarding flow where they can see the app in their chosen language.
  };

  const sortedLanguages = useMemo(() => {
    return [...LANGUAGES].sort((a, b) => a.name.localeCompare(b.name));
  }, [LANGUAGES]);

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === currentLanguage && styles.selectedItem,
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <View
        style={[
          styles.initialsContainer,
          item.code === currentLanguage && styles.selectedInitialsContainer,
        ]}
      >
        <Text
          style={[
            styles.initials,
            item.code === currentLanguage && styles.selectedText,
          ]}
        >
          {item.code.toUpperCase()}
        </Text>
      </View>
      <Text
        style={[
          styles.languageName,
          item.code === currentLanguage && styles.selectedText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>
          Select your preferred language for the best worship experience
        </Text>
      </View>

      <FlatList
        data={sortedLanguages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#EBF4FF',
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  // === NEW STYLES for Initials ===
  initialsContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9CA3AF', // Default border color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  selectedInitialsContainer: {
    borderColor: '#1E3A8A', // Primary color for selected state border
    backgroundColor: '#FFFFFF', // White background for selected state
  },
  initials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  // Removed old 'flag' style
  languageName: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },
  selectedText: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
  footer: {
    padding: 24,
  },
  continueButton: {
    width: '100%',
  },
});
