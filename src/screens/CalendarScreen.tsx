/**
 * Calendar Screen - Main Calendar View
 * 
 * Displays family calendar with events, supports multiple family views,
 * and integrates with cached preferences and family groups
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import { initializeCalendar, initializeCalendarAfterGroupCreation, loadCalendarEvents } from '../services/calendarService';
import { getCurrentUserId } from '../services/foundry/cacheService';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import type { CalendarEvent, FamilyGroup, CalendarViewResponse, FamilyGroupWithMembers } from '../types';

interface CalendarScreenProps {
  onSignOut: () => void;
  familyGroupName?: string;
}

export default function CalendarScreen({ onSignOut, familyGroupName }: CalendarScreenProps) {
  // ============================================
  // STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarViewResponse | null>(null);
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  // ============================================
  // LOAD CALENDAR ON MOUNT
  // ============================================
  useEffect(() => {
    loadCalendar();
  }, []);

  // ============================================
  // RELOAD EVENTS WHEN SELECTION CHANGES
  // ============================================
  useEffect(() => {
    if (selectedFamilyIds.length > 0 && !loading) {
      reloadEvents();
    }
  }, [selectedFamilyIds, viewType]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  async function loadCalendar() {
    try {
      setLoading(true);

      const userId = getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      // Initialize calendar (loads families + default events)
      const data = await initializeCalendarAfterGroupCreation(userId);

      setFamilyGroups(data.familyGroups);
      setSelectedFamilyIds(data.defaultFamilyIds);
      setCalendarData(data.calendarData);
      setViewType(data.viewType);

    } catch (error: any) {
      console.error('[CalendarScreen] Failed to load calendar:', error);
      
      // Handle specific error for missing default calendar
      if (error.message === 'NO_DEFAULT_CALENDAR') {
        Alert.alert(
          'No Default Calendar',
          'You need to set a default family calendar in your preferences to view the calendar.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to load calendar');
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // RELOAD EVENTS (when families/view changes)
  // ============================================
  async function reloadEvents() {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const data = await loadCalendarEvents(
        userId,
        selectedFamilyIds,
        viewType
      );

      setCalendarData(data);
    } catch (error: any) {
      console.error('[CalendarScreen] Failed to reload events:', error);
      Alert.alert('Error', 'Failed to reload events');
    }
  }

  // ============================================
  // PULL TO REFRESH
  // ============================================
  async function onRefresh() {
    setRefreshing(true);
    try {
      await reloadEvents();
    } finally {
      setRefreshing(false);
    }
  }

  // ============================================
  // TOGGLE FAMILY SELECTION
  // ============================================
  function toggleFamilySelection(familyId: string) {
    setSelectedFamilyIds(prev => {
      // Must have at least one family selected
      if (prev.includes(familyId) && prev.length === 1) {
        Alert.alert('Notice', 'You must have at least one calendar selected');
        return prev;
      }

      if (prev.includes(familyId)) {
        return prev.filter(id => id !== familyId);
      } else {
        return [...prev, familyId];
      }
    });
  }

  // ============================================
  // CHANGE VIEW TYPE
  // ============================================
  function changeViewType(newViewType: 'day' | 'week' | 'month') {
    setViewType(newViewType);
  }

  // ============================================
  // GET MARKED DATES FOR CALENDAR
  // ============================================
  function getMarkedDates() {
    if (!calendarData?.events) return {};

    const marked: any = {};

    calendarData.events.forEach((event: CalendarEvent) => {
      const dateKey = event.startsAtUtc.split('T')[0];

      if (!marked[dateKey]) {
        marked[dateKey] = {
          marked: true,
          dots: [],
        };
      }

      marked[dateKey].dots.push({
        key: event.eventId,
        color: event.primaryFamilyGroupColor,
      });
    });

    // Highlight selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = Colors.primary.main;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary.main,
      };
    }

    return marked;
  }

  // ============================================
  // GET EVENTS FOR SELECTED DATE
  // ============================================
  function getEventsForDate(date: string): CalendarEvent[] {
    if (!calendarData?.events) return [];
    
    return calendarData.events.filter((event: CalendarEvent) => {
      const eventDate = event.startsAtUtc.split('T')[0];
      return eventDate === date;
    });
  }

  // ============================================
  // RENDER LOADING STATE
  // ============================================
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading your calendar...</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER NO FAMILIES STATE
  // ============================================
  if (familyGroups.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top']}>
        <Text style={styles.emptyTitle}>No Family Calendars</Text>
        <Text style={styles.emptyText}>
          Create your first family calendar to get started!
        </Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Family Calendar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER MAIN UI
  // ============================================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📅 My Calendar</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* FAMILY SELECTOR */}
        <View style={styles.familySelector}>
          <Text style={styles.sectionTitle}>Calendars</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {familyGroups.map(family => (
              <TouchableOpacity
                key={family.familyGroupId}
                style={[
                  styles.familyChip,
                  selectedFamilyIds.includes(family.familyGroupId) && styles.familyChipSelected,
                  { borderColor: family.groupColor || Colors.primary.main },
                ]}
                onPress={() => toggleFamilySelection(family.familyGroupId)}
              >
                <View style={[
                  styles.familyColorDot, 
                  { backgroundColor: family.groupColor || Colors.primary.main }
                ]} />
                <Text
                  style={[
                    styles.familyChipText,
                    selectedFamilyIds.includes(family.familyGroupId) && styles.familyChipTextSelected,
                  ]}
                >
                  {family.groupName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* VIEW TOGGLE */}
        <View style={styles.viewToggle}>
          {(['day', 'week', 'month'] as const).map(view => (
            <TouchableOpacity
              key={view}
              style={[styles.viewButton, viewType === view && styles.viewButtonActive]}
              onPress={() => changeViewType(view)}
            >
              <Text style={[
                styles.viewButtonText, 
                viewType === view && styles.viewButtonTextActive
              ]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CALENDAR */}
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          markingType="multi-dot"
          theme={{
            todayTextColor: Colors.primary.main,
            selectedDayBackgroundColor: Colors.primary.main,
            dotColor: Colors.primary.main,
            arrowColor: Colors.primary.main,
          }}
        />

        {/* EVENTS FOR SELECTED DATE */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>

          {getEventsForDate(selectedDate).length === 0 ? (
            <Text style={styles.noEventsText}>No events for this day</Text>
          ) : (
            getEventsForDate(selectedDate).map((event: CalendarEvent) => (
              <EventCard key={event.eventId} event={event} />
            ))
          )}
        </View>

        {/* COLOR LEGEND */}
        {calendarData?.familyGroupsWithMembers && calendarData.familyGroupsWithMembers.length > 0 && (
          <View style={styles.legendSection}>
            <Text style={styles.sectionTitle}>Who's Who</Text>
            {calendarData.familyGroupsWithMembers.map((family: FamilyGroupWithMembers) => (
              <View key={family.familyGroupId} style={styles.legendFamily}>
                <Text style={styles.legendFamilyName}>{family.familyGroupName}</Text>
                {family.members.map((member) => (
                  <View key={member.userId} style={styles.legendMember}>
                    <View style={[styles.legendColorDot, { backgroundColor: member.color }]} />
                    <Text style={styles.legendMemberName}>{member.displayName}</Text>
                    <Text style={styles.legendMemberRole}>({member.relationshipType})</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// EVENT CARD COMPONENT
// ============================================
function EventCard({ event }: { event: CalendarEvent }) {
  const isBusy = event.visibilityLevel === 'busy_only';

  function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return (
    <View style={[styles.eventCard, { borderLeftColor: event.primaryFamilyGroupColor }]}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      
      <Text style={styles.eventTime}>
        {event.isAllDay 
          ? 'All Day' 
          : `${formatTime(event.startsAtUtc)} - ${formatTime(event.endsAtUtc)}`
        }
      </Text>

      {!isBusy && event.location && (
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
      )}

      {!isBusy && event.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      <View style={styles.attendeesSection}>
        {event.attendees.map((attendee, index) => (
          <View key={`${attendee.userId}-${index}`} style={styles.attendee}>
            <View style={[styles.attendeeColorDot, { backgroundColor: attendee.color }]} />
            <Text style={styles.attendeeName}>{attendee.displayName}</Text>
            {isBusy && <Text style={styles.busyBadge}>BUSY</Text>}
          </View>
        ))}
      </View>

      <View style={styles.familyBadge}>
        <Text style={styles.familyBadgeText}>{event.primaryFamilyGroupName}</Text>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: Colors.background.primary,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  createButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  menuButton: {
    padding: Layout.spacing.xs,
  },
  familySelector: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  familyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    marginRight: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.round,
    borderWidth: 2,
    backgroundColor: Colors.background.secondary,
  },
  familyChipSelected: {
    backgroundColor: Colors.primary.light,
  },
  familyColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.xs,
  },
  familyChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  familyChipTextSelected: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  viewButton: {
    flex: 1,
    paddingVertical: Layout.spacing.xs,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.xs / 2,
    backgroundColor: Colors.background.primary,
  },
  viewButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  viewButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  eventsSection: {
    padding: Layout.spacing.md,
  },
  noEventsText: {
    textAlign: 'center',
    color: Colors.text.tertiary,
    fontSize: 14,
    marginTop: Layout.spacing.md,
  },
  eventCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs / 2,
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs / 2,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.xs,
  },
  attendeesSection: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  attendee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
  },
  attendeeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Layout.spacing.xs,
  },
  attendeeName: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  busyBadge: {
    fontSize: 10,
    color: Colors.semantic.error,
    fontWeight: 'bold',
    backgroundColor: '#FFE0DB',
    paddingHorizontal: Layout.spacing.xs / 2,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
  },
  familyBadge: {
    marginTop: Layout.spacing.xs,
    alignSelf: 'flex-start',
  },
  familyBadgeText: {
    fontSize: 12,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  legendSection: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    marginTop: Layout.spacing.xs,
  },
  legendFamily: {
    marginBottom: Layout.spacing.md,
  },
  legendFamilyName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  legendMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
    marginLeft: Layout.spacing.xs,
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.xs,
  },
  legendMemberName: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: Layout.spacing.xs / 2,
  },
  legendMemberRole: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
