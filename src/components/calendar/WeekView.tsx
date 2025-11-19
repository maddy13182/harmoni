/**
 * WeekView Component
 * 
 * Displays 7-day week view with time slots (6 AM - 11 PM)
 * Mobile-optimized: Horizontal scroll, compact event blocks
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import type { CalendarEvent, FamilyMemberCalendar } from '../../types';
import { 
  getDatesInWeek, 
  getEventsForDate, 
  sortEventsByTime,
  formatTime,
  getTimeSlots,
} from '../../utils/calendarHelpers';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = SCREEN_WIDTH / 7;
const HOUR_HEIGHT = 60;

interface WeekViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  familyMembers: FamilyMemberCalendar[];
  onDateSelect: (date: string) => void;
  onEventTap: (event: CalendarEvent) => void;
}

import { Ionicons } from '@expo/vector-icons';

export default function WeekView({
  selectedDate,
  events,
  familyMembers,
  onDateSelect,
  onEventTap,
}: WeekViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get week dates starting from Sunday
  const weekStart = getWeekStartDate(selectedDate);
  const weekDates = getDatesInWeek(weekStart);
  const timeSlots = getTimeSlots();
  
  // Scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 6 && currentHour <= 23) {
      const scrollPosition = (currentHour - 6) * HOUR_HEIGHT;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
      }, 100);
    }
  }, []);
  
  /**
   * Get week start date (Sunday)
   */
  function getWeekStartDate(date: string): string {
    const d = new Date(date + 'T12:00:00');
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.toISOString().split('T')[0];
  }

  /**
   * Navigate to previous week
   */
  function goToPreviousWeek() {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() - 7);
    onDateSelect(current.toISOString().split('T')[0]);
  }

  /**
   * Navigate to next week
   */
  function goToNextWeek() {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + 7);
    onDateSelect(current.toISOString().split('T')[0]);
  }

  /**
   * Get month/year label for week
   */
  function getWeekLabel(): string {
    const firstDay = new Date(weekDates[0] + 'T12:00:00');
    const lastDay = new Date(weekDates[6] + 'T12:00:00');
    
    const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
    const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'short' });
    const year = firstDay.getFullYear();
    
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    } else {
      return `${firstMonth}-${lastMonth} ${year}`;
    }
  }
  
  /**
   * Format day header
   */
  function formatDayHeader(dateStr: string): { day: string; date: string } {
    const date = new Date(dateStr + 'T12:00:00');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = date.getDate().toString();
    return { day, date: dateNum };
  }
  
  /**
   * Check if date is today
   */
  function isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }
  
  /**
   * Check if date is selected
   */
  function isSelected(dateStr: string): boolean {
    return dateStr === selectedDate;
  }
  
  /**
   * Render event block for a specific date
   */
  function renderEventsForDate(dateStr: string) {
    const dayEvents = sortEventsByTime(getEventsForDate(dateStr, events));
    
    if (dayEvents.length === 0) return null;
    
    return dayEvents.map((event, index) => {
      const startDate = new Date(event.startsAtUtc);
      const endDate = new Date(event.endsAtUtc);
      
      // Calculate position
      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const endHour = endDate.getHours() + endDate.getMinutes() / 60;
      
      // Only show events within 6 AM - 11 PM range
      if (endHour < 6 || startHour > 23) return null;
      
      const top = Math.max(0, (startHour - 6) * HOUR_HEIGHT);
      const height = Math.max(30, (endHour - startHour) * HOUR_HEIGHT);
      
      // Get attendee count for mobile-optimized display
      const attendeeCount = event.attendees.length;
      const firstAttendee = event.attendees[0];
      
      return (
        <TouchableOpacity
          key={event.eventId}
          style={[
            styles.eventBlock,
            {
              top,
              height,
              borderLeftColor: event.primaryFamilyGroupColor,
            },
          ]}
          onPress={() => onEventTap(event)}
          activeOpacity={0.7}
        >
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          
          <Text style={styles.eventTime} numberOfLines={1}>
            {formatTime(event.startsAtUtc)}
          </Text>
          
          {/* Attendee indicator - mobile optimized */}
          <View style={styles.attendeeIndicator}>
            <View
              style={[
                styles.attendeeDot,
                { backgroundColor: firstAttendee.color },
              ]}
            />
            {attendeeCount > 1 && (
              <View style={styles.attendeeCountBadge}>
                <Text style={styles.attendeeCountText}>+{attendeeCount - 1}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    });
  }
  
  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary.coral} />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{getWeekLabel()}</Text>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary.coral} />
        </TouchableOpacity>
      </View>

      {/* Week Header */}
      <View style={styles.header}>
        <View style={styles.timeColumn} />
        {weekDates.map(dateStr => {
          const { day, date } = formatDayHeader(dateStr);
          const today = isToday(dateStr);
          const selected = isSelected(dateStr);
          
          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayHeader,
                today && styles.todayHeader,
                selected && styles.selectedHeader,
              ]}
              onPress={() => onDateSelect(dateStr)}
            >
              <Text style={[styles.dayText, today && styles.todayText]}>
                {day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  today && styles.todayDateText,
                  selected && styles.selectedDateText,
                ]}
              >
                {date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Time Grid */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* Time labels */}
          <View style={styles.timeColumn}>
            {timeSlots.map(slot => (
              <View key={slot.hour} style={styles.timeSlot}>
                <Text style={styles.timeLabel}>{slot.label}</Text>
              </View>
            ))}
          </View>
          
          {/* Day columns with events */}
          {weekDates.map(dateStr => (
            <View key={dateStr} style={styles.dayColumn}>
              {/* Hour lines */}
              {timeSlots.map(slot => (
                <View key={slot.hour} style={styles.hourLine} />
              ))}
              
              {/* Events */}
              <View style={styles.eventsContainer}>
                {renderEventsForDate(dateStr)}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  weekLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
    backgroundColor: Colors.background.secondary,
  },
  timeColumn: {
    width: 50,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  todayHeader: {
    backgroundColor: Colors.calendar.freeDayLight,
  },
  selectedHeader: {
    backgroundColor: Colors.calendar.selected,
  },
  dayText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  todayText: {
    color: Colors.calendar.today,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  todayDateText: {
    color: Colors.calendar.today,
  },
  selectedDateText: {
    color: Colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingRight: 8,
  },
  timeLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: 'right',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
  hourLine: {
    height: HOUR_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  eventsContainer: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    bottom: 0,
  },
  eventBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.background.secondary,
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 9,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  attendeeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  attendeeCountBadge: {
    backgroundColor: Colors.calendar.busyBadge,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 3,
  },
  attendeeCountText: {
    fontSize: 8,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
});
