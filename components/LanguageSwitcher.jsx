import React, { useState, useMemo } from 'react'; // Added useMemo
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Globe } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LANGUAGES } from '../constants/languages';

export function LanguageSwitcher() {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, setLanguage } = useLanguage();
  const { colors } = useTheme();

  // 1. Create a sorted and augmented list of languages
  const sortedLanguages = useMemo(() => {
    return [...LANGUAGES].sort((a, b) => a.name.localeCompare(b.name));
  }, [LANGUAGES]);

  // Use the initials of the current language code instead of flag
  const currentLangCodeDisplay = currentLanguage.toUpperCase();

  const handleLanguageSelect = async (languageCode) => {
    await setLanguage(languageCode);
    setIsVisible(false);
  };

  const renderLanguageInitials = (code) => {
    // Helper function to render the initials
    return code.toUpperCase();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.surface }]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Globe size={20} color={colors.primary} />
        {/* Changed from currentLang?.flag to language initials */}
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {currentLangCodeDisplay}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Language
            </Text>
            <FlatList
              // Use the new sorted array
              data={sortedLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === currentLanguage && {
                      backgroundColor: colors.primary + '20',
                    },
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  {/* Changed from item.flag to language initials */}
                  <View
                    style={[
                      styles.initialsContainer,
                      {
                        borderColor:
                          item.code === currentLanguage
                            ? colors.primary
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.initials,
                        {
                          color:
                            item.code === currentLanguage
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {renderLanguageInitials(item.code)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.languageName,
                      {
                        color:
                          item.code === currentLanguage
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Updated and added styles for the initials
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    marginLeft: 8, // Increased margin for better spacing with initials
    fontSize: 14, // Adjusted size to better fit initials
    fontWeight: 'bold', // Added bold for better visibility
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    maxHeight: '70%',
    width: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  // NEW STYLES for Initials display
  initialsContainer: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Removed old 'flag' style as it's no longer used for emojis
  languageName: {
    fontSize: 16,
    flex: 1, // Added flex to push name to the left
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
