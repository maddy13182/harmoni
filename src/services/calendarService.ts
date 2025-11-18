/**
 * Calendar Service - Business Logic Layer
 * 
 * Handles calendar operations with caching and user preference integration
 */

import {
  getFamilyGroups,
  hasCachedGroups,
  storeFamilyGroups,
  getSelectedGroup,
} from './familyGroupCache';
import { fetchFamilyGroups, fetchCalendarEvents } from './foundry/calendarApi';
import { getCurrentUser } from './foundry/cacheService';
import { getCachedPreferences } from './preferencesCache';
import type { CalendarViewResponse, FamilyGroup } from '../types';

/**
 * Load family groups (uses cache if available)
 * 
 * @param userId - User ID to load groups for
 * @returns Array of family groups
 */
export async function loadFamilyGroups(userId: string): Promise<FamilyGroup[]> {
  try {
    // Check cache first
    if (hasCachedGroups()) {
      console.log('[CalendarService] Using cached family groups');
      return getFamilyGroups();
    }

    // Cache miss - fetch from Foundry
    console.log('[CalendarService] Cache miss, fetching from Foundry');
    const groups = await fetchFamilyGroups(userId);

    // Store in cache
    storeFamilyGroups(groups);

    return groups;
  } catch (error) {
    console.error('[CalendarService] Failed to load family groups:', error);
    throw error;
  }
}

/**
 * Load calendar events for selected families
 * 
 * @param userId - User ID
 * @param familyGroupIds - Array of family group IDs
 * @param viewType - Calendar view type (day/week/month)
 * @returns Calendar view response with events
 */
export async function loadCalendarEvents(
  userId: string,
  familyGroupIds: string[],
  viewType: 'day' | 'week' | 'month' = 'month'
): Promise<CalendarViewResponse> {
  try {
    // Calculate date range based on view type
    const { startDate, endDate } = getDateRangeForView(viewType);

    console.log('[CalendarService] Loading calendar events:', {
      userId,
      familyGroupIds,
      viewType,
      startDate,
      endDate,
    });

    // Fetch from Foundry
    const data = await fetchCalendarEvents(
      userId,
      familyGroupIds,
      startDate,
      endDate
    );

    return data;
  } catch (error) {
    console.error('[CalendarService] Failed to load calendar events:', error);
    throw error;
  }
}

/**
 * Initialize calendar with default settings
 * Uses cached user preference for default family and view type
 * 
 * @param userId - User ID
 * @returns Initial calendar data
 */
export async function initializeCalendar(userId: string): Promise<{
  familyGroups: FamilyGroup[];
  defaultFamilyIds: string[];
  calendarData: CalendarViewResponse | null;
  viewType: 'day' | 'week' | 'month';
}> {
  try {
    console.log('[CalendarService] Initializing calendar for user:', userId);

    // Load family groups (with caching)
    const familyGroups = await loadFamilyGroups(userId);

    if (familyGroups.length === 0) {
      return {
        familyGroups: [],
        defaultFamilyIds: [],
        calendarData: null,
        viewType: 'month',
      };
    }

    // Get user preference from cache
    const userPreference = await getCachedPreferences(userId);
    const viewType = (userPreference?.calendarViewPreference as 'day' | 'week' | 'month') || 'month';

    // Determine default family to load
    let defaultFamilyIds: string[] = [];
    
    if (userPreference?.defaultFamilyGroupId) {
      // Use user's default family
      defaultFamilyIds = [userPreference.defaultFamilyGroupId];
    } else {
      // Use first family if no default set
      defaultFamilyIds = [familyGroups[0].familyGroupId];
    }

    // Load calendar events for default family
    const calendarData = await loadCalendarEvents(
      userId,
      defaultFamilyIds,
      viewType
    );

    console.log('[CalendarService] Calendar initialized successfully');

    return {
      familyGroups,
      defaultFamilyIds,
      calendarData,
      viewType,
    };
  } catch (error) {
    console.error('[CalendarService] Failed to initialize calendar:', error);
    throw error;
  }
}

/**
 * Calculate date range based on view type
 * 
 * @param viewType - Calendar view type
 * @returns Start and end dates as ISO strings
 */
function getDateRangeForView(viewType: 'day' | 'week' | 'month'): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();

  switch (viewType) {
    case 'day':
      // Load 3 days (yesterday, today, tomorrow)
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - 1);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(now);
      dayEnd.setDate(dayEnd.getDate() + 1);
      dayEnd.setHours(23, 59, 59, 999);

      return {
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
      };

    case 'week':
      // Load 3 weeks (last week, this week, next week)
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - now.getDay() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + (6 - now.getDay()) + 7);
      weekEnd.setHours(23, 59, 59, 999);

      return {
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      };

    case 'month':
    default:
      // Load 3 months (last month, this month, next month)
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      monthEnd.setHours(23, 59, 59, 999);

      return {
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      };
  }
}
