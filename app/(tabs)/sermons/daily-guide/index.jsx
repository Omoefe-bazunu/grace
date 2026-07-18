import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { AppText } from '../../../../components/ui/AppText';
import {
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, subDays, addDays, parseISO } from 'date-fns';

// Local JSON data - devotionals are bundled with the app, no network call needed
import dailyGuideData from '../../../../assets/data/dailyguide.json';

const { width: screenWidth } = Dimensions.get('window');

// Best Practice: Helper to format real Dates strictly into timezone-agnostic standard date strings (YYYY-MM-DD)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyGuideScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const [devotionals, setDevotionals] = useState([]);

  // Best Practice: Store date as a pure "YYYY-MM-DD" string in state, completely eliminating timezone offset drift
  const [selectedDateStr, setSelectedDateStr] = useState(getLocalDateString());
  const [currentDevotional, setCurrentDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);

  const fetchDevotionals = () => {
    try {
      const list = dailyGuideData.devotionals || [];
      setDevotionals(list);
      loadDevotionalForDate(selectedDateStr, list);
    } catch (error) {
      console.error('Error loading devotionals:', error);
      setDevotionals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDevotionalForDate = (dateStr, devotionalsList = null) => {
    setLoadingDevotional(true);
    const listToSearch = devotionalsList || devotionals;

    // Timezone-safe matching: direct match with YYYY-MM-DD string
    const devotionalForDate = listToSearch.find((d) => d.date === dateStr);

    if (devotionalForDate) {
      setCurrentDevotional(devotionalForDate);
    } else {
      setCurrentDevotional(null);
    }
    setLoadingDevotional(false);
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  useEffect(() => {
    if (devotionals.length > 0 || !loading) {
      loadDevotionalForDate(selectedDateStr);
    }
  }, [selectedDateStr]);

  // Reset the theme card back to its collapsed state whenever the
  // displayed devotional changes (e.g. navigating to a different date)
  useEffect(() => {
    setThemeExpanded(false);
  }, [currentDevotional?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevotionals();
  };

  const navigateDate = (direction) => {
    setSelectedDateStr((currentStr) => {
      // Safely parse timezone-neutral 'YYYY-MM-DD' via parseISO
      const currentDateObj = parseISO(currentStr);
      const updatedDateObj =
        direction === 'prev'
          ? subDays(currentDateObj, 1)
          : addDays(currentDateObj, 1);
      return getLocalDateString(updatedDateObj);
    });
  };

  const formatDisplayDate = (dateStr) => {
    const todayStr = getLocalDateString(new Date());
    const yesterdayObj = subDays(new Date(), 1);
    const yesterdayStr = getLocalDateString(yesterdayObj);
    const tomorrowObj = addDays(new Date(), 1);
    const tomorrowStr = getLocalDateString(tomorrowObj);

    if (dateStr === todayStr) return translations.today || 'Today';
    if (dateStr === yesterdayStr) return translations.yesterday || 'Yesterday';
    if (dateStr === tomorrowStr) return translations.tomorrow || 'Tomorrow';

    // Parse cleanly without timezone shifts for formatting
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  };

  const formatDayName = (dateStr) => {
    return format(parseISO(dateStr), 'EEEE');
  };

  const getDateStatus = (dateStr) => {
    const hasDevotional = devotionals.some((d) => d.date === dateStr);
    const todayStr = getLocalDateString(new Date());

    if (dateStr === todayStr) return { type: 'today', hasDevotional };
    if (dateStr < todayStr) return { type: 'past', hasDevotional };
    return { type: 'future', hasDevotional };
  };

  // Splits on real newlines (paragraph breaks now live directly in the JSON
  // data for both the scripture text and the commentary).
  const renderParagraphs = (text, customStyle = {}) => {
    if (!text) return null;

    const paragraphs = text.replace(/\\n/g, '\n').split(/\n+/);

    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;
      return (
        <AppText
          key={index}
          style={[styles.mainText, { color: colors.text }, customStyle]}
        >
          {trimmed}
        </AppText>
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation
          title={translations.dailyGuideTitle || 'Daily Guide'}
          showBackButton={true}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation
        showBackButton={true}
        title={translations.dailyGuideTitle || 'Daily Guide'}
      />

      {/* Header with Calendar */}
      <View style={styles.header}>
        <ImageBackground
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2Fsermonsection.jpeg?alt=media&token=4ed2e960-ac18-401a-a9f6-e15dc5e30d16',
          }}
          style={styles.headerBackground}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <AppText style={styles.headerTitle}>
              {translations.dailyDevotionalBanner || 'Daily Devotional'}
            </AppText>
            <AppText style={styles.headerSubtitle}>
              {translations.dailyDevotionalBannerSubtitle ||
                "God's Word a Lamp to My Feet."}
            </AppText>
          </View>
        </ImageBackground>
      </View>

      {/* Date Navigation */}
      <View style={[styles.dateNavigation, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() => navigateDate('prev')}
          style={[styles.navButton, { backgroundColor: colors.primary + '15' }]}
        >
          <ChevronLeft size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <AppText style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(selectedDateStr)}
          </AppText>
          <AppText
            style={[styles.dateSubtext, { color: colors.textSecondary }]}
          >
            {formatDayName(selectedDateStr)}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => navigateDate('next')}
          style={[styles.navButton, { backgroundColor: colors.primary + '15' }]}
        >
          <ChevronRight size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Devotional Content */}
        {loadingDevotional ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText
              style={[styles.loadingText, { color: colors.textSecondary }]}
            >
              {translations.loadingDevotional || 'Loading devotional...'}
            </AppText>
          </View>
        ) : currentDevotional ? (
          <>
            {/* Theme Card - collapsible, shows 2 lines of the intro by default */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setThemeExpanded((prev) => !prev)}
              style={[styles.themeCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.themeCardHeader}>
                <AppText
                  style={[styles.themeCardTitle, { color: colors.text }]}
                >
                  THEME: {currentDevotional.theme}
                </AppText>
                {currentDevotional.themeIntroduction ? (
                  themeExpanded ? (
                    <ChevronUp size={20} color={colors.primary} />
                  ) : (
                    <ChevronDown size={20} color={colors.primary} />
                  )
                ) : null}
              </View>
              {currentDevotional.themeIntroduction && (
                <AppText
                  numberOfLines={themeExpanded ? undefined : 2}
                  style={[
                    styles.themeIntroText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {currentDevotional.themeIntroduction}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Text + Commentary Card */}
            <View
              style={[
                styles.devotionalCard,
                { backgroundColor: colors.card, borderRadius: 8 },
              ]}
            >
              <LinearGradient
                colors={[colors.primary + '20', 'transparent']}
                style={styles.devotionalGradient}
              />

              <View style={styles.mainTextContainer}>
                {/* Devotional Core Scripture Block */}
                {currentDevotional.text && (
                  <View style={styles.scriptureBlock}>
                    <AppText
                      style={[styles.sectionLabel, { color: colors.primary }]}
                    >
                      TEXT
                    </AppText>
                    {renderParagraphs(currentDevotional.text)}
                  </View>
                )}

                {/* Commentary - paragraph breaks come straight from the JSON data */}
                {currentDevotional.comment && (
                  <View style={styles.commentContainer}>
                    <AppText
                      style={[styles.sectionLabel, { color: colors.primary }]}
                    >
                      COMMENTARY
                    </AppText>
                    {renderParagraphs(
                      currentDevotional.comment,
                      styles.commentText,
                    )}
                  </View>
                )}
              </View>

              <View style={styles.devotionalFooter}>
                <View
                  style={[
                    styles.dateBadge,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <AppText
                    style={[styles.dateBadgeText, { color: colors.primary }]}
                  >
                    {format(parseISO(currentDevotional.date), 'MMM d, yyyy')}
                  </AppText>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <BookOpen size={48} color={colors.primary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.text }]}>
              {translations.noDevotionalAvailable || 'No Devotional Available'}
            </AppText>
            <AppText
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {getDateStatus(selectedDateStr).type === 'future'
                ? translations.checkBackFuture ||
                  'Check back on this date for a new devotional'
                : translations.noDevotionalPast ||
                  'No devotional was published for this date'}
            </AppText>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 180,
    overflow: 'hidden',
  },
  headerBackground: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  devotionalCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  devotionalGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  themeCard: {
    margin: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeCardTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  themeIntroText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  mainTextContainer: {
    padding: 20,
  },
  scriptureBlock: {
    marginBottom: 10,
  },
  mainText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 16, // Clean structural gap between paragraphs
  },
  commentContainer: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  devotionalFooter: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'flex-end',
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
