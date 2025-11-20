/**
 * DayView Component
 * 
 * Displays single day view with hourly timeline (6 AM - 11 PM)
 * Shows full event details with all attendees
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarEvent, FamilyMemberCalendar } from '../../types';
import EventDetailPopup from './EventDetailPopup';
import { 
  getEventsForDate, 
  sortEventsByTime,
  formatTime,
  formatDate,
  getTimeSlots,
} from '../../utils/calendarHelpers';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

const HOUR_HEIGHT = 60; // Match WeekView for consistency

interface DayViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  familyMembers: FamilyMemberCalendar[];
  onDateSelect?: (date: string) => void;
  onEventTap?: (event: CalendarEvent) => void;
}

export default function DayView({
  selectedDate,
  events,
  familyMembers,
  onDateSelect,
  onEventTap,
}: DayViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const lastTapRef = useRef<{ eventId: string; time: number } | null>(null);
  
  const timeSlots = getTimeSlots();
  const dayEvents = sortEventsByTime(getEventsForDate(selectedDate, events));
  
  // Scroll to 6 AM by default (or current time if between 6 AM - 11 PM)
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Default to 6 AM (hour 6 from midnight = 6 * HOUR_HEIGHT)
    let scrollPosition = 6 * HOUR_HEIGHT;
    
    // If current time is between 6 AM and 11 PM, scroll to current hour
    if (currentHour >= 6 && currentHour <= 23) {
      scrollPosition = currentHour * HOUR_HEIGHT;
    }
    
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
    }, 100);
  }, [selectedDate]);
  
  /**
   * Navigate to previous day
   */
  function goToPreviousDay() {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    const newDate = current.toISOString().split('T')[0];
    onDateSelect?.(newDate);
  }

  /**
   * Navigate to next day
   */
  function goToNextDay() {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split('T')[0];
    onDateSelect?.(newDate);
  }

  /**
   * Check if date is today
   */
  function isToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  }

  /**
   * Handle event tap - detect double tap
   */
  function handleEventPress(event: CalendarEvent) {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (
      lastTap &&
      lastTap.eventId === event.eventId &&
      now - lastTap.time < 300
    ) {
      // Double tap - show popup
      setSelectedEvent(event);
      setPopupVisible(true);
      lastTapRef.current = null;
    } else {
      // Single tap
      lastTapRef.current = { eventId: event.eventId, time: now };
      onEventTap?.(event);
    }
  }
  
  /**
   * Render event card
   */
  function renderEvent(event: CalendarEvent) {
    const startDate = new Date(event.startsAtUtc);
    const endDate = new Date(event.endsAtUtc);
    
    // Calculate position (24-hour support: 12 AM - 11 PM)
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    
    // Calculate position from midnight (hour 0)
    const top = startHour * HOUR_HEIGHT;
    // Calculate exact height based on duration (minimum 40px for very short events)
    const height = Math.max(40, (endHour - startHour) * HOUR_HEIGHT);
    
    const isBusy = event.visibilityLevel === 'busy_only';
    
    return (
      <TouchableOpacity
        key={event.eventId}
        style={[
          styles.eventCard,
          {
            top,
            height, // Use height instead of minHeight for exact sizing
            borderLeftColor: event.primaryFamilyGroupColor,
          },
        ]}
        onPress={() => handleEventPress(event)}
        activeOpacity={0.7}
      >
        {/* Event Title with Recurring Icon */}
        <View style={styles.titleContainer}>
          {event.isRecurring && (
            <Ionicons 
              name="repeat" 
              size={14} 
              color={Colors.primary.lavender} 
              style={styles.recurringIcon}
            />
          )}
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>
        
        {/* Time Range */}
        <Text style={styles.eventTime}>
          {event.isAllDay 
            ? 'All Day' 
            : `${formatTime(event.startsAtUtc)} - ${formatTime(event.endsAtUtc)}`
          }
        </Text>
        
        {/* Attendees */}
        <View style={styles.attendeesSection}>
          {event.attendees.map((attendee, index) => (
            <View key={`${event.eventId}-${attendee.userId}-${index}`} style={styles.attendeeRow}>
              <View
                style={[
                  styles.attendeeDot,
                  { backgroundColor: attendee.color },
                ]}
              />
              <Text style={styles.attendeeName} numberOfLines={1}>
                {attendee.displayName}
              </Text>
              <Text style={styles.attendeeRole}>
                ({attendee.relationshipType})
              </Text>
              {isBusy && <Text style={styles.busyBadge}>BUSY</Text>}
            </View>
          ))}
        </View>
        
        {/* Location (if not busy) */}
        {!isBusy && event.location && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
        
        {/* Description (if not busy) */}
        {!isBusy && event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        
        {/* Calendar Badge */}
        <View style={styles.calendarBadge}>
          <Text style={styles.calendarBadgeText}>
            [{event.primaryFamilyGroupName}]
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Sticky Navigation Header - Does not scroll */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary.coral} />
        </TouchableOpacity>
        <View style={styles.dateContainer}>
          <Text style={[styles.headerText, isToday() && styles.todayHeaderText]}>
            {formatDate(selectedDate)}
          </Text>
          {isToday() && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary.coral} />
        </TouchableOpacity>
      </View>
      
      {/* Scrollable Timeline - Only this section scrolls */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeline}>
          {/* Time labels */}
          <View style={styles.timeColumn}>
            {timeSlots.map(slot => (
              <View key={slot.hour} style={styles.timeSlot}>
                <Text style={styles.timeLabel}>{slot.label}</Text>
              </View>
            ))}
          </View>
          
          {/* Events column */}
          <View style={styles.eventsColumn}>
            {/* Hour lines */}
            {timeSlots.map(slot => (
              <View key={slot.hour} style={styles.hourLine} />
            ))}
            
            {/* Events */}
            <View style={styles.eventsContainer}>
              {dayEvents.length === 0 ? (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No events for this day</Text>
                  <Text style={styles.noEventsSubtext}>
                    {isToday() ? 'Enjoy your free time! 🎉' : 'Free day 🟡'}
                  </Text>
                </View>
              ) : (
                dayEvents.map(event => renderEvent(event))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Event Detail Popup */}
      <EventDetailPopup
        visible={popupVisible}
        event={selectedEvent}
        onClose={() => setPopupVisible(false)}
        onEdit={() => console.log('Edit:', selectedEvent?.eventId)}
        onDelete={() => console.log('Delete:', selectedEvent?.eventId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  navButton: {
    padding: Layout.spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  todayHeaderText: {
    color: Colors.calendar.today,
  },
  todayBadge: {
    backgroundColor: Colors.calendar.today,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.md,
  },
  todayBadgeText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  timeline: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    paddingTop: 10,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    paddingRight: Layout.spacing.sm,
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: 'right',
    fontWeight: '700',
  },
  eventsColumn: {
    flex: 1,
    position: 'relative',
    paddingTop: 10,
  },
  hourLine: {
    height: HOUR_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: '#2C5F8D', // Navy blue
  },
  eventsContainer: {
    position: 'absolute',
    top: 10,
    left: Layout.spacing.xs,
    right: Layout.spacing.xs,
    bottom: 0,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  noEventsText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  eventCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.background.secondary,
    borderLeftWidth: 4,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs, // Reduced padding for compact display
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Clip overflowing content
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
  },
  recurringIcon: {
    marginRight: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  eventTime: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs,
  },
  attendeesSection: {
    marginTop: Layout.spacing.xs,
    paddingTop: Layout.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
  },
  attendeeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Layout.spacing.xs,
  },
  attendeeName: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  attendeeRole: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginLeft: Layout.spacing.xs / 2,
  },
  busyBadge: {
    fontSize: 9,
    color: Colors.semantic.error,
    fontWeight: '700',
    backgroundColor: '#FFE0DB',
    paddingHorizontal: Layout.spacing.xs / 2,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
    marginLeft: Layout.spacing.xs,
  },
  location: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.xs / 2,
  },
  description: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.xs / 2,
    lineHeight: 16,
  },
  calendarBadge: {
    marginTop: Layout.spacing.xs,
    alignSelf: 'flex-start',
  },
  calendarBadgeText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
});
