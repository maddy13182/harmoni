/**
 * Calendar Helper Utilities
 * 
 * Functions for processing calendar events, detecting free days,
 * and managing date/time operations
 */

import type { CalendarEvent, FamilyMemberCalendar } from '../types';

// ===== DATE UTILITIES =====

/**
 * Extract date string from ISO timestamp
 * @param isoString - ISO 8601 timestamp
 * @returns Date string in YYYY-MM-DD format
 */
export function extractDate(isoString: string): string {
  return isoString.split('T')[0];
}

/**
 * Format time from ISO string to readable format
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted time string (e.g., "9:00 AM")
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date to readable string
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date (e.g., "Tuesday, Nov 19")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get all dates in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Array of date strings
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }
  
  return dates;
}

/**
 * Get dates in a week starting from a given date
 * @param startDate - Start date string
 * @returns Array of 7 date strings
 */
export function getDatesInWeek(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + 'T12:00:00');
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dates.push(dateStr);
  }
  
  return dates;
}

// ===== EVENT GROUPING =====

/**
 * Group events by date
 * @param events - Array of calendar events
 * @returns Map of date strings to events
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const date = extractDate(event.startsAtUtc);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(event);
  });
  
  return grouped;
}

/**
 * Get events for a specific date
 * @param date - Date string in YYYY-MM-DD format
 * @param events - Array of calendar events
 * @returns Array of events on that date
 */
export function getEventsForDate(date: string, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => extractDate(event.startsAtUtc) === date);
}

/**
 * Sort events by start time
 * @param events - Array of calendar events
 * @returns Sorted array of events
 */
export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    return new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime();
  });
}

// ===== FREE DAY DETECTION =====

export interface DayAvailability {
  isFreeDay: boolean;
  busyMemberCount: number;
  busyMembers: Array<{
    userId: string;
    displayName: string;
    color: string;
  }>;
}

/**
 * Analyze day availability for family members
 * @param date - Date string in YYYY-MM-DD format
 * @param events - Array of calendar events
 * @param familyMembers - Array of family members
 * @returns Day availability analysis
 */
export function analyzeDayAvailability(
  date: string,
  events: CalendarEvent[],
  familyMembers: FamilyMemberCalendar[]
): DayAvailability {
  // Get events for this date
  const dayEvents = getEventsForDate(date, events);
  
  // If no events, it's a free day!
  if (dayEvents.length === 0) {
    return {
      isFreeDay: true,
      busyMemberCount: 0,
      busyMembers: [],
    };
  }
  
  // Find which family members are busy
  const busyUserIds = new Set<string>();
  
  dayEvents.forEach(event => {
    event.attendees.forEach(attendee => {
      busyUserIds.add(attendee.userId);
    });
  });
  
  // Map to member details
  const busyMembers = familyMembers
    .filter(member => busyUserIds.has(member.userId))
    .map(member => ({
      userId: member.userId,
      displayName: member.displayName,
      color: member.color,
    }));
  
  return {
    isFreeDay: false,
    busyMemberCount: busyMembers.length,
    busyMembers,
  };
}

/**
 * Get all free days in a date range
 * @param startDate - Start date string
 * @param endDate - End date string
 * @param events - Array of calendar events
 * @returns Set of free day date strings
 */
export function getFreeDays(
  startDate: string,
  endDate: string,
  events: CalendarEvent[]
): Set<string> {
  const freeDays = new Set<string>();
  const eventsByDate = groupEventsByDate(events);
  
  const current = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    
    // If no events on this date, it's free
    if (!eventsByDate.has(dateStr)) {
      freeDays.add(dateStr);
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return freeDays;
}

// ===== TIME SLOT UTILITIES =====

/**
 * Get time slots for day/week view (12 AM - 11 PM, full 24 hours)
 * @returns Array of time slot objects
 */
export function getTimeSlots(): Array<{ hour: number; label: string }> {
  const slots: Array<{ hour: number; label: string }> = [];
  
  // 12 AM to 11 PM (24 hours)
  for (let hour = 0; hour <= 23; hour++) {
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const label = `${displayHour}${isPM ? 'p' : 'a'}`;
    
    slots.push({ hour, label });
  }
  
  return slots;
}

/**
 * Calculate event position in time slot grid
 * @param event - Calendar event
 * @returns Position object with top, height in pixels
 */
export function calculateEventPosition(
  event: CalendarEvent,
  hourHeight: number = 60
): { top: number; height: number } {
  const startDate = new Date(event.startsAtUtc);
  const endDate = new Date(event.endsAtUtc);
  
  // Calculate hours from 6 AM
  const startHour = startDate.getHours() + startDate.getMinutes() / 60;
  const endHour = endDate.getHours() + endDate.getMinutes() / 60;
  
  const top = (startHour - 6) * hourHeight;
  const height = (endHour - startHour) * hourHeight;
  
  return { top, height };
}

// ===== MOBILE-OPTIMIZED INDICATORS =====

/**
 * Get compact indicator for multiple busy members
 * For mobile: Show count badge instead of multiple dots
 * @param busyCount - Number of busy members
 * @returns Indicator configuration
 */
export function getBusyIndicator(busyCount: number): {
  showBadge: boolean;
  badgeText: string;
  badgeColor: string;
} {
  if (busyCount === 0) {
    return {
      showBadge: false,
      badgeText: '',
      badgeColor: '',
    };
  }
  
  if (busyCount === 1) {
    return {
      showBadge: false,
      badgeText: '',
      badgeColor: '',
    };
  }
  
  // Multiple people busy - show count badge
  return {
    showBadge: true,
    badgeText: `${busyCount}`,
    badgeColor: '#EF7674',
  };
}

/**
 * Get unique attendee colors from event
 * @param event - Calendar event
 * @returns Array of unique colors
 */
export function getAttendeeColors(event: CalendarEvent): string[] {
  const colors = new Set<string>();
  event.attendees.forEach(attendee => {
    colors.add(attendee.color);
  });
  return Array.from(colors);
}
