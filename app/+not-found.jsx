import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/ui/AppText';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';

export default function NotFoundScreen() {
  const { translations } = useLanguage();
  const { colors } = useTheme();

  return (
    <SafeAreaWrapper>
      {/* Dynamic Header Title */}
      <Stack.Screen
        options={{ title: translations.notFoundTitle || 'Oops!' }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppText style={[styles.title, { color: colors.text }]}>
          {translations.screenNotExist || "This screen doesn't exist."}
        </AppText>

        <Link href="/" style={styles.link}>
          <AppText style={[styles.linkText, { color: colors.primary }]}>
            {translations.goHome || 'Go to home screen!'}
          </AppText>
        </Link>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
