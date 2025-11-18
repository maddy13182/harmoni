/**
 * Foundry Services - Main Export Hub
 * 
 * This file re-exports all Foundry services to maintain backward compatibility
 * with existing imports while providing a modular structure.
 * 
 * Usage:
 * import { verifyOrCreateUser, getUserPreferences } from './services/foundry';
 */

// Export configuration and client
export { foundryClient, FOUNDRY_CONFIG } from './foundryConfig';

// Export user service functions and types
export {
  findUserByGoogleId,
  createFoundryUser,
  verifyOrCreateUser,
  checkUserExists,
  getFoundryUser,
} from './userService';

export type {
  FoundryUserCheckResult,
  UserProvisioningResult,
} from './userService';

// Export preferences service functions
export {
  getUserPreferences,
  createUserPreferences,
  checkUserPreferences,
} from './preferencesService';

// Export family group service functions
export {
  getFamilyGroupsForUser,
  createFamilyGroupWithMembership,
  checkUserFamilyGroups,
} from './familyGroupService';

// Export cache service functions
export {
  getCurrentUser,
  getCurrentUserId,
  getCurrentGoogleId,
  getCurrentDisplayName,
  isUserCached,
  clearUserCache,
  getCacheStats,
  updateCachedUser,
  clearAllCaches,
  getFamilyGroupCacheStats,
} from './cacheService';

// Placeholder functions for future implementation
export async function fetchFamilyMembers() {
  try {
    console.log('Fetching family members from Foundry...');
    return [];
  } catch (error) {
    console.error('Error fetching family members:', error);
    throw error;
  }
}

export async function fetchCalendarEvents(startDate: Date, endDate: Date) {
  try {
    console.log('Fetching calendar events from Foundry...', { startDate, endDate });
    return [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

export async function createCalendarEvent(eventData: any) {
  try {
    console.log('Creating calendar event in Foundry...', eventData);
    return eventData;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(eventId: string, eventData: any) {
  try {
    console.log('Updating calendar event in Foundry...', { eventId, eventData });
    return eventData;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    console.log('Deleting calendar event from Foundry...', eventId);
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}
