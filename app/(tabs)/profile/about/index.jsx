import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Image,
  Platform,
  UIManager,
  Linking,
  Dimensions,
} from 'react-native';
import {
  Mail,
  Heart,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { TopNavigation } from '@/components/TopNavigation';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { AppText } from '../../../../components/ui/AppText';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AboutScreen() {
  const { translations, aboutUsInfo } = useLanguage();
  const { colors } = useTheme();

  const [expandedSections, setExpandedSections] = useState({
    mission: true,
  });

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContactPress = (type, value) => {
    const urls = {
      email: `mailto:${value}`,
      phone: `tel:${value}`,
      social: `https://${value}`,
    };
    if (urls[type]) Linking.openURL(urls[type]);
  };

  const renderSection = (key, Icon, title, content, isList = false) => {
    const isExpanded = expandedSections[key];
    return (
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleSection(key)}
          style={styles.sectionHeader}
        >
          <View
            style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}
          >
            <Icon size={20} color={colors.primary} />
          </View>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </AppText>
          {isExpanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContentContainer}>
            {isList && Array.isArray(content) ? (
              content.map((item, index) => (
                <View key={index} style={styles.beliefItem}>
                  <ShieldCheck
                    size={16}
                    color={colors.primary}
                    style={styles.beliefIcon}
                  />
                  <AppText style={[styles.beliefText, { color: colors.text }]}>
                    {item}
                  </AppText>
                </View>
              ))
            ) : (
              <AppText style={[styles.sectionContent, { color: colors.text }]}>
                {content}
              </AppText>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaWrapper style={{ backgroundColor: colors.background }}>
      <TopNavigation
        showBackButton={true}
        title={translations.aboutUsNav || 'About Us'}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.hero}
        >
          <AppText style={styles.heroTitle}>
            {translations.churchName || "God's Kingdom Society"}
          </AppText>
          <AppText style={styles.heroSub}>
            {translations.churchSlogan || '(The Church of the Living God)'}
          </AppText>
          <View style={styles.versionBadge}>
            <AppText style={styles.versionText}>v{aboutUsInfo.version}</AppText>
          </View>
        </LinearGradient>

        <View style={styles.contentBody}>
          {renderSection(
            'mission',
            Heart,
            translations.ourMission || 'Our Mission',
            aboutUsInfo.mission,
          )}

          {renderSection(
            'aboutGKS',
            Info,
            translations.historyVision || 'History & Vision',
            aboutUsInfo.content,
          )}

          {renderSection(
            'beliefs',
            ShieldCheck,
            translations.coreBeliefs || 'Core Beliefs',
            aboutUsInfo.keyBeliefs,
            true,
          )}

          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeaderNoTouch}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Mail size={20} color={colors.primary} />
              </View>
              <AppText style={[styles.sectionTitle, { color: colors.text }]}>
                {translations.connectWithUs || 'Connect With Us'}
              </AppText>
            </View>

            <View style={styles.contactGrid}>
              <View style={styles.addressBox}>
                <MapPin size={16} color={colors.textSecondary} />
                <AppText
                  style={[styles.addressText, { color: colors.textSecondary }]}
                >
                  {aboutUsInfo.contactInfo?.headquarters}
                </AppText>
              </View>

              <View style={styles.contactRow}>
                {aboutUsInfo.contactInfo?.phones?.map((phone, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.contactTile,
                      { backgroundColor: colors.background },
                    ]}
                    onPress={() => handleContactPress('phone', phone)}
                  >
                    <Phone size={16} color={colors.primary} />
                    <AppText style={[styles.tileText, { color: colors.text }]}>
                      {phone}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.contactRow}>
                {aboutUsInfo.contactInfo?.emails?.map((email, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.contactTile,
                      { backgroundColor: colors.background },
                    ]}
                    onPress={() => handleContactPress('email', email)}
                  >
                    <Mail size={16} color={colors.primary} />
                    <AppText
                      style={[styles.tileText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {email}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <AppText
              style={[styles.footerMain, { color: colors.textSecondary }]}
            >
              {translations.developedBy || 'Developed by HIGH-ER ENTERPRISES'}
            </AppText>
            <AppText
              style={[styles.footerCopy, { color: colors.textSecondary }]}
            >
              © {new Date().getFullYear()}{' '}
              {translations.churchName || "God's Kingdom Society"}.{' '}
              {translations.allRightsReserved || 'All rights reserved.'}
            </AppText>
            <View
              style={[styles.footerDivider, { backgroundColor: colors.border }]}
            />
            <AppText style={[styles.footerMotto, { color: colors.primary }]}>
              {translations.churchMotto || "Towards God's perfect government"}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  // logoCircle: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 40,
  //   backgroundColor: '#1b0c74',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 10 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 15,
  //   elevation: 10,
  //   marginBottom: 16,
  // },
  // logoImage: {
  //   color: 'white',
  // },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  versionBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  versionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentBody: {
    padding: 20,
  },
  section: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderNoTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContentContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  beliefItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  beliefIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  beliefText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  contactGrid: {
    marginTop: 4,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  addressText: {
    fontSize: 13,
    marginLeft: 8,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  contactTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  tileText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
  footerMain: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  footerCopy: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  footerDivider: {
    width: 40,
    height: 1,
    marginVertical: 12,
  },
  footerMotto: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
