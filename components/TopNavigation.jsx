import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Info,
  Bell,
  MessageCircle,
  Settings,
  Moon,
  Sun,
  Brain,
  ArrowLeft,
  Image as ImageIcon,
  MoreVertical,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { subscribeToNotices } from '../services/dataService';

export function TopNavigation({ title, showBackButton = false, onPress }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAdmin } = useAuth(); // Keeping this for context, though we aren't hiding the button anymore
  const [showMenu, setShowMenu] = useState(false);
  const [notices, setNotices] = useState([]);

  const handleBackPress = () => {
    if (onPress && typeof onPress === 'function') {
      onPress();
    } else {
      router.back();
    }
  };

  useEffect(() => {
    const unsubscribeNotices = subscribeToNotices((newNotices) => {
      setNotices(newNotices);
    });

    return () => {
      unsubscribeNotices();
    };
  }, []);

  // Updated menuItems to include Admin Panel by default
  const menuItems = [
    {
      icon: <Info size={20} color={colors.textSecondary} />,
      title: 'About',
      onPress: () => {
        setShowMenu(false);
        router.push('/profile/about');
      },
    },
    {
      icon: <MessageCircle size={20} color={colors.textSecondary} />,
      title: 'Contact',
      onPress: () => {
        setShowMenu(false);
        router.push('/profile/contact');
      },
    },
    {
      icon: isDark ? (
        <Sun size={20} color={colors.textSecondary} />
      ) : (
        <Moon size={20} color={colors.textSecondary} />
      ),
      title: isDark ? 'Light Mode' : 'Dark Mode',
      onPress: () => {
        setShowMenu(false);
        toggleTheme();
      },
    },
    {
      icon: <Settings size={20} color={colors.primary} />,
      title: 'Admin Panel',
      onPress: () => {
        setShowMenu(false);
        router.push('/profile/admin');
      },
    },
  ];

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.skeleton }]}
              onPress={handleBackPress}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/profile/gallery')}
          >
            <ImageIcon size={22} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/profile/quizresources')}
          >
            <Brain size={22} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/profile/notices')}
          >
            <Bell size={22} color={colors.text} strokeWidth={1.5} />
            {notices.length > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#EF4444', borderColor: colors.surface },
                ]}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuTrigger}
            onPress={() => setShowMenu(true)}
          >
            <MoreVertical size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
          <View
            style={[
              styles.menu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text
                style={[
                  styles.menuHeaderTitle,
                  { color: colors.textSecondary },
                ]}
                allowFontScaling={false}
              >
                Options
              </Text>
              <LanguageSwitcher />
            </View>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: colors.background },
                  ]}
                >
                  {item.icon}
                </View>
                <Text
                  style={[styles.menuText, { color: colors.text }]}
                  allowFontScaling={false}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    zIndex: 1,
  },
  menuTrigger: {
    width: 32,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 20,
  },
  menu: {
    borderRadius: 20,
    width: 220,
    padding: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 5,
  },
  menuHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
