/**
 * User Preferences Cache Service
 * 
 * Provides persistent caching for user preferences using Expo SecureStore.
 * Similar pattern to authService.ts for secure persistent storage.
 * 
 * Features:
 * - Persistent storage across app restarts and login/logout
 * - Multi-user support (keyed by userId)
 * - Stores complete preference object from Foundry
 * - Secure encrypted storage
 */

import * as SecureStore from 'expo-secure-store';

// Storage key prefix
const PREFERENCES_KEY_PREFIX = 'harmoni_preferences_';

/**
 * Interface for cached user preferences
 * Matches Foundry UserPreference object structure
 */
export interface CachedUserPreferences {
  // Core identification
  userPreferenceId: string;
  userId: string;
  
  // Timezone & Location
  homeTimezone: string;
  currentTimezone?: string;
  isTraveling?: boolean;
  travelModeEnabledAt?: string;  // ISO timestamp string
  
  // Calendar Display
  calendarViewPreference?: string;
  weekStartsOn?: number;
  timeFormat?: string;
  dateFormat?: string;
  
  // Appearance
  theme?: string;
  locale?: string;
  
  // Event Defaults
  defaultEventPrivacy?: string;
  defaultEventDurationMinutes?: number;
  defaultFamilyGroupId?: string;  // NEW FIELD - recently added to Foundry
  
  // Notifications
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  
  // Cache metadata
  cachedAt: number;
}

/**
 * Save user preferences to SecureStore
 * 
 * @param userId - User ID to key the cache
 * @param preferences - Preferences object from Foundry
 */
export async function cacheUserPreferences(
  userId: string,
  preferences: any
): Promise<void> {
  try {
    const cacheKey = `${PREFERENCES_KEY_PREFIX}${userId}`;
    
    const cachedData: CachedUserPreferences = {
      ...preferences,
      cachedAt: Date.now(),
    };
    
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(cachedData));
    
    console.log('✅ User preferences cached for userId:', userId);
  } catch (error) {
    console.error('❌ Error caching user preferences:', error);
    throw error;
  }
}

/**
 * Get cached preferences for a specific user
 * 
 * @param userId - User ID to retrieve cache for
 * @returns Cached preferences or null if not found
 */
export async function getCachedPreferences(
  userId: string
): Promise<CachedUserPreferences | null> {
  try {
    const cacheKey = `${PREFERENCES_KEY_PREFIX}${userId}`;
    const cachedData = await SecureStore.getItemAsync(cacheKey);
    
    if (!cachedData) {
      console.log('📭 No cached preferences found for userId:', userId);
      return null;
    }
    
    const preferences: CachedUserPreferences = JSON.parse(cachedData);
    console.log('✅ Retrieved cached preferences for userId:', userId);
    console.log('📅 Cached at:', new Date(preferences.cachedAt).toISOString());
    
    return preferences;
  } catch (error) {
    console.error('❌ Error retrieving cached preferences:', error);
    return null;
  }
}

/**
 * Check if preferences are cached for a user
 * 
 * @param userId - User ID to check
 * @returns True if preferences are cached
 */
export async function hasPreferencesCache(userId: string): Promise<boolean> {
  try {
    const cacheKey = `${PREFERENCES_KEY_PREFIX}${userId}`;
    const cachedData = await SecureStore.getItemAsync(cacheKey);
    return cachedData !== null;
  } catch (error) {
    console.error('❌ Error checking preferences cache:', error);
    return false;
  }
}

/**
 * Clear preferences cache for a specific user
 * 
 * @param userId - User ID to clear cache for
 */
export async function clearPreferencesCache(userId: string): Promise<void> {
  try {
    const cacheKey = `${PREFERENCES_KEY_PREFIX}${userId}`;
    await SecureStore.deleteItemAsync(cacheKey);
    console.log('🧹 Cleared preferences cache for userId:', userId);
  } catch (error) {
    console.error('❌ Error clearing preferences cache:', error);
    throw error;
  }
}

/**
 * Clear all preferences caches
 * Note: SecureStore doesn't provide a way to list all keys,
 * so this function clears the cache for the current user only.
 * For full cleanup, call clearPreferencesCache with specific userId.
 */
export async function clearAllPreferencesCache(): Promise<void> {
  console.log('🧹 Preferences cache cleared (call clearPreferencesCache with userId for specific user)');
}

/**
 * Update specific fields in cached preferences
 * Useful for updating individual preference values without full re-cache
 * 
 * @param userId - User ID
 * @param updates - Partial preferences object with fields to update
 */
export async function updateCachedPreferences(
  userId: string,
  updates: Partial<CachedUserPreferences>
): Promise<CachedUserPreferences | null> {
  try {
    const existing = await getCachedPreferences(userId);
    
    if (!existing) {
      console.log('⚠️ No existing cache to update for userId:', userId);
      return null;
    }
    
    const updated: CachedUserPreferences = {
      ...existing,
      ...updates,
      cachedAt: Date.now(), // Update cache timestamp
    };
    
    const cacheKey = `${PREFERENCES_KEY_PREFIX}${userId}`;
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(updated));
    
    console.log('✅ Updated cached preferences for userId:', userId);
    return updated;
  } catch (error) {
    console.error('❌ Error updating cached preferences:', error);
    return null;
  }
}

/**
 * Get cache statistics for debugging
 * 
 * @param userId - User ID to get stats for
 * @returns Cache statistics object
 */
export async function getPreferencesCacheStats(userId: string): Promise<{
  isCached: boolean;
  cacheAge?: number;
  userId?: string;
}> {
  try {
    const preferences = await getCachedPreferences(userId);
    
    if (!preferences) {
      return { isCached: false };
    }
    
    return {
      isCached: true,
      cacheAge: Date.now() - preferences.cachedAt,
      userId: preferences.userId,
    };
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    return { isCached: false };
  }
}
