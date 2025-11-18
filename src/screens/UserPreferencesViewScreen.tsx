import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { getUserPreferences, getCurrentUser } from '../services/foundryClient';

interface UserPreferencesViewScreenProps {
  onBack: () => void;
  onEdit: () => void;
}

export default function UserPreferencesViewScreen({ 
  onBack, 
  onEdit 
}: UserPreferencesViewScreenProps) {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('No user found in cache');
        return;
      }

      console.log('🔍 Loading user preferences for display...');
      const userPrefs = await getUserPreferences(currentUser.userId);
      
      if (userPrefs) {
        console.log('✅ User preferences loaded:', userPrefs);
        setPreferences(userPrefs);
      } else {
        console.log('📭 No preferences found');
        setError('No preferences found');
      }
    } catch (err) {
      console.error('❌ Error loading preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUserPreferences();
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
        <Ionicons name={icon as any} size={20} color={Colors.primary.main} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceValue}>{formatValue(value, type)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>User Preferences</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>User Preferences</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.semantic.error} />
          <Text style={styles.errorTitle}>Unable to Load Preferences</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>User Preferences</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Time</Text>
          
          <PreferenceItem
            icon="globe-outline"
            label="Home Timezone"
            value={preferences?.homeTimezone}
          />
          
          <PreferenceItem
            icon="location-outline"
            label="Current Timezone"
            value={preferences?.currentTimezone}
          />
          
          <PreferenceItem
            icon="airplane-outline"
            label="Traveling Mode"
            value={preferences?.isTraveling}
            type="boolean"
          />
          
          <PreferenceItem
            icon="calendar-outline"
            label="Week Starts On"
            value={preferences?.weekStartsOn === 0 ? 'Sunday' : 'Monday'}
          />
          
          <PreferenceItem
            icon="time-outline"
            label="Time Format"
            value={preferences?.timeFormat === '12h' ? '12 Hour (AM/PM)' : '24 Hour'}
          />
          
          <PreferenceItem
            icon="today-outline"
            label="Date Format"
            value={preferences?.dateFormat}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Calendar Preferences</Text>
          
          <PreferenceItem
            icon="grid-outline"
            label="Default Calendar View"
            value={preferences?.calendarViewPreference}
          />
          
          <PreferenceItem
            icon="timer-outline"
            label="Default Event Duration"
            value={preferences?.defaultEventDurationMinutes ? `${preferences.defaultEventDurationMinutes} minutes` : 'Not set'}
          />
          
          <PreferenceItem
            icon="lock-closed-outline"
            label="Default Event Privacy"
            value={preferences?.defaultEventPrivacy}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Appearance</Text>
          
          <PreferenceItem
            icon="color-palette-outline"
            label="Theme"
            value={preferences?.theme}
          />
          
          <PreferenceItem
            icon="language-outline"
            label="Locale"
            value={preferences?.locale}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <PreferenceItem
            icon="mail-outline"
            label="Email Notifications"
            value={preferences?.emailNotificationsEnabled}
            type="boolean"
          />
          
          <PreferenceItem
            icon="notifications-outline"
            label="Push Notifications"
            value={preferences?.pushNotificationsEnabled}
            type="boolean"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Metadata</Text>
          
          <PreferenceItem
            icon="create-outline"
            label="Created At"
            value={preferences?.createdAt ? new Date(preferences.createdAt).toLocaleString() : 'Not available'}
          />
          
          <PreferenceItem
            icon="refresh-outline"
            label="Last Updated"
            value={preferences?.updatedAt ? new Date(preferences.updatedAt).toLocaleString() : 'Not available'}
          />
          
          <PreferenceItem
            icon="key-outline"
            label="Preference ID"
            value={preferences?.userPreferenceId || preferences?.$primaryKey || 'Not available'}
          />
        </View>

        <TouchableOpacity style={styles.editPreferencesButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={Colors.text.inverse} />
          <Text style={styles.editPreferencesButtonText}>Edit Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    padding: Layout.spacing.sm,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  retryButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xs,
  },
  preferenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  editPreferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.lg,
  },
  editPreferencesButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Layout.spacing.sm,
  },
});
