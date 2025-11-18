import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { CalendarEvent } from '../types';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import MenuModal from '../components/MenuModal';
import SettingsScreen from './SettingsScreen';
import UserPreferencesViewScreen from './UserPreferencesViewScreen';
import PreferencesSetupScreen from './PreferencesSetupScreen';
import { getUserInfo, signOut, UserInfo } from '../services/authService';

interface CalendarScreenProps {
  onSignOut: () => void;
  familyGroupName?: string;
}

type ScreenState = 'calendar' | 'settings' | 'user-preferences' | 'edit-preferences';

export default function CalendarScreen({ onSignOut, familyGroupName }: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('calendar');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const info = await getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // Mock events for demonstration
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: Colors.primary.main,
    },
  };

  const eventsForSelectedDate = events.filter(event => {
    const eventDate = format(event.startDate, 'yyyy-MM-dd');
    return eventDate === selectedDate;
  });

  // Navigation handlers
  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleUserPreferences = () => {
    setCurrentScreen('user-preferences');
  };

  const handleEditPreferences = () => {
    setCurrentScreen('edit-preferences');
  };

  const handleBackToCalendar = () => {
    setCurrentScreen('calendar');
  };

  const handleBackToSettings = () => {
    setCurrentScreen('settings');
  };

  const handlePreferencesUpdated = () => {
    setCurrentScreen('user-preferences');
  };

  const handlePreferencesError = (error: string) => {
    console.error('Preferences error:', error);
    setCurrentScreen('user-preferences');
  };

  // Render different screens based on current state
  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        onBack={handleBackToCalendar}
        onUserPreferences={handleUserPreferences}
        onNotificationSettings={() => console.log('Notification settings')}
        onPrivacySettings={() => console.log('Privacy settings')}
        onAbout={() => console.log('About')}
      />
    );
  }

  if (currentScreen === 'user-preferences') {
    return (
      <UserPreferencesViewScreen
        onBack={handleBackToSettings}
        onEdit={handleEditPreferences}
      />
    );
  }

  if (currentScreen === 'edit-preferences') {
    return (
      <PreferencesSetupScreen
        onPreferencesCreated={handlePreferencesUpdated}
        onError={handlePreferencesError}
      />
    );
  }

  // Default calendar screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {familyGroupName ? `${familyGroupName} Calendar` : 'Family Calendar'}
        </Text>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#007AFF',
        }}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Events for {format(new Date(selectedDate), 'MMMM d, yyyy')}
        </Text>
        
        <ScrollView style={styles.eventsList}>
          {eventsForSelectedDate.length === 0 ? (
            <Text style={styles.noEvents}>No events scheduled</Text>
          ) : (
            eventsForSelectedDate.map(event => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
                <Text style={styles.eventTime}>
                  {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSignOut={handleSignOut}
        onSettings={handleSettings}
        userInfo={userInfo || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 60,
    paddingBottom: Layout.spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.bold,
    color: Colors.text.primary,
  },
  menuButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  eventsContainer: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  eventsTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  eventsList: {
    flex: 1,
  },
  noEvents: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
  },
  eventCard: {
    backgroundColor: Colors.background.primary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    ...Layout.shadow.sm,
  },
  eventTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary.main,
  },
  addButton: {
    backgroundColor: Colors.primary.main,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    marginTop: Layout.spacing.md,
    ...Layout.shadow.sm,
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
  },
});
