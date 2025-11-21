/**
 * User Preferences Editor Component
 * 
 * Provides edit functionality for user preferences with various input controls:
 * - Timezone pickers (home and current)
 * - Toggle switches (traveling mode, notifications)
 * - Segmented controls (week starts, time format, calendar view)
 * - Dropdown picker (event privacy)
 * - Text input (event duration)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { updateUserPreferences, refreshUserPreferences } from '../services/foundry';
import { getCurrentUser } from '../services/foundry/cacheService';

interface UserPreferencesEditorProps {
  preferences: any;
  onSave: (updatedPreferences: any) => void;
  onCancel: () => void;
}

// Common timezone list
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'UTC',
];

export default function UserPreferencesEditor({
  preferences,
  onSave,
  onCancel,
}: UserPreferencesEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state for iOS timezone pickers
  const [showHomeTimezoneModal, setShowHomeTimezoneModal] = useState(false);
  const [showCurrentTimezoneModal, setShowCurrentTimezoneModal] = useState(false);
  const [tempHomeTimezone, setTempHomeTimezone] = useState('');
  const [tempCurrentTimezone, setTempCurrentTimezone] = useState('');
  
  // Edit state for each preference
  const [homeTimezone, setHomeTimezone] = useState(preferences?.homeTimezone || 'America/New_York');
  const [currentTimezone, setCurrentTimezone] = useState(preferences?.currentTimezone || 'America/New_York');
  const [isTraveling, setIsTraveling] = useState(preferences?.isTraveling || false);
  const [weekStartsOn, setWeekStartsOn] = useState(preferences?.weekStartsOn || 0);
  const [timeFormat, setTimeFormat] = useState(preferences?.timeFormat || '12h');
  const [calendarView, setCalendarView] = useState(preferences?.calendarViewPreference || 'month');
  const [eventPrivacy, setEventPrivacy] = useState(preferences?.defaultEventPrivacy || 'full_details');
  const [eventDuration, setEventDuration] = useState(
    preferences?.defaultEventDurationMinutes?.toString() || '60'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    preferences?.emailNotificationsEnabled ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    preferences?.pushNotificationsEnabled ?? true
  );

  const handleSave = async () => {
    // Validate event duration
    const duration = parseInt(eventDuration);
    if (isNaN(duration) || duration < 1 || duration > 1440) {
      Alert.alert('Invalid Duration', 'Event duration must be between 1 and 1440 minutes (24 hours)');
      return;
    }

    setIsSaving(true);
    try {
      console.log('📋 Full preferences object:', JSON.stringify(preferences, null, 2));
      console.log('🔑 Preferences keys:', Object.keys(preferences || {}));

      // Extract userPreferenceId - it's an object reference, so we need to get the actual ID
      let preferenceId: string | null = null;
      
      if (preferences?.userPreferenceId) {
        // If it's an object with __primaryKey or $rid
        if (typeof preferences.userPreferenceId === 'object') {
          preferenceId = preferences.userPreferenceId.__primaryKey || 
                        preferences.userPreferenceId.$rid ||
                        preferences.userPreferenceId.id;
          console.log('📦 Extracted ID from userPreferenceId object:', preferenceId);
        } else {
          // If it's already a string
          preferenceId = preferences.userPreferenceId;
          console.log('📦 Using userPreferenceId string:', preferenceId);
        }
      }
      
      // Fallback to other possible ID fields
      if (!preferenceId) {
        preferenceId = preferences?.__primaryKey || 
                      preferences?.$rid ||
                      preferences?.id;
        console.log('📦 Using fallback ID:', preferenceId);
      }
      
      if (!preferenceId) {
        console.error('❌ Could not find preference ID in object:', preferences);
        throw new Error('Preference ID not found. Please try refreshing the preferences.');
      }

      console.log('💾 Saving preferences with ID:', preferenceId);

      // Prepare updates object
      // Note: isTraveling is NOT included because it's not a configurable parameter in the Foundry action
      const updates = {
        homeTimezone,
        currentTimezone,
        weekStartsOn,
        timeFormat,
        calendarViewPreference: calendarView,
        defaultEventPrivacy: eventPrivacy,
        defaultEventDurationMinutes: duration,
        emailNotificationsEnabled: emailNotifications,
        pushNotificationsEnabled: pushNotifications,
      };

      console.log('📝 Updates:', updates);

      // Call update API
      await updateUserPreferences(preferenceId, updates);

      // Get userId from preferences object (since cache might be expired)
      const userId = preferences?.userId;
      if (!userId) {
        throw new Error('User ID not found in preferences');
      }

      // Refresh preferences from Foundry
      const refreshedPrefs = await refreshUserPreferences(userId);

      console.log('✅ Preferences saved successfully');
      
      // Call onSave callback with refreshed preferences
      onSave(refreshedPrefs);
      
      Alert.alert('Success', 'Your preferences have been saved');
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to save preferences: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  // iOS Modal Picker Handlers
  const openHomeTimezoneModal = () => {
    setTempHomeTimezone(homeTimezone);
    setShowHomeTimezoneModal(true);
  };

  const confirmHomeTimezone = () => {
    setHomeTimezone(tempHomeTimezone);
    setShowHomeTimezoneModal(false);
  };

  const openCurrentTimezoneModal = () => {
    setTempCurrentTimezone(currentTimezone);
    setShowCurrentTimezoneModal(true);
  };

  const confirmCurrentTimezone = () => {
    setCurrentTimezone(tempCurrentTimezone);
    setShowCurrentTimezoneModal(false);
  };

  // Render timezone picker based on platform
  const renderTimezonePicker = (
    label: string,
    value: string,
    onPress: () => void
  ) => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          style={styles.iosPickerButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.iosPickerButtonText}>{value}</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      );
    } else {
      // Android uses inline picker
      return (
        <View style={styles.compactPickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              if (label === 'Home Timezone') {
                setHomeTimezone(itemValue);
              } else {
                setCurrentTimezone(itemValue);
              }
            }}
            style={styles.compactPicker}
          >
            {TIMEZONES.map((tz) => (
              <Picker.Item key={tz} label={tz} value={tz} />
            ))}
          </Picker>
        </View>
      );
    }
  };

  // iOS Modal Picker Component
  const renderTimezoneModal = (
    visible: boolean,
    value: string,
    onValueChange: (value: string) => void,
    onConfirm: () => void,
    onCancel: () => void,
    title: string
  ) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onCancel} style={styles.modalButton}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onConfirm} style={styles.modalButton}>
                <Text style={styles.modalConfirmText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            {/* Picker */}
            <View style={styles.modalPickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onValueChange}
                style={styles.modalPicker}
                itemStyle={styles.modalPickerItem}
              >
                {TIMEZONES.map((tz) => (
                  <Picker.Item key={tz} label={tz} value={tz} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Save/Cancel */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Preferences</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#EF7674" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Location & Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Time</Text>

          {/* Home Timezone Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Home Timezone</Text>
            {renderTimezonePicker('Home Timezone', homeTimezone, openHomeTimezoneModal)}
          </View>

          {/* Current Timezone Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Current Timezone</Text>
            {renderTimezonePicker('Current Timezone', currentTimezone, openCurrentTimezoneModal)}
          </View>

          {/* Traveling Mode Toggle */}
          <View style={styles.fieldContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.fieldLabel}>Traveling Mode</Text>
              <Switch
                value={isTraveling}
                onValueChange={setIsTraveling}
                trackColor={{ false: Colors.neutral.lightGray, true: '#EF7674' }}
                thumbColor={Colors.background.primary}
              />
            </View>
            <Text style={styles.fieldHint}>
              Enable when traveling to use current timezone
            </Text>
          </View>

          {/* Week Starts On */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Week Starts On</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  weekStartsOn === 0 && styles.segmentButtonActive,
                ]}
                onPress={() => setWeekStartsOn(0)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    weekStartsOn === 0 && styles.segmentTextActive,
                  ]}
                >
                  Sunday
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  weekStartsOn === 1 && styles.segmentButtonActive,
                ]}
                onPress={() => setWeekStartsOn(1)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    weekStartsOn === 1 && styles.segmentTextActive,
                  ]}
                >
                  Monday
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Format */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Time Format</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  timeFormat === '12h' && styles.segmentButtonActive,
                ]}
                onPress={() => setTimeFormat('12h')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    timeFormat === '12h' && styles.segmentTextActive,
                  ]}
                >
                  12 Hour
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  timeFormat === '24h' && styles.segmentButtonActive,
                ]}
                onPress={() => setTimeFormat('24h')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    timeFormat === '24h' && styles.segmentTextActive,
                  ]}
                >
                  24 Hour
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Calendar Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Calendar Preferences</Text>

          {/* Default Calendar View */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Default Calendar View</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  calendarView === 'day' && styles.segmentButtonActive,
                ]}
                onPress={() => setCalendarView('day')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    calendarView === 'day' && styles.segmentTextActive,
                  ]}
                >
                  Day
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  calendarView === 'week' && styles.segmentButtonActive,
                ]}
                onPress={() => setCalendarView('week')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    calendarView === 'week' && styles.segmentTextActive,
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  calendarView === 'month' && styles.segmentButtonActive,
                ]}
                onPress={() => setCalendarView('month')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    calendarView === 'month' && styles.segmentTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Default Event Duration */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Default Event Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={eventDuration}
              onChangeText={setEventDuration}
              keyboardType="number-pad"
              placeholder="60"
              maxLength={4}
            />
            <Text style={styles.fieldHint}>
              Enter duration in minutes (1-1440)
            </Text>
          </View>

          {/* Default Event Privacy */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Default Event Privacy</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventPrivacy}
                onValueChange={setEventPrivacy}
                style={styles.picker}
              >
                <Picker.Item label="Full Details" value="full_details" />
                <Picker.Item label="Busy Only" value="busy_only" />
                <Picker.Item label="Private" value="private" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>

          {/* Email Notifications Toggle */}
          <View style={styles.fieldContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.fieldLabel}>Email Notifications</Text>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: Colors.neutral.lightGray, true: '#EF7674' }}
                thumbColor={Colors.background.primary}
              />
            </View>
          </View>

          {/* Push Notifications Toggle */}
          <View style={styles.fieldContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.fieldLabel}>Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: Colors.neutral.lightGray, true: '#EF7674' }}
                thumbColor={Colors.background.primary}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* iOS Timezone Modals */}
      {Platform.OS === 'ios' && (
        <>
          {renderTimezoneModal(
            showHomeTimezoneModal,
            tempHomeTimezone,
            setTempHomeTimezone,
            confirmHomeTimezone,
            () => setShowHomeTimezoneModal(false),
            'Select Home Timezone'
          )}
          {renderTimezoneModal(
            showCurrentTimezoneModal,
            tempCurrentTimezone,
            setTempCurrentTimezone,
            confirmCurrentTimezone,
            () => setShowCurrentTimezoneModal(false),
            'Select Current Timezone'
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
    backgroundColor: Colors.background.secondary,
  },
  headerButton: {
    padding: Layout.spacing.sm,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF7674',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl * 4,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  fieldContainer: {
    marginBottom: Layout.spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.xs,
  },
  pickerContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.sm,
  },
  segmentButtonActive: {
    backgroundColor: '#EF7674',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  segmentTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: 15,
    color: Colors.text.primary,
  },
  compactPickerContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    overflow: 'hidden',
  },
  compactPicker: {
    height: 50,
  },
  // iOS Picker Button Styles
  iosPickerButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iosPickerButtonText: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Layout.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalButton: {
    padding: Layout.spacing.sm,
    minWidth: 60,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalCancelText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF7674',
  },
  modalPickerContainer: {
    height: 216,
  },
  modalPicker: {
    width: '100%',
    height: 216,
  },
  modalPickerItem: {
    fontSize: 18,
    height: 216,
  },
});
