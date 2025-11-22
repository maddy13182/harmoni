/**
 * Calendar API Service - Foundry Integration
 * 
 * Handles all calendar-related API calls to Foundry
 */

import { getUserFamilyGroups, getUserCalendarEvents } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";
import type { CalendarViewResponse, FamilyGroup } from "../../types";

/**
 * Fetch user's family groups from Foundry
 * 
 * @param userId - User ID to fetch groups for
 * @returns Array of family groups
 */
export async function fetchFamilyGroups(userId: string): Promise<FamilyGroup[]> {
  try {
    console.log('[CalendarAPI] Fetching family groups for user:', userId);
    console.log('[CalendarAPI] 📡 Calling Foundry function: getUserFamilyGroups');
    
    const result = await foundryClient(getUserFamilyGroups).executeFunction({
      userId: userId,
    });
    
    console.log('[CalendarAPI] 📦 RAW Foundry response:', JSON.stringify(result, null, 2));
    console.log('[CalendarAPI] 📊 Response type:', typeof result);
    
    if (!result || !Array.isArray(result)) {
      console.log('[CalendarAPI] ⚠️ Foundry returned invalid data, returning empty array');
      return [];
    }
    
    // Transform the data to match expected format
    const groups = result.map((group: any) => ({
      familyGroupId: group.familyGroupId || group.$primaryKey,
      groupName: group.groupName,
      groupColor: group.groupColor,
      groupDescription: group.groupDescription,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      role: group.role, // IMPORTANT: Include role for invite permissions
      isActive: group.isActive,
      displayColor: group.displayColor,
      relationshipType: group.relationshipType,
    }));
    
    // Log detailed information about each group
    if (groups.length > 0) {
      console.log('[CalendarAPI] 📋 DETAILED FAMILY GROUP DATA FROM FOUNDRY:');
      groups.forEach((group: any, index: number) => {
        console.log(`[CalendarAPI] Group ${index + 1}:`, JSON.stringify(group, null, 2));
        console.log(`[CalendarAPI] Group ${index + 1} familyGroupId:`, group.familyGroupId);
        console.log(`[CalendarAPI] Group ${index + 1} groupName:`, group.groupName);
      });
    } else {
      console.log('[CalendarAPI] ✅ Foundry returned 0 groups (correct for new user)');
    }
    
    console.log('[CalendarAPI] ✅ Returning', groups.length, 'family groups');
    return groups;
  } catch (error) {
    console.error('[CalendarAPI] Error fetching family groups:', error);
    throw error;
  }
}

/**
 * Fetch calendar events from Foundry
 * 
 * @param userId - User ID
 * @param familyGroupIds - Array of family group IDs to fetch events for
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Calendar view response with events and family info
 */
export async function fetchCalendarEvents(
  userId: string,
  familyGroupIds: string[],
  startDate: string,
  endDate: string
): Promise<CalendarViewResponse> {
  try {
    console.log('[CalendarAPI] 📡 Calling Foundry function: getUserCalendarEvents');
    console.log('[CalendarAPI] Parameters:', {
      userId,
      familyGroupIds,
      startDate,
      endDate,
    });
    
    const result = await foundryClient(getUserCalendarEvents).executeFunction({
      userId: userId,
      familyGroupIds: familyGroupIds,
      startDate: startDate,
      endDate: endDate,
    });
    
    console.log('[CalendarAPI] 📦 Raw Foundry response:', JSON.stringify(result, null, 2));
    console.log('[CalendarAPI] 📊 Response type:', typeof result);
    console.log('[CalendarAPI] 🔍 Response keys:', result ? Object.keys(result) : 'null');
    
    // Handle different response formats
    if (!result) {
      console.log('[CalendarAPI] ⚠️ Foundry returned null/undefined, returning empty data');
      return {
        events: [],
        familyGroupsWithMembers: [],
        familyGroupInfo: [],
      };
    }
    
    console.log('[CalendarAPI] ✅ Fetched', result?.events?.length || 0, 'events');
    return result as CalendarViewResponse;
  } catch (error) {
    console.error('[CalendarAPI] ❌ Failed to fetch calendar events:', error);
    console.error('[CalendarAPI] 🔍 Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error('Failed to load calendar events');
  }
}
