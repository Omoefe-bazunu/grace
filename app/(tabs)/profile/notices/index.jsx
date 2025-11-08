import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import {
  subscribeToNotices,
  subscribeToReadNotices,
  markNoticeAsRead,
} from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.noticeCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonTitle}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonText}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={styles.skeletonDate}
      />
    </View>
  );
};

export default function NoticesScreen() {
  const [allNotices, setAllNotices] = useState([]);
  const [readNoticeIds, setReadNoticeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translations } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribeNotices = subscribeToNotices((newNotices) => {
      setAllNotices(newNotices);
      setLoading(false);
    });

    const unsubscribeReadNotices = subscribeToReadNotices(
      userId,
      (newReadIds) => {
        setReadNoticeIds(newReadIds);
      }
    );

    return () => {
      unsubscribeNotices();
      unsubscribeReadNotices();
    };
  }, [userId]);

  const handleReadNotice = async (noticeId) => {
    await markNoticeAsRead(userId, noticeId);
  };

  const renderNoticeItem = ({ item }) => {
    const isRead = readNoticeIds.includes(item.id);
    const cardStyle = [
      styles.noticeCard,
      { backgroundColor: isRead ? colors.card : colors.primaryLight },
      isRead ? {} : styles.unreadCard,
    ];
    const textStyle = { color: isRead ? colors.text : colors.primary };

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => handleReadNotice(item.id)}
      >
        <View style={styles.noticeIcon}>
          {isRead ? (
            <CheckCircle size={24} color={colors.textSecondary} />
          ) : (
            <Bell size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.noticeInfo}>
          <Text style={[styles.noticeTitle, textStyle]} numberOfLines={1}>
            {item.title || translations.noTitle}
          </Text>
          <Text style={[styles.noticeMessage, { color: colors.textSecondary }]}>
            {item.message || translations.noMessage}
          </Text>
          <Text style={[styles.noticeDate, { color: colors.textSecondary }]}>
            {item.date || translations.unknownDate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonCards = () => (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Bell size={64} color={colors.textSecondary} style={styles.emptyIcon} />
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
      <TopNavigation title={translations.notices} />
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/profile`)}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Return Back</Text>
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.listContainer}>{renderSkeletonCards()}</View>
        ) : allNotices.length > 0 ? (
          <FlatList
            data={allNotices}
            renderItem={renderNoticeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyComponent()
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 12,
  },
  noticeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  backText: {
    color: '#1E3A8A',
    fontSize: 16,
    marginHorizontal: 'auto',
    marginVertical: 10,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  noticeIcon: {
    marginRight: 16,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noticeMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonText: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDate: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
