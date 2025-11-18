// Cache Management Service
import { userCache, CachedUser } from "../userCache";
import * as familyGroupCache from "../familyGroupCache";

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
 * Clear all caches (user and family groups) - useful for logout
 */
export function clearAllCaches(): void {
  userCache.clearCache();
  familyGroupCache.clearFamilyGroupCache();
  console.log('🧹 All caches cleared');
}

/**
 * Get family group cache statistics
 */
export function getFamilyGroupCacheStats() {
  return familyGroupCache.getCacheStats();
}
