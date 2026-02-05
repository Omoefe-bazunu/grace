import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { subscribeToNotices } from '@/services/dataService';
import {
  Bell,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react-native';
import { AppText } from '../../../../components/ui/AppText';

const { width, height } = Dimensions.get('window');

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const CollapsibleNoticeItem = ({
  item,
  colors,
  translations,
  onImagePress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timestamp = item.createdAt || item.date;
  const hasImages = item.images && item.images.length > 0;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const openPdf = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleExpand}
      style={[
        styles.noticeCard,
        {
          backgroundColor: colors.card,
          borderLeftColor: colors.primary,
          borderWidth: isExpanded ? 1 : 0,
          borderColor: colors.primary + '20',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Bell size={18} color={colors.primary} style={styles.icon} />
          <AppText
            style={[styles.title, { color: colors.text }]}
            numberOfLines={isExpanded ? undefined : 1}
          >
            {item.title || translations.noTitle}
          </AppText>
        </View>
        <View style={styles.headerRight}>
          <AppText style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(timestamp)}
          </AppText>
          {isExpanded ? (
            <ChevronUp size={18} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={18} color={colors.textSecondary} />
          )}
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <AppText style={[styles.message, { color: colors.text }]}>
            {item.message || translations.noMessage}
          </AppText>

          {hasImages && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
              contentContainerStyle={styles.imageScrollContent}
            >
              {item.images.map((img, idx) => (
                <TouchableOpacity key={idx} onPress={() => onImagePress(img)}>
                  <Image
                    source={{ uri: img }}
                    style={styles.noticeImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {item.pdfUrl && (
            <TouchableOpacity
              style={[
                styles.pdfButton,
                {
                  backgroundColor: colors.primary + '10',
                  borderColor: colors.primary + '30',
                },
              ]}
              onPress={() => openPdf(item.pdfUrl)}
            >
              <View style={styles.pdfIconContainer}>
                <FileText size={20} color={colors.primary} />
              </View>
              <View style={styles.pdfInfo}>
                <AppText style={[styles.pdfTitle, { color: colors.text }]}>
                  {translations.viewAttachedDoc || 'View Attached Document'}
                </AppText>
                <AppText
                  style={[styles.pdfSub, { color: colors.textSecondary }]}
                >
                  {translations.pdfFile || 'PDF File'}
                </AppText>
              </View>
              <ExternalLink size={18} color={colors.primary} />
            </TouchableOpacity>
          )}

          <View style={styles.cardFooter}>
            <AppText style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(timestamp)}
            </AppText>
          </View>
        </View>
      )}

      {!isExpanded && (
        <AppText style={[styles.compactDate, { color: colors.textSecondary }]}>
          {formatDate(timestamp)}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

export default function NoticesScreen() {
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { translations } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
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

  return (
    <SafeAreaWrapper>
      <TopNavigation
        showBackButton={true}
        title={translations.noticesNavTitle || 'Notices'}
      />

      {/* Fullscreen Image Viewer Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.closeFullscreen}
            onPress={() => setSelectedImage(null)}
          >
            <X size={30} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={allNotices}
          renderItem={({ item }) => (
            <CollapsibleNoticeItem
              item={item}
              colors={colors}
              translations={translations}
              onImagePress={(img) => setSelectedImage(img)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Bell size={48} color={colors.textSecondary} />
                <AppText style={styles.emptyText}>
                  {translations.noNoticesYet || 'No Notices Yet'}
                </AppText>
              </View>
            )
          }
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  noticeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { marginRight: 8 },
  title: { fontSize: 15, fontWeight: '700', flex: 1 },
  timeText: { fontSize: 11, fontWeight: '600' },
  expandedContent: { marginTop: 12 },
  message: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  imageScroll: { marginBottom: 16, marginHorizontal: -16 },
  imageScrollContent: { paddingHorizontal: 16, gap: 10 },
  noticeImage: {
    width: width * 0.7,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pdfIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pdfInfo: { flex: 1 },
  pdfTitle: { fontSize: 14, fontWeight: '600' },
  pdfSub: { fontSize: 12 },
  cardFooter: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateText: { fontSize: 12, fontWeight: '600' },
  compactDate: {
    fontSize: 10,
    marginTop: 4,
    marginLeft: 26,
    fontWeight: '500',
  },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },

  // Fullscreen Styles
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: { width: width, height: height * 0.8 },
  closeFullscreen: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
});
