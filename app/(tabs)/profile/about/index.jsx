import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  Mail,
  Heart,
  Globe,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { TopNavigation } from '@/components/TopNavigation';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AboutScreen() {
  const { translations, aboutUsInfo } = useLanguage();
  const { colors } = useTheme();

  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContactPress = (type, value) => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'social':
        Linking.openURL(`https://${value}`);
        break;
      default:
        break;
    }
  };

  const renderSection = (key, Icon, title, content) => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleSection(key)}
        style={styles.sectionHeader}
      >
        <Icon size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </TouchableOpacity>
      {expandedSections[key] && (
        <View style={styles.sectionContentContainer}>
          <Text style={[styles.sectionContent, { color: colors.text }]}>
            {content}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaWrapper
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopNavigation showBackButton={true} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: colors.primary }]}>
            God's Kingdom Society
          </Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            Version {aboutUsInfo.version}
          </Text>
        </View>

        {/* Collapsible Sections */}
        {renderSection(
          'mission',
          Heart,
          translations.ourMission || 'Our Mission',
          aboutUsInfo.mission
        )}
        {renderSection(
          'aboutGKS',
          Globe,
          "About God's Kingdom Society",
          aboutUsInfo.content
        )}

        {/* Core Beliefs */}
        {aboutUsInfo.keyBeliefs && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleSection('beliefs')}
              style={styles.sectionHeader}
            >
              <Heart size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Our Core Beliefs
              </Text>
            </TouchableOpacity>
            {expandedSections.beliefs && (
              <View style={styles.sectionContentContainer}>
                {aboutUsInfo.keyBeliefs.map((belief, index) => (
                  <View key={index} style={styles.beliefItem}>
                    <Text style={[styles.bullet, { color: colors.primary }]}>
                      •
                    </Text>
                    <Text style={[styles.beliefText, { color: colors.text }]}>
                      {belief}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleSection('contact')}
            style={styles.sectionHeader}
          >
            <Mail size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Contact Information
            </Text>
          </TouchableOpacity>
          {expandedSections.contact && (
            <View style={styles.sectionContentContainer}>
              {/* Headquarters */}
              <View style={styles.contactItem}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text
                  style={[styles.contactLabel, { color: colors.text }]}
                ></Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {aboutUsInfo.contactInfo?.headquarters}
                </Text>
              </View>

              {/* Phones */}
              {aboutUsInfo.contactInfo?.phones?.map((phone, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactItem}
                  onPress={() => handleContactPress('phone', phone)}
                >
                  <Phone size={18} color={colors.textSecondary} />
                  <Text
                    style={[styles.contactValue, { color: colors.primary }]}
                  >
                    {phone}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Emails */}
              {aboutUsInfo.contactInfo?.emails?.map((email, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactItem}
                  onPress={() => handleContactPress('email', email)}
                >
                  <Mail size={18} color={colors.textSecondary} />

                  <Text
                    style={[styles.contactValue, { color: colors.primary }]}
                  >
                    {email}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[{ color: colors.textSecondary }]}>
            Designed & Developed By HIGH-ER ENTERPRISES
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            (+2349043970401; info@higher.com.ng)
          </Text>
          <Text
            style={[
              styles.footerText,
              { color: colors.textSecondary, marginTop: 8 },
            ]}
          >
            © 2025 God's Kingdom Society. All rights reserved.
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            Towards God's perfect government
          </Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logo: { fontSize: 64, marginBottom: 16 },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: { fontSize: 14 },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginLeft: 12 },
  sectionContentContainer: { marginTop: 12 },
  sectionContent: { fontSize: 16, lineHeight: 24 },
  beliefItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: { fontSize: 16, marginRight: 8, marginTop: 2 },
  beliefText: { fontSize: 14, lineHeight: 20, flex: 1 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',

    minWidth: 5,
  },
  contactValue: { fontSize: 14, flex: 1, marginLeft: 8 },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerText: { fontSize: 14, textAlign: 'center', marginBottom: 4 },
  footerSubtext: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
});
