import React, { useState, useEffect } from 'react';
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
  ScrollView,
  ActivityIndicator,
  FlatList,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { getCurrentUser } from '../services/foundry/cacheService';
import { getUserPreferences, updateUserPreferences, refreshUserPreferences } from '../services/foundryClient';
import UserPreferencesEditor from './UserPreferencesEditor';
import FamilyCalendarSelectorScreen from '../screens/FamilyCalendarSelectorScreen';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onCreateNewCalendar?: () => void;
  onCalendarChanged?: () => void;
  navigation?: any;
  userInfo?: {
    name: string;
    email: string;
    picture?: string;
  };
}

type ModalView = 'main' | 'settings' | 'user-preferences';

const { width, height } = Dimensions.get('window');

export default function MenuModal({ visible, onClose, onSignOut, onCreateNewCalendar, onCalendarChanged, navigation, userInfo }: MenuModalProps) {
  const slideAnim = React.useRef(new Animated.Value(width)).current;
  const [currentView, setCurrentView] = useState<ModalView>('main');
  const [preferences, setPreferences] = useState<any>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);
  
  // Edit mode state for each preference
  const [editedPrefs, setEditedPrefs] = useState<any>({});

  React.useEffect(() => {
    if (visible) {
      setCurrentView('main'); // Reset to main view when modal opens
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
    handleClose();
    setTimeout(() => {
      onSignOut();
    }, 300);
  };

  const handleClose = () => {
    setCurrentView('main'); // Reset to main view
    onClose();
  };

  const navigateToSettings = () => {
    setCurrentView('settings');
  };

  const navigateToUserPreferences = async () => {
    console.log('🔧 Navigating to User Preferences...');
    setCurrentView('user-preferences');
    await loadPreferences();
  };

  const loadPreferences = async () => {
    setLoadingPreferences(true);
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        console.log('📋 Loading user preferences...');
        const userPrefs = await getUserPreferences(currentUser.userId);
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const navigateBack = () => {
    if (currentView === 'settings' || currentView === 'user-preferences') {
      setCurrentView('main');
    }
  };

  const handleOpenCalendarSelector = () => {
    console.log('📅 Opening calendar selector...');
    setShowCalendarSelector(true);
  };

  const handleCloseCalendarSelector = () => {
    setShowCalendarSelector(false);
  };

  const handleCreateNewCalendar = () => {
    setShowCalendarSelector(false);
    handleClose();
    setTimeout(() => {
      if (onCreateNewCalendar) {
        onCreateNewCalendar();
      }
    }, 300);
  };

  const handleCalendarChangedInternal = () => {
    console.log('✅ Calendar changed, reloading...');
    if (onCalendarChanged) {
      onCalendarChanged();
    }
  };

  const formatValue = (value: any, type: 'boolean' | 'string' | 'number' = 'string') => {
    if (value === null || value === undefined) return 'Not set';
    
    switch (type) {
      case 'boolean':
        return value ? 'Enabled' : 'Disabled';
      case 'string':
        return value.toString().replace('_', ' ');
      case 'number':
        return value.toString();
      default:
        return value.toString();
    }
  };

  // Render Main Menu View
  const renderMainMenu = () => (
    <>
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
        <TouchableOpacity style={styles.menuItem} onPress={handleOpenCalendarSelector}>
          <Ionicons name="calendar-outline" size={24} color="#EF7674" />
          <Text style={styles.menuItemText}>Calendar</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="people-outline" size={24} color="#EF7674" />
          <Text style={styles.menuItemText}>Family Members</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#EF7674" />
          <Text style={styles.menuItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
          <Ionicons name="settings-outline" size={24} color="#EF7674" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#EF7674" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#EF7674" />
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
    </>
  );

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSavePreferences = (updatedPreferences: any) => {
    setPreferences(updatedPreferences);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Render User Preferences View
  const renderUserPreferencesView = () => {
    // If in edit mode, show the editor
    if (isEditMode) {
      return (
        <UserPreferencesEditor
          preferences={preferences}
          onSave={handleSavePreferences}
          onCancel={handleCancelEdit}
        />
      );
    }

    // Create flat data structure for FlatList
    const preferenceData = preferences ? [
      { type: 'section', title: '📍 Location & Time', key: 'section-location' },
      { type: 'item', icon: 'globe-outline', label: 'Home Timezone', value: preferences?.homeTimezone, key: 'home-timezone' },
      { type: 'item', icon: 'location-outline', label: 'Current Timezone', value: preferences?.currentTimezone, key: 'current-timezone' },
      { type: 'item', icon: 'airplane-outline', label: 'Traveling Mode', value: preferences?.isTraveling, valueType: 'boolean', key: 'traveling-mode' },
      { type: 'item', icon: 'calendar-outline', label: 'Week Starts On', value: preferences?.weekStartsOn === 0 ? 'Sunday' : 'Monday', key: 'week-starts' },
      { type: 'item', icon: 'time-outline', label: 'Time Format', value: preferences?.timeFormat === '12h' ? '12 Hour (AM/PM)' : '24 Hour', key: 'time-format' },
      { type: 'item', icon: 'today-outline', label: 'Date Format', value: preferences?.dateFormat, key: 'date-format' },
      
      { type: 'section', title: '📅 Calendar Preferences', key: 'section-calendar' },
      { type: 'item', icon: 'grid-outline', label: 'Default Calendar View', value: preferences?.calendarViewPreference, key: 'calendar-view' },
      { type: 'item', icon: 'timer-outline', label: 'Default Event Duration', value: preferences?.defaultEventDurationMinutes ? `${preferences.defaultEventDurationMinutes} minutes` : 'Not set', key: 'event-duration' },
      { type: 'item', icon: 'lock-closed-outline', label: 'Default Event Privacy', value: preferences?.defaultEventPrivacy, key: 'event-privacy' },
      
      { type: 'section', title: '🔔 Notifications', key: 'section-notifications' },
      { type: 'item', icon: 'mail-outline', label: 'Email Notifications', value: preferences?.emailNotificationsEnabled, valueType: 'boolean', key: 'email-notif' },
      { type: 'item', icon: 'notifications-outline', label: 'Push Notifications', value: preferences?.pushNotificationsEnabled, valueType: 'boolean', key: 'push-notif' },
    ] : [];

    const PreferenceItem = ({ 
      icon, 
      label, 
      value, 
      type = 'string' 
    }: { 
      icon: string; 
      label: string; 
      value: any; 
      type?: 'boolean' | 'string' | 'number';
    }) => (
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceIcon}>
          <Ionicons name={icon as any} size={18} color="#EF7674" />
        </View>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceLabel}>{label}</Text>
          <Text style={styles.preferenceValue}>{formatValue(value, type)}</Text>
        </View>
      </View>
    );

    return (
      <View style={styles.nestedViewContainer}>
        <View style={styles.nestedViewHeader}>
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.nestedViewTitle}>User Preferences</Text>
          <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#EF7674" />
          </TouchableOpacity>
        </View>

        {loadingPreferences ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF7674" />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        ) : !preferences ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>No preferences found</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.preferencesScrollView}
            contentContainerStyle={styles.preferencesScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {preferenceData.map((item) => {
              if (item.type === 'section') {
                return (
                  <View key={item.key} style={styles.preferencesSection}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                  </View>
                );
              }
              return (
                <PreferenceItem 
                  key={item.key}
                  icon={item.icon || ''} 
                  label={item.label || ''} 
                  value={item.value} 
                  type={item.valueType as any || 'string'}
                />
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // Render Settings View
  const renderSettingsView = () => (
    <View style={styles.nestedViewContainer}>
      <View style={styles.nestedViewHeader}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.nestedViewTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.nestedViewContent}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={navigateToUserPreferences}
        >
          <View style={styles.settingIcon}>
            <Ionicons name="person-outline" size={24} color="#EF7674" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>User Preferences</Text>
            <Text style={styles.settingSubtitle}>Timezone, calendar view, notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="notifications-outline" size={24} color="#EF7674" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Notification Settings</Text>
            <Text style={styles.settingSubtitle}>Email and push notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="shield-outline" size={24} color="#EF7674" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Privacy & Security</Text>
            <Text style={styles.settingSubtitle}>Data privacy settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="information-circle-outline" size={24} color="#EF7674" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.settingSubtitle}>App version and information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
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
              {/* Header with X button - always visible */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Conditional content based on currentView */}
              {currentView === 'main' && renderMainMenu()}
              {currentView === 'settings' && renderSettingsView()}
              {currentView === 'user-preferences' && renderUserPreferencesView()}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Calendar Selector Modal */}
      {showCalendarSelector && (
        <Modal
          visible={showCalendarSelector}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleCloseCalendarSelector}
        >
          <FamilyCalendarSelectorScreen
            onClose={handleCloseCalendarSelector}
            onCreateNew={handleCreateNewCalendar}
            onCalendarChanged={handleCalendarChangedInternal}
            navigation={navigation}
          />
        </Modal>
      )}
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
    backgroundColor: "#EF7674",
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
  nestedViewContainer: {
    flex: 1,
  },
  nestedViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  nestedViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    padding: Layout.spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  nestedViewContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.mint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.md,
  },
  preferencesSection: {
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xs,
  },
  preferenceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.mint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  preferencesScrollView: {
    flex: 1,
  },
  preferencesScrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl * 4,
  },
});
