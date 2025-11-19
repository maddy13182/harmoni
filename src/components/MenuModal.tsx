import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onSettings: () => void;
  userInfo?: {
    name: string;
    email: string;
    picture?: string;
  };
}

const { width, height } = Dimensions.get('window');

export default function MenuModal({ visible, onClose, onSignOut, onSettings, userInfo }: MenuModalProps) {
  const slideAnim = React.useRef(new Animated.Value(width)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      onSignOut();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* User Info */}
              {userInfo && (
                <View style={styles.userSection}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userInfo.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <Text style={styles.userEmail}>{userInfo.email}</Text>
                  </View>
                </View>
              )}

              {/* Menu Items */}
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="calendar-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>Calendar</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="people-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>Family Members</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="notifications-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>Notifications</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onSettings(); }}>
                  <Ionicons name="settings-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>Settings</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="help-circle-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>Help & Support</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="information-circle-outline" size={24} color={#EF7674} />
                  <Text style={styles.menuItemText}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
                  <Ionicons name="log-out-outline" size={24} color={Colors.semantic.error} />
                  <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Harmoni Family Calendar</Text>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: width * 0.85,
    height: height,
    backgroundColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24) + Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Layout.spacing.sm,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: #EF7674,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  menuItems: {
    flex: 1,
    paddingTop: Layout.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Layout.spacing.md,
  },
  signOutItem: {
    marginTop: Layout.spacing.sm,
  },
  signOutText: {
    color: Colors.semantic.error,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginVertical: Layout.spacing.sm,
    marginHorizontal: Layout.spacing.lg,
  },
  footer: {
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
