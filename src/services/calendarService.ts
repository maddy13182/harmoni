/**
 * Calendar Service - Business Logic Layer
 * 
 * Handles calendar operations with caching and user preference integration
 */

import {
  getFamilyGroups,
  hasCachedGroups,
  storeFamilyGroups,
  clearFamilyGroupCache,
} from './familyGroupCache';
import { fetchFamilyGroups, fetchCalendarEvents } from './foundry/calendarApi';
import { getCurrentUser } from './foundry/cacheService';
import { getCachedPreferences } from './preferencesCache';
import { refreshUserPreferences } from './foundry/preferencesService';
import type { CalendarViewResponse, FamilyGroup } from '../types';

// Helper to wait/delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Load family groups from Foundry with retry logic
 * Does NOT use cache - always fetches fresh
 * 
 * @param userId - User ID to load groups for
 * @param retryOnEmpty - Whether to retry if empty result
 * @returns Array of family groups
 */
export async function loadFamilyGroupsFresh(
  userId: string,
  retryOnEmpty: boolean = false
): Promise<FamilyGroup[]> {
  try {
    console.log('[CalendarService] 📡 Fetching fresh family groups from Foundry');
    
    let groups = await fetchFamilyGroups(userId);
    console.log('[CalendarService] 📋 First attempt returned:', groups.length, 'groups');
    
    // Retry logic for Foundry consistency
    if (groups.length === 0 && retryOnEmpty) {
      console.log('[CalendarService] ⏳ Empty result, retrying in 1 second...');
      await wait(1000);
      
      groups = await fetchFamilyGroups(userId);
      console.log('[CalendarService] 📋 Retry returned:', groups.length, 'groups');
    }
    
    // Store in cache for future use
    if (groups.length > 0) {
      storeFamilyGroups(groups);
      console.log('[CalendarService] 💾 Family groups cached');
    }
    
    return groups;
  } catch (error) {
    console.error('[CalendarService] ❌ Failed to load family groups:', error);
    throw error;
  }
}

/**
 * Initialize calendar after family group creation
 * Refreshes preferences and loads fresh family groups
 * 
 * @param userId - User ID
 * @returns Initial calendar data
 */
export async function initializeCalendarAfterGroupCreation(userId: string): Promise<{
  familyGroups: FamilyGroup[];
  defaultFamilyIds: string[];
  calendarData: CalendarViewResponse | null;
  viewType: 'day' | 'week' | 'month';
}> {
  try {
    console.log('[CalendarService] 🔄 Initializing calendar after group creation');
    
    // Step 1: Refresh user preferences from Foundry (to get updated defaultFamilyGroupId)
    const userPreference = await refreshUserPreferences(userId);
    console.log('[CalendarService] 📋 Refreshed preferences, defaultFamilyGroupId:', userPreference?.defaultFamilyGroupId);
    
    // Step 2: Clear family group cache and fetch fresh
    clearFamilyGroupCache();
    const familyGroups = await loadFamilyGroupsFresh(userId, true);  // With retry
    console.log('[CalendarService] 📋 Loaded', familyGroups.length, 'family groups');
    
    if (familyGroups.length === 0) {
      throw new Error('No family groups found after creation');
    }
    
    // Step 3: Validate defaultFamilyGroupId exists
    if (!userPreference?.defaultFamilyGroupId) {
      throw new Error('NO_DEFAULT_CALENDAR');
    }
    
    console.log('[CalendarService] ✅ Using default family group:', userPreference.defaultFamilyGroupId);
    
    // Step 4: Load calendar events
    const viewType = (userPreference?.calendarViewPreference as 'day' | 'week' | 'month') || 'month';
    const calendarData = await loadCalendarEvents(
      userId,
      [userPreference.defaultFamilyGroupId],
      viewType
    );
    
    console.log('[CalendarService] ✅ Calendar initialized successfully after group creation');
    
    return {
      familyGroups,
      defaultFamilyIds: [userPreference.defaultFamilyGroupId],
      calendarData,
      viewType,
    };
  } catch (error) {
    console.error('[CalendarService] ❌ Failed to initialize calendar after group creation:', error);
    throw error;
  }
}

/**
 * Load calendar events for selected families
 * 
 * @param userId - User ID
 * @param familyGroupIds - Array of family group IDs
 * @param viewType - Calendar view type (day/week/month)
 * @param selectedDate - The currently selected date (ISO string)
 * @returns Calendar view response with events
 */
export async function loadCalendarEvents(
  userId: string,
  familyGroupIds: string[],
  viewType: 'day' | 'week' | 'month' = 'month',
  selectedDate?: string
): Promise<CalendarViewResponse> {
  try {
    // Calculate date range based on view type and selected date
    const { startDate, endDate } = getDateRangeForView(viewType, selectedDate);

    console.log('[CalendarService] Loading calendar events:', {
      userId,
      familyGroupIds,
      viewType,
      selectedDate,
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
 * For returning users with existing groups
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
    const familyGroups = await loadFamilyGroupsFresh(userId, false);

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

    // Validate defaultFamilyGroupId exists
    if (!userPreference?.defaultFamilyGroupId) {
      throw new Error('NO_DEFAULT_CALENDAR');
    }

    // Load calendar events for default family
    const calendarData = await loadCalendarEvents(
      userId,
      [userPreference.defaultFamilyGroupId],
      viewType
    );

    console.log('[CalendarService] Calendar initialized successfully');

    return {
      familyGroups,
      defaultFamilyIds: [userPreference.defaultFamilyGroupId],
      calendarData,
      viewType,
    };
  } catch (error) {
    console.error('[CalendarService] Failed to initialize calendar:', error);
    throw error;
  }
}

/**
 * Calculate date range based on view type and selected date
 * 
 * @param viewType - Calendar view type
 * @param selectedDate - The currently selected date (ISO string), defaults to today
 * @returns Start and end dates as ISO strings
 */
function getDateRangeForView(
  viewType: 'day' | 'week' | 'month',
  selectedDate?: string
): {
  startDate: string;
  endDate: string;
} {
  // Use selected date or default to today
  const referenceDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();

  switch (viewType) {
    case 'day':
      // Fetch the selected day only
      const dayStart = new Date(referenceDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(referenceDate);
      dayEnd.setHours(23, 59, 59, 999);

      return {
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
      };

    case 'week':
      // Fetch the week containing the selected date (Sunday to Saturday)
      const weekStart = new Date(referenceDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(referenceDate);
      weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
      weekEnd.setHours(23, 59, 59, 999);

      return {
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      };

    case 'month':
    default:
      // Fetch only the month containing the selected date
      const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      return {
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      };
  }
}
