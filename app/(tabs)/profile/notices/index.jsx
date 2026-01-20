import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { subscribeToNotices } from '@/services/dataService';
import { Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Helper to format time (e.g., 10:30 AM)
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper to format date (e.g., Mon, 12 Oct)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.noticeCard, { backgroundColor: colors.card }]}>
      <View style={styles.skeletonHeader}>
        <View
          style={[styles.skeletonCircle, { backgroundColor: colors.skeleton }]}
        />
        <View
          style={[styles.skeletonTime, { backgroundColor: colors.skeleton }]}
        />
      </View>
      <View
        style={[styles.skeletonTitle, { backgroundColor: colors.skeleton }]}
      />
      <View
        style={[styles.skeletonText, { backgroundColor: colors.skeleton }]}
      />
      <View
        style={[styles.skeletonTextShort, { backgroundColor: colors.skeleton }]}
      />
    </View>
  );
};

export default function NoticesScreen() {
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    // PUBLIC: Always fetch notices
    const unsubscribeNotices = subscribeToNotices((newNotices) => {
      const sorted = [...newNotices].sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
      );
      setAllNotices(sorted);
      setLoading(false);
    });

    return () => unsubscribeNotices();
  }, []);

  const renderNoticeItem = ({ item }) => {
    const timestamp = item.createdAt || item.date;

    return (
      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: colors.card,
            borderLeftColor: colors.primary,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Bell size={20} color={colors.primary} style={styles.icon} />
            <Text
              style={[styles.title, { color: colors.text, fontWeight: '700' }]}
              numberOfLines={1}
            >
              {item.title || translations.noTitle}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(timestamp)}
            </Text>
          </View>
        </View>

        <Text style={[styles.message, { color: colors.text }]}>
          {item.message || translations.noMessage}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.card }]}>
        <Bell size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {translations.noNotices}
      </Text>
      <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
        {translations.checkLater}
      </Text>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} title="Notices" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.listContent}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={allNotices}
            renderItem={renderNoticeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyComponent}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  noticeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: { marginRight: 8 },
  title: { fontSize: 16, flex: 1 },
  timeContainer: { justifyContent: 'center' },
  timeText: { fontSize: 12, fontWeight: '500' },
  message: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emptyText: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubText: { fontSize: 15, textAlign: 'center', maxWidth: '70%' },
  // Skeleton Styles
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skeletonCircle: { width: 24, height: 24, borderRadius: 12 },
  skeletonTime: { width: 60, height: 16, borderRadius: 4 },
  skeletonTitle: { width: '70%', height: 20, borderRadius: 4, marginBottom: 8 },
  skeletonText: { width: '100%', height: 14, borderRadius: 4, marginBottom: 4 },
  skeletonTextShort: { width: '90%', height: 14, borderRadius: 4 },
});
