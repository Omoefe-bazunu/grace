import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar, User, Mail, MessageCircleOff } from 'lucide-react-native';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { subscribeToContactMessages } from '../../../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavigation } from '../../../../../components/TopNavigation';
import { SafeAreaWrapper } from '../../../../../components/ui/SafeAreaWrapper';
import { AppText } from '../../../../../components/ui/AppText';

const SkeletonCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={[styles.skeletonLine, { width: '60%', height: 20 }]}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={[styles.skeletonLine, { width: '40%', height: 16 }]}
      />
      <LinearGradient
        colors={[colors.skeleton, colors.skeletonHighlight]}
        style={[styles.skeletonLine, { width: '100%', height: 14 }]}
      />
    </View>
  );
};

export default function MessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    // Check if the service function exists before calling
    if (typeof subscribeToContactMessages === 'function') {
      const unsubscribe = subscribeToContactMessages((newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'complaint':
        return { color: '#EF4444', bg: '#FEF2F2' };
      case 'suggestion':
        return { color: '#059669', bg: '#ECFDF5' };
      case 'request':
        return { color: '#F59E0B', bg: '#FFFBEB' };
      case 'appreciation':
        return { color: '#3B82F6', bg: '#EFF6FF' };
      default:
        return { color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown Date';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return (
      d.toLocaleDateString() +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const renderMessageItem = ({ item }) => {
    const typeStyle = getTypeStyles(item.category || item.subject);
    return (
      <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
        <View style={styles.messageHeader}>
          <View style={styles.userInfo}>
            <User size={16} color={colors.textSecondary} />
            <AppText style={[styles.userName, { color: colors.text }]}>
              {item.name}
            </AppText>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
            <AppText style={[styles.typeText, { color: typeStyle.color }]}>
              {item.category || item.subject}
            </AppText>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <Mail size={14} color={colors.textSecondary} />
          <AppText style={[styles.email, { color: colors.textSecondary }]}>
            {item.email}
          </AppText>
        </View>

        <AppText style={[styles.messageText, { color: colors.text }]}>
          {item.message}
        </AppText>

        <View style={styles.messageFooter}>
          <Calendar size={14} color={colors.textSecondary} />
          <AppText style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  const renderStats = () => (
    <View
      style={[
        styles.statsContainer,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.statItem}>
        <AppText style={[styles.statNumber, { color: colors.primary }]}>
          {messages.length}
        </AppText>
        <AppText style={styles.statLabel}>Total</AppText>
      </View>
      <View style={styles.statItem}>
        <AppText style={[styles.statNumber, { color: '#EF4444' }]}>
          {
            messages.filter((m) => (m.category || m.subject) === 'complaint')
              .length
          }
        </AppText>
        <AppText style={styles.statLabel}>Complaints</AppText>
      </View>
      <View style={styles.statItem}>
        <AppText style={[styles.statNumber, { color: '#059669' }]}>
          {
            messages.filter((m) => (m.category || m.subject) === 'suggestion')
              .length
          }
        </AppText>
        <AppText style={styles.statLabel}>Suggestions</AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation title="Contact Messages" />
      {!loading && renderStats()}

      <FlatList
        data={loading ? [] : messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MessageCircleOff size={64} color={colors.textSecondary} />
              <AppText style={styles.emptyText}>No Messages Yet</AppText>
            </View>
          )
        }
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  listContainer: { padding: 20 },
  messageCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: '600', marginLeft: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  contactInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  email: { fontSize: 13, marginLeft: 6 },
  messageText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  messageFooter: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 11, marginLeft: 6 },
  skeletonLine: { borderRadius: 4, marginBottom: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
});
