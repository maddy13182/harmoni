import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import MenuModal from '../components/MenuModal';
import { Ionicons } from '@expo/vector-icons';
import { createUserPreferences, getCurrentUser } from '../services/foundryClient';

interface PreferencesFormData {
  homeTimezone: string;
  userId: string;
  currentTimezone?: string;
  isTraveling?: boolean;
  calendarViewPreference?: string;
  weekStartsOn?: number;
  timeFormat?: string;
  dateFormat?: string;
  theme?: string;
  locale?: string;
  defaultEventPrivacy?: string;
  defaultEventDurationMinutes?: number;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
}

interface PreferencesSetupScreenProps {
  onPreferencesCreated: () => void;
  onError: (error: string) => void;
  onSignOut: () => void;
}

export default function PreferencesSetupScreen({ 
  onPreferencesCreated, 
  onError,
  onSignOut
}: PreferencesSetupScreenProps) {
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [formData, setFormData] = useState<PreferencesFormData>({
    homeTimezone: '',
    userId: '',
    currentTimezone: '',
    isTraveling: false,
    calendarViewPreference: 'month',
    weekStartsOn: 0, // Sunday
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    theme: 'auto',
    locale: 'en-US',
    defaultEventPrivacy: 'private',
    defaultEventDurationMinutes: 60,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
  });

  // Get current user for menu
  const currentUser = getCurrentUser();
  const userInfo = currentUser ? {
    name: currentUser.displayName,
    email: currentUser.email || '',
  } : undefined;

  useEffect(() => {
    // Set userId
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        userId: currentUser.userId
      }));
    }

    // Auto-detect timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFormData(prev => ({
      ...prev,
      homeTimezone: detectedTimezone,
      currentTimezone: detectedTimezone
    }));
  }, []);

  const showTimezoneSelector = () => {
    const buttons = timezoneOptions.map(timezone => ({
      text: timezone.replace('_', ' '),
      onPress: () => setFormData(prev => ({ 
        ...prev, 
        homeTimezone: timezone,
        currentTimezone: timezone 
      }))
    }));
    
    buttons.push({ text: 'Cancel', onPress: () => {} });
    
    Alert.alert(
      'Select Timezone',
      'Choose your home timezone:',
      buttons,
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.homeTimezone || !formData.userId) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Submitting preferences form:', formData);
      
      const result = await createUserPreferences(formData);
      
      console.log('✅ Preferences created successfully:', result);
      
      Alert.alert(
        'Success!',
        'Your preferences have been saved successfully.',
        [
          {
            text: 'Continue',
            onPress: onPreferencesCreated
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      Alert.alert('Error', errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const timezoneOptions = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const calendarViewOptions = [
    { label: 'Month View', value: 'month' },
    { label: 'Week View', value: 'week' },
    { label: 'Day View', value: 'day' },
    { label: 'Agenda View', value: 'agenda' },
  ];

  const weekStartOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
  ];

  const timeFormatOptions = [
    { label: '12 Hour (AM/PM)', value: '12h' },
    { label: '24 Hour', value: '24h' },
  ];

  const themeOptions = [
    { label: 'Auto (System)', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const privacyOptions = [
    { label: 'Private', value: 'private' },
    { label: 'Public', value: 'public' },
    { label: 'Family Only', value: 'family' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Menu Button */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Preferences Setup</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Let's Set Up Your Preferences</Text>
          <Text style={styles.subtitle}>
            Customize your calendar experience to match your needs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Time</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Home Timezone *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.homeTimezone}
                onValueChange={(itemValue: string) => setFormData(prev => ({ 
                  ...prev, 
                  homeTimezone: itemValue,
                  currentTimezone: itemValue 
                }))}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {timezoneOptions.map((timezone) => (
                  <Picker.Item 
                    key={timezone} 
                    label={timezone.replace('_', ' ')} 
                    value={timezone} 
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.hint}>Scroll to select your timezone</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Week Starts On</Text>
            <View style={styles.optionGroup}>
              {weekStartOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.weekStartsOn === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, weekStartsOn: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.weekStartsOn === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Time Format</Text>
            <View style={styles.optionGroup}>
              {timeFormatOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.timeFormat === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, timeFormat: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.timeFormat === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Calendar Preferences</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Default Calendar View</Text>
            <View style={styles.optionGroup}>
              {calendarViewOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.calendarViewPreference === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, calendarViewPreference: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.calendarViewPreference === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Default Event Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.defaultEventDurationMinutes?.toString() || ''}
              onChangeText={(text) => {
                // Allow empty string and valid numbers
                if (text === '' || /^\d+$/.test(text)) {
                  setFormData(prev => ({ 
                    ...prev, 
                    defaultEventDurationMinutes: text === '' ? 60 : parseInt(text)
                  }));
                }
              }}
              keyboardType="numeric"
              placeholder="60"
              selectTextOnFocus={true}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Default Event Privacy</Text>
            <View style={styles.optionGroup}>
              {privacyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.defaultEventPrivacy === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, defaultEventPrivacy: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.defaultEventPrivacy === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Appearance</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Theme</Text>
            <View style={styles.optionGroup}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.theme === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, theme: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.theme === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>Email Notifications</Text>
              <Text style={styles.hint}>Receive email alerts for events</Text>
            </View>
            <Switch
              value={formData.emailNotificationsEnabled}
              onValueChange={(value) => setFormData(prev => ({ ...prev, emailNotificationsEnabled: value }))}
              trackColor={{ false: Colors.neutral.gray, true: "#EF7674" }}
              thumbColor={formData.emailNotificationsEnabled ? Colors.neutral.white : Colors.neutral.lightGray}
            />
          </View>

          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.hint}>Receive push alerts on your device</Text>
            </View>
            <Switch
              value={formData.pushNotificationsEnabled}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pushNotificationsEnabled: value }))}
              trackColor={{ false: Colors.neutral.gray, true: "#EF7674" }}
              thumbColor={formData.pushNotificationsEnabled ? Colors.neutral.white : Colors.neutral.lightGray}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving Preferences...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change these preferences anytime in settings
          </Text>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSignOut={onSignOut}
        onSettings={() => {
          console.log('Settings pressed');
        }}
        userInfo={userInfo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl * 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  field: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: Layout.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    backgroundColor: Colors.background.primary,
  },
  optionButtonSelected: {
    backgroundColor: "#EF7674",
    borderColor: "#EF7674",
  },
  optionText: {
    fontSize: 13,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  submitButton: {
    backgroundColor: "#EF7674",
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
  },
  submitButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: Layout.spacing.sm,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background.primary,
    overflow: 'hidden',
  },
  picker: {
    height: 150,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: Colors.text.primary,
    height: 150,
  },
});
