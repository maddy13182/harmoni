/**
 * MonthView Component
 * 
 * Displays month calendar with free day indicators (gold) and busy member indicators
 * Mobile-optimized: Shows count badge for multiple busy members
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import type { CalendarEvent, FamilyMemberCalendar } from '../../types';
import { analyzeDayAvailability, getDatesInMonth } from '../../utils/calendarHelpers';
import { Colors } from '../../constants/Colors';

interface MonthViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  familyMembers: FamilyMemberCalendar[];
  onDateSelect: (date: string) => void;
  onEventTap?: (event: CalendarEvent) => void;
}

export default function MonthView({
  selectedDate,
  events,
  familyMembers,
  onDateSelect,
}: MonthViewProps) {
  
  // Track the currently displayed month (may differ from selectedDate)
  const [displayedMonth, setDisplayedMonth] = React.useState(() => {
    const date = new Date(selectedDate + 'T12:00:00');
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  
  /**
   * Handle month change (when user taps arrows)
   */
  function handleMonthChange(month: any) {
    // Update displayed month
    setDisplayedMonth({ year: month.year, month: month.month - 1 }); // month is 1-indexed from calendar
    
    // Update selected date to first day of new month
    const newDate = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
    onDateSelect(newDate);
  }
  
  /**
   * Get marked dates for the calendar
   * - Free days: Gold dot
   * - Busy days: Multiple colored dots for each busy person (mobile-optimized with max 3 dots)
   */
  function getMarkedDates() {
    const marked: any = {};
    
    // Use displayed month, not selected date's month
    const { year, month } = displayedMonth;
    const dates = getDatesInMonth(year, month);
    
    // Analyze each date
    dates.forEach(dateStr => {
      const availability = analyzeDayAvailability(dateStr, events, familyMembers);
      
      if (availability.isFreeDay) {
        // FREE DAY - Show single gold dot
        marked[dateStr] = {
          marked: true,
          dotColor: Colors.calendar.freeDay,
        };
      } else if (availability.busyMemberCount > 0) {
        // BUSY DAY - Show dots for each busy person (max 3 for mobile)
        const dotsToShow = availability.busyMembers.slice(0, 3);
        
        if (availability.busyMemberCount === 1) {
          // Single person - use simple dot
          marked[dateStr] = {
            marked: true,
            dotColor: availability.busyMembers[0].color,
          };
        } else {
          // Multiple people - use multi-dot marking
          marked[dateStr] = {
            dots: dotsToShow.map(member => ({
              key: member.userId,
              color: member.color,
            })),
          };
        }
      }
    });
    
    // Highlight selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = Colors.calendar.selected;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.calendar.selected,
      };
    }
    
    return marked;
  }
  
  /**
   * Handle day press
   */
  function handleDayPress(day: DateData) {
    onDateSelect(day.dateString);
  }
  
  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={getMarkedDates()}
        theme={{
          todayTextColor: Colors.calendar.today,
          selectedDayBackgroundColor: Colors.calendar.selected,
          arrowColor: Colors.primary.coral,
          monthTextColor: Colors.text.primary,
          textMonthFontWeight: '700',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontWeight: '600',
          dotColor: Colors.calendar.freeDay,
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
  },
  calendar: {
    paddingBottom: 10,
  },
  emptyDay: {
    width: 40,
    height: 40,
  },
  dayContainer: {
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  freeDayContainer: {
    backgroundColor: Colors.calendar.freeDayLight,
  },
  selectedDayContainer: {
    backgroundColor: Colors.calendar.selected,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  todayText: {
    color: Colors.calendar.today,
    fontWeight: '700',
  },
  selectedDayText: {
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  freeDayText: {
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countBadge: {
    backgroundColor: Colors.calendar.busyBadge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
});
