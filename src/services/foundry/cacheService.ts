// Cache Management Service
import { userCache, CachedUser } from "../userCache";
import * as familyGroupCache from "../familyGroupCache";
import * as preferencesCache from "../preferencesCache";

// ===== USER CACHE UTILITIES =====

/**
 * Get current cached user data
 */
export function getCurrentUser(): CachedUser | null {
  return userCache.getCachedUser();
}

/**
 * Get current user ID from cache
 */
export function getCurrentUserId(): string | null {
  return userCache.getCachedUserId();
}

/**
 * Get current user's Google ID from cache
 */
export function getCurrentGoogleId(): string | null {
  return userCache.getCachedGoogleId();
}

/**
 * Get current user's display name from cache
 */
export function getCurrentDisplayName(): string | null {
  return userCache.getCachedDisplayName();
}

/**
 * Check if user is currently cached
 */
export function isUserCached(): boolean {
  return userCache.isUserCached();
}

/**
 * Clear user cache (useful for logout)
 */
export function clearUserCache(): void {
  userCache.clearCache();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return userCache.getCacheStats();
}

/**
 * Update cached user properties
 */
export function updateCachedUser(updates: Partial<CachedUser>): CachedUser | null {
  return userCache.updateCachedUser(updates);
}

// ===== FAMILY GROUP CACHE UTILITIES =====

/**
 * Get family group cache statistics
 */
export function getFamilyGroupCacheStats() {
  return familyGroupCache.getCacheStats();
}

// ===== PREFERENCES CACHE UTILITIES =====

/**
 * Cache user preferences
 */
export const cacheUserPreferences = preferencesCache.cacheUserPreferences;

/**
 * Get cached preferences for a user
 */
export const getCachedPreferences = preferencesCache.getCachedPreferences;

/**
 * Check if preferences are cached
 */
export const hasPreferencesCache = preferencesCache.hasPreferencesCache;

/**
 * Clear preferences cache for a specific user
 */
export const clearPreferencesCache = preferencesCache.clearPreferencesCache;

/**
 * Update cached preferences
 */
export const updateCachedPreferences = preferencesCache.updateCachedPreferences;

/**
 * Get preferences cache statistics
 */
export const getPreferencesCacheStats = preferencesCache.getPreferencesCacheStats;

// ===== CLEAR ALL CACHES =====

/**
 * Clear all caches (user, family groups, and preferences) - useful for logout
 * Note: For preferences, you need to provide the userId
 */
export async function clearAllCaches(userId?: string): Promise<void> {
  userCache.clearCache();
  familyGroupCache.clearFamilyGroupCache();
  
  // Clear preferences cache if userId provided
  if (userId) {
    await preferencesCache.clearPreferencesCache(userId);
  }
  
  console.log('🧹 All caches cleared');
}
