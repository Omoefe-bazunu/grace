// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
// import { router } from 'expo-router';
// import {
//   Info,
//   Bell,
//   MessageCircle,
//   Settings,
//   Moon,
//   Sun,
//   Brain,
//   ArrowLeft,
//   Image,
// } from 'lucide-react-native';
// import { useTheme } from '../contexts/ThemeContext';
// import { useAuth } from '../contexts/AuthContext';
// import { LanguageSwitcher } from './LanguageSwitcher';
// import {
//   subscribeToNotices,
//   subscribeToReadNotices,
// } from '../services/dataService';

// export function TopNavigation({ title, showBackButton = false, onPress }) {
//   const { colors, isDark, toggleTheme } = useTheme();
//   const { isAdmin, user } = useAuth();
//   const [showMenu, setShowMenu] = useState(false);
//   const [notices, setNotices] = useState([]);
//   const [readNoticeIds, setReadNoticeIds] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // === BACK BUTTON HANDLER LOGIC ===
//   const handleBackPress = () => {
//     if (onPress && typeof onPress === 'function') {
//       // If a custom onPress handler is provided, use it
//       onPress();
//     } else {
//       // Otherwise, default to navigating back
//       router.back();
//     }
//   };
//   // ==================================

//   // Subscribe to real-time notices and read notices
//   useEffect(() => {
//     const unsubscribeNotices = subscribeToNotices((newNotices) => {
//       setNotices(newNotices);
//     });

//     const userId = user?.uid;
//     const unsubscribeReadNotices = subscribeToReadNotices(
//       userId,
//       (newReadIds) => {
//         setReadNoticeIds(newReadIds);
//       }
//     );

//     return () => {
//       unsubscribeNotices();
//       unsubscribeReadNotices();
//     };
//   }, [user]);

//   // Calculate unread count
//   useEffect(() => {
//     const readSet = new Set(readNoticeIds);
//     const count = notices.filter((notice) => !readSet.has(notice.id)).length;
//     setUnreadCount(count);
//   }, [notices, readNoticeIds]);

//   const menuItems = [
//     {
//       icon: <Info size={20} color={colors.text} />,
//       title: 'About',
//       onPress: () => {
//         setShowMenu(false);
//         router.push('/profile/about');
//       },
//     },
//     {
//       icon: <MessageCircle size={20} color={colors.text} />,
//       title: 'Contact',
//       onPress: () => {
//         setShowMenu(false);
//         router.push('/profile/contact');
//       },
//     },
//     {
//       icon: isDark ? (
//         <Sun size={20} color={colors.text} />
//       ) : (
//         <Moon size={20} color={colors.text} />
//       ),
//       title: isDark ? 'Light Mode' : 'Dark Mode',
//       onPress: () => {
//         setShowMenu(false);
//         toggleTheme();
//       },
//     },
//   ];

//   if (isAdmin) {
//     menuItems.unshift({
//       icon: <Settings size={20} color={colors.secondary} />,
//       title: 'Admin',
//       onPress: () => {
//         setShowMenu(false);
//         router.push('/profile/admin');
//       },
//     });
//   }

//   const handleNotifications = () => {
//     router.push('/profile/notices');
//   };

//   const handleQuizPress = () => {
//     router.push('/profile/quizresources');
//   };

//   const handleGalleryPress = () => {
//     router.push('/profile/gallery');
//   };

//   return (
//     <>
//       <View
//         style={[
//           styles.container,
//           { backgroundColor: colors.surface, borderBottomColor: colors.border },
//         ]}
//       >
//         <View style={styles.leftSection}>
//           {showBackButton && (
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={handleBackPress}
//             >
//               <ArrowLeft size={24} color={colors.text} />
//             </TouchableOpacity>
//           )}
//           <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
//         </View>

//         <View style={styles.rightSection}>
//           <LanguageSwitcher />
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={handleGalleryPress}
//           >
//             <Image size={20} color={colors.text} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={handleQuizPress}>
//             <Brain size={20} color={colors.text} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={handleNotifications}
//           >
//             <Bell size={20} color={colors.text} />
//             {unreadCount > 0 && (
//               <View style={[styles.badge, { backgroundColor: colors.accent }]}>
//                 <Text
//                   style={[
//                     styles.badgeText,
//                     { color: 'white', backgroundColor: 'red' },
//                   ]}
//                 >
//                   {unreadCount}
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={() => setShowMenu(true)}
//           >
//             <Settings size={20} color={colors.text} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <Modal
//         visible={showMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowMenu(false)}
//       >
//         <View style={styles.overlay}>
//           <View style={[styles.menu, { backgroundColor: colors.surface }]}>
//             {menuItems.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[styles.menuItem, { borderBottomColor: colors.border }]}
//                 onPress={item.onPress}
//               >
//                 {item.icon}
//                 <Text style={[styles.menuText, { color: colors.text }]}>
//                   {item.title}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setShowMenu(false)}
//             >
//               <Text style={[styles.closeText, { color: colors.textSecondary }]}>
//                 Close
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//   },
//   leftSection: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     marginRight: 12,
//     padding: 4, // Add padding for easier touch
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   rightSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   iconButton: {
//     padding: 8,
//     position: 'relative',
//   },
//   badge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//   },
//   badgeText: {
//     fontSize: 6,
//     fontWeight: 'bold',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 100,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-end',
//     paddingTop: 100,
//     paddingRight: 20,
//   },
//   menu: {
//     borderRadius: 12,
//     minWidth: 200,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//   },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//   },
//   closeButton: {
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   closeText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

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
import {
  subscribeToNotices,
  subscribeToReadNotices,
} from '../services/dataService';

export function TopNavigation({ title, showBackButton = false, onPress }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAdmin, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [notices, setNotices] = useState([]);
  const [readNoticeIds, setReadNoticeIds] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

    const userId = user?.uid;
    const unsubscribeReadNotices = userId
      ? subscribeToReadNotices(userId, (newReadIds) =>
          setReadNoticeIds(newReadIds),
        )
      : () => {};

    return () => {
      unsubscribeNotices();
      unsubscribeReadNotices();
    };
  }, [user]);

  useEffect(() => {
    const readSet = new Set(readNoticeIds);
    const count = notices.filter((notice) => !readSet.has(notice.id)).length;
    setUnreadCount(count);
  }, [notices, readNoticeIds]);

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
  ];

  if (isAdmin) {
    menuItems.unshift({
      icon: <Settings size={20} color={colors.primary} />,
      title: 'Admin Panel',
      onPress: () => {
        setShowMenu(false);
        router.push('/profile/admin');
      },
    });
  }

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
          ) : (
            ' '
          )}
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
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
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
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
                <Text style={[styles.menuText, { color: colors.text }]}>
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
  logoPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
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
  menuTrigger: {
    width: 32,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'white',
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
