import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  MessageCircle,
  MessageCircleQuestion,
  Brain,
  Music,
  Video,
  Bell,
  Mic,
  FileText,
  PlayCircle,
  BookOpen,
  Podcast,
  Image as ImageIcon,
  LogOut,
  Send,
} from 'lucide-react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { TopNavigation } from '../../../../components/TopNavigation';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { SendIcon } from 'lucide-react';

export default function AdminDashboardScreen() {
  const { user, isLoading, logout } = useAuth();

  const adminActions = [
    {
      id: 'upload-sermon',
      title: 'Add Sermon',
      description: 'Upload new sermons with audio',
      icon: <Mic size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/sermon'),
    },
    {
      id: 'upload-song',
      title: 'Upload Song',
      description: 'Add gospel music to the library',
      icon: <Music size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/song'),
    },
    {
      id: 'upload-video',
      title: 'Upload Video',
      description: 'Add animated Bible stories',
      icon: <Video size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/video'),
    },
    {
      id: 'upload-sermon-audio',
      title: 'Upload Sermon Audio',
      description: 'Add sermon audio with date',
      icon: <Music size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/sermonAudio'),
    },
    {
      id: 'upload-sermon-video',
      title: 'Upload Sermon Video',
      description: 'Add sermon videos with categories',
      icon: <PlayCircle size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/sermonVideo'),
    },
    {
      id: 'upload-daily-devotional',
      title: 'Daily Devotional',
      description: 'Add daily devotional guides',
      icon: <BookOpen size={32} color="#1E3A8A" />,
      onPress: () =>
        router.push('/(tabs)/profile/admin/upload/dailyDevotional'),
    },
    {
      id: 'view-messages',
      title: 'View Messages',
      description: 'Check contact form submissions',
      icon: <MessageCircle size={32} color="#059669" />,
      onPress: () => router.push('/(tabs)/profile/admin/messages'),
    },
    {
      id: 'quiz-resource',
      title: 'Quiz Resource',
      description: 'Upload Quiz Resources',
      icon: <Brain size={32} color="#DC2626" />,
      onPress: () => router.push('/(tabs)/profile/admin/quizupload'),
    },
    {
      id: 'quiz-help-questions',
      title: 'Quiz Help Questions',
      description: 'Manage Quiz Help Questions',
      icon: <MessageCircleQuestion size={32} color="#DC2626" />,
      onPress: () => router.push('/(tabs)/profile/admin/quizhelpquestions'),
    },
    {
      id: 'upload-notices',
      title: 'Upload Notices',
      description: 'Send a Notice to all users',
      icon: <Send size={32} color="#7C3AED" />,
      onPress: () => router.push('/(tabs)/profile/admin/noticeupload'),
    },
    {
      id: 'read-notices',
      title: 'Read Notices',
      description: 'View, edit, and delete all notices',
      icon: <FileText size={32} color="#7C3AED" />,
      onPress: () => router.push('/(tabs)/profile/admin/readnotices'),
    },
    {
      id: 'manage-contents',
      title: 'Manage Contents',
      description: 'View, edit, and delete all contents',
      icon: <FileText size={32} color="#7C3AED" />,
      onPress: () => router.push('/(tabs)/profile/admin/contentmanager'),
    },
    {
      id: 'manage-live-streams',
      title: 'Live Streams',
      description: 'Manage live streaming services',
      icon: <Podcast size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/livestreammanager'),
    },
    {
      id: 'gallery-management',
      title: 'Gallery Management',
      description: 'Upload pictures, videos & ministers data',
      icon: <ImageIcon size={32} color="#1E3A8A" />,
      onPress: () => router.push('(tabs)/profile/admin/gallery'),
    },
    {
      id: 'archive-management',
      title: 'Archive Management',
      description: 'Upload pictures & videos data',
      icon: <ImageIcon size={32} color="#1E3A8A" />,
      onPress: () => router.push('(tabs)/profile/admin/archive'),
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: <LogOut size={32} color="#EF4444" />,
      onPress: logout,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaWrapper>
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Mic size={48} color="#1E3A8A" />
              </View>
              <Text style={styles.modalTitle}>Login Required</Text>
              <Text style={styles.modalDescription}>
                You must be logged in as an administrator to access the
                dashboard and manage application content.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.modalButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome, Administrator</Text>
          <Text style={styles.welcomeSubtitle}>{user?.email}</Text>
        </View>

        <View style={styles.actionsGrid}>
          {adminActions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                index % 2 === 0 ? styles.leftCard : styles.rightCard,
              ]}
              onPress={action.onPress}
            >
              <View style={styles.actionIcon}>{action.icon}</View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 20,
    backgroundColor: '#EBF4FF',
    padding: 16,
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalButton: {
    backgroundColor: '#1E3A8A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftCard: { width: '48%' },
  rightCard: { width: '48%' },
  actionIcon: { marginBottom: 12 },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
