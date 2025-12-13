// AdminDashboardScreen.tsx (updated)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  Image,
} from 'lucide-react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { LanguageSwitcher } from '../../../../components/LanguageSwitcher';
import { TopNavigation } from '../../../../components/TopNavigation';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboardScreen() {
  const { user } = useAuth();

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      Alert.alert(
        'Success',
        'Onboarding state has been reset. Please restart the app to see it again.'
      );
    } catch (error) {
      console.error('Failed to reset onboarding state:', error);
      Alert.alert('Error', 'Failed to reset onboarding state.');
    }
  };

  const adminActions = [
    {
      id: 'upload-notice',
      title: 'Send Notice',
      description: 'Send Notification to all users',
      icon: <Bell size={32} color="#1E3A8A" />,
      onPress: () => router.push('/(tabs)/profile/admin/upload/notice'),
    },
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
      icon: <Image size={32} color="#1E3A8A" />,
      onPress: () => router.push('(tabs)/profile/admin/gallery'),
    },
    {
      id: 'archive-management',
      title: 'Archive Management',
      description: 'Upload pictures & videos data',
      icon: <Image size={32} color="#1E3A8A" />,
      onPress: () => router.push('(tabs)/profile/admin/archive'),
    },
    {
      id: 'reset-onboarding',
      title: 'Reset Onboarding',
      description: 'Clear onboarding state for testing',
      icon: <Bell size={32} color="#EF4444" />,
      onPress: handleResetOnboarding,
    },
  ];

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
