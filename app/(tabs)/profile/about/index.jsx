import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Heart, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopNavigation } from '@/components/TopNavigation';

export default function AboutScreen() {
  const { translations, aboutUsInfo } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <TopNavigation title={translations.about} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.appName}>Grace</Text>
          <Text style={styles.version}>Version {aboutUsInfo.version}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.sectionContent}>{aboutUsInfo.churchMission}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>About Haven</Text>
          </View>
          <Text style={styles.sectionContent}>{aboutUsInfo.content}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <Text style={styles.sectionContent}>
            For support and inquiries, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>{aboutUsInfo.contactEmail}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 God's Kingdom Society. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Towards God's perfect government
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactEmail: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
