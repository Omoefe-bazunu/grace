import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import {
  getDailyDevotionalsPaginated,
  getDailyDevotionalByDate,
} from '../../../../services/dataService';
import {
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  format,
  subDays,
  addDays,
  parseISO,
  isToday,
  isYesterday,
  isTomorrow,
} from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');

export default function DailyGuideScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const [devotionals, setDevotionals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDevotional, setCurrentDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDevotional, setLoadingDevotional] = useState(false);

  const fetchDevotionals = async () => {
    try {
      const result = await getDailyDevotionalsPaginated(30, null);
      setDevotionals(result.dailyDevotionals);

      // Load devotional for selected date
      await loadDevotionalForDate(selectedDate);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDevotionalForDate = async (date) => {
    try {
      setLoadingDevotional(true);
      const dateString = format(date, 'yyyy-MM-dd');

      // Try to find devotional for the selected date
      const devotionalForDate = devotionals.find((d) => d.date === dateString);

      if (devotionalForDate) {
        setCurrentDevotional(devotionalForDate);
      } else {
        // If not in cached list, try to fetch specifically for this date
        const devotional = await getDailyDevotionalByDate(dateString);
        setCurrentDevotional(devotional);
      }
    } catch (error) {
      console.error('Error loading devotional:', error);
      setCurrentDevotional(null);
    } finally {
      setLoadingDevotional(false);
    }
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  useEffect(() => {
    if (devotionals.length > 0) {
      loadDevotionalForDate(selectedDate);
    }
  }, [selectedDate, devotionals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevotionals();
  };

  const navigateDate = (direction) => {
    setSelectedDate((current) =>
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };

  const formatDisplayDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMMM d, yyyy');
  };

  const formatDateForCalendar = (date) => {
    return format(date, 'MMM d');
  };

  const getDateStatus = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const hasDevotional = devotionals.some((d) => d.date === dateString);

    if (isToday(date)) return { type: 'today', hasDevotional };
    if (date < new Date()) return { type: 'past', hasDevotional };
    return { type: 'future', hasDevotional };
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <TopNavigation title="Daily Guide" showBackButton={true} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />

      {/* Header with Calendar */}
      <View style={styles.header}>
        <ImageBackground
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/grace-cc555.firebasestorage.app/o/SERMON.png?alt=media&token=b288818c-4d0e-426b-b40a-dd8f532b0a75',
          }}
          style={styles.headerBackground}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <View style={styles.calendarIcon}>
              <Calendar size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Daily Devotional</Text>
            <Text style={styles.headerSubtitle}>
              Nourish your spirit with daily guidance.
            </Text>
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
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={[styles.dateSubtext, { color: colors.textSecondary }]}>
            {format(selectedDate, 'EEEE')}
          </Text>
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
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading devotional...
            </Text>
          </View>
        ) : currentDevotional ? (
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

            {/* <View style={styles.devotionalHeader}>
              <Text style={[styles.devotionalTitle, { color: colors.text }]}>
                {currentDevotional.title}
              </Text>
            </View> */}

            <View style={styles.mainTextContainer}>
              <Text style={[styles.mainText, { color: colors.text }]}>
                {currentDevotional.mainText}
              </Text>
            </View>

            <View style={styles.devotionalFooter}>
              <View
                style={[
                  styles.dateBadge,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Text style={[styles.dateBadgeText, { color: colors.primary }]}>
                  {format(parseISO(currentDevotional.date), 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
          </View>
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Devotional Available
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {getDateStatus(selectedDate).type === 'future'
                ? 'Check back on this date for a new devotional'
                : 'No devotional was published for this date'}
            </Text>
          </View>
        )}

        {/* Recent Devotionals */}
        {devotionals.length > 0 && (
          <View style={[styles.recentSection, { display: 'none' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Devotionals
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {devotionals.slice(0, 10).map((devotional, index) => (
                <TouchableOpacity
                  key={devotional.id}
                  onPress={() => setSelectedDate(parseISO(devotional.date))}
                  style={[
                    styles.recentCard,
                    {
                      backgroundColor: colors.card,
                      marginLeft: index === 0 ? 20 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.recentDate, { color: colors.primary }]}>
                    {formatDateForCalendar(parseISO(devotional.date))}
                  </Text>
                  <Text
                    style={[styles.recentTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {devotional.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    height: '100%',
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
  calendarIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    marginTop: -20,
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
  devotionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  titleIcon: {
    marginRight: 12,
  },
  devotionalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 24,
  },
  mainTextContainer: {
    padding: 20,
  },
  mainText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
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
  recentSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 12,
  },
  recentScroll: {
    paddingRight: 20,
  },
  recentCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});
