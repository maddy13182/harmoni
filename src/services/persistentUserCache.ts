/**
 * Persistent User Cache Service with Validation
 * 
 * Provides persistent caching for Foundry user data using Expo SecureStore.
 * Includes validation logic to sync with Foundry on app restart.
 * 
 * Features:
 * - Persistent storage across app restarts
 * - Validation against Foundry on app restart
 * - Auto-update cache if non-critical fields change
 * - Invalidate cache if critical fields (IDs) change
 * - No expiration - data persists until logout or invalidation
 * 
 * Strategy: "Cache with Validation"
 * - Query Foundry only at login and app restart
 * - Validate cached data against Foundry
 * - Update cache if data changed (except IDs)
 * - Force re-login if IDs changed (security)
 */

import * as SecureStore from 'expo-secure-store';

// Storage key prefix - using googleUserId as key since that's what we have at login
const USER_KEY_PREFIX = 'harmoni_foundry_user_google_';

/**
 * Interface for cached Foundry user data
 * Matches the structure from Foundry User object
 */
export interface CachedFoundryUser {
  // Core identification (CRITICAL - changes require re-login)
  $primaryKey: string;
  $title: string;
  userId: string;
  googleUserId: string;
  
  // User details (NON-CRITICAL - can be updated)
  email: string;
  displayName: string;
  accountStatus: string;
  
  // Timestamps
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
  
  // Cache metadata
  cachedAt: number;
  source: 'lookup' | 'creation';
  lastValidated?: number; // When was this last validated against Foundry
}

/**
 * Validation result after comparing cached vs Foundry data
 */
export interface ValidationResult {
  isValid: boolean;
  needsUpdate: boolean;
  needsRelogin: boolean;
  changes?: {
    criticalFieldsChanged: boolean;
    changedFields: string[];
  };
}

/**
 * Save Foundry user data to SecureStore
 * 
 * @param googleUserId - Google User ID to key the cache (consistent with login flow)
 * @param userData - User data from Foundry (lookup or creation)
 * @param source - Whether data came from lookup or creation
 */
export async function cacheFoundryUser(
  googleUserId: string,
  userData: any,
  source: 'lookup' | 'creation'
): Promise<void> {
  try {
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    
    const cachedData: CachedFoundryUser = {
      $primaryKey: userData.$primaryKey || userData.userId || googleUserId,
      $title: userData.$title || userData.displayName,
      userId: userData.userId || userData.$primaryKey || googleUserId,
      googleUserId: userData.googleUserId || googleUserId,
      email: userData.email,
      displayName: userData.displayName || userData.$title,
      accountStatus: userData.accountStatus || 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
      cachedAt: Date.now(),
      lastValidated: Date.now(),
      source,
    };
    
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(cachedData));
    
    console.log('✅ Foundry user cached persistently for googleUserId:', googleUserId);
    console.log('📦 Cache source:', source);
  } catch (error) {
    console.error('❌ Error caching Foundry user:', error);
    throw error;
  }
}

/**
 * Get cached Foundry user data for a specific user
 * 
 * @param googleUserId - Google User ID to retrieve cache for
 * @returns Cached user data or null if not found
 */
export async function getCachedFoundryUser(
  googleUserId: string
): Promise<CachedFoundryUser | null> {
  try {
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    const cachedData = await SecureStore.getItemAsync(cacheKey);
    
    if (!cachedData) {
      console.log('📭 No cached Foundry user found for googleUserId:', googleUserId);
      return null;
    }
    
    const userData: CachedFoundryUser = JSON.parse(cachedData);
    console.log('✅ Retrieved cached Foundry user for googleUserId:', googleUserId);
    console.log('📅 Cached at:', new Date(userData.cachedAt).toISOString());
    console.log('📦 Cache source:', userData.source);
    
    return userData;
  } catch (error) {
    console.error('❌ Error retrieving cached Foundry user:', error);
    return null;
  }
}

/**
 * Validate cached user data against Foundry data
 * Compares critical and non-critical fields
 * 
 * @param cachedUser - User data from cache
 * @param foundryUser - User data from Foundry
 * @returns Validation result with action recommendations
 */
export function validateCachedUser(
  cachedUser: CachedFoundryUser,
  foundryUser: any
): ValidationResult {
  console.log('🔍 Validating cached user against Foundry data...');
  
  // Critical fields that should NEVER change (require re-login if changed)
  const criticalFields = ['userId', 'googleUserId', '$primaryKey'];
  
  // Non-critical fields that can be updated
  const nonCriticalFields = ['email', 'displayName', 'accountStatus', '$title', 'updatedAt', 'lastLoginAt'];
  
  const changedFields: string[] = [];
  let criticalFieldsChanged = false;
  
  // Check critical fields
  for (const field of criticalFields) {
    const cachedValue = cachedUser[field as keyof CachedFoundryUser];
    const foundryValue = foundryUser[field];
    
    if (cachedValue !== foundryValue && foundryValue !== undefined) {
      console.log(`🚨 CRITICAL FIELD CHANGED: ${field}`);
      console.log(`   Cached: ${cachedValue}`);
      console.log(`   Foundry: ${foundryValue}`);
      changedFields.push(field);
      criticalFieldsChanged = true;
    }
  }
  
  // If critical fields changed, require re-login
  if (criticalFieldsChanged) {
    console.log('❌ Critical fields changed - cache INVALID - re-login required');
    return {
      isValid: false,
      needsUpdate: false,
      needsRelogin: true,
      changes: {
        criticalFieldsChanged: true,
        changedFields,
      },
    };
  }
  
  // Check non-critical fields
  for (const field of nonCriticalFields) {
    const cachedValue = cachedUser[field as keyof CachedFoundryUser];
    const foundryValue = foundryUser[field];
    
    if (cachedValue !== foundryValue && foundryValue !== undefined) {
      console.log(`📝 Non-critical field changed: ${field}`);
      console.log(`   Cached: ${cachedValue}`);
      console.log(`   Foundry: ${foundryValue}`);
      changedFields.push(field);
    }
  }
  
  // If non-critical fields changed, update cache but continue
  if (changedFields.length > 0) {
    console.log('✅ Cache valid but needs update - non-critical fields changed');
    return {
      isValid: true,
      needsUpdate: true,
      needsRelogin: false,
      changes: {
        criticalFieldsChanged: false,
        changedFields,
      },
    };
  }
  
  // No changes - cache is valid and up-to-date
  console.log('✅ Cache valid and up-to-date - no changes detected');
  return {
    isValid: true,
    needsUpdate: false,
    needsRelogin: false,
  };
}

/**
 * Update cached user with fresh Foundry data
 * Preserves cache metadata while updating user fields
 * 
 * @param googleUserId - Google User ID
 * @param foundryUser - Fresh user data from Foundry
 */
export async function updateCachedUserFromFoundry(
  googleUserId: string,
  foundryUser: any
): Promise<void> {
  try {
    const existing = await getCachedFoundryUser(googleUserId);
    
    if (!existing) {
      console.log('⚠️ No existing cache to update - creating new cache');
      await cacheFoundryUser(googleUserId, foundryUser, 'lookup');
      return;
    }
    
    // Update with fresh Foundry data while preserving cache metadata
    const updated: CachedFoundryUser = {
      ...existing,
      // Update all fields from Foundry
      $primaryKey: foundryUser.$primaryKey || existing.$primaryKey,
      $title: foundryUser.$title || existing.$title,
      userId: foundryUser.userId || existing.userId,
      googleUserId: foundryUser.googleUserId || existing.googleUserId,
      email: foundryUser.email || existing.email,
      displayName: foundryUser.displayName || existing.displayName,
      accountStatus: foundryUser.accountStatus || existing.accountStatus,
      createdAt: foundryUser.createdAt || existing.createdAt,
      lastLoginAt: foundryUser.lastLoginAt || existing.lastLoginAt,
      updatedAt: foundryUser.updatedAt || new Date().toISOString(),
      // Update cache metadata
      cachedAt: Date.now(),
      lastValidated: Date.now(),
    };
    
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(updated));
    
    console.log('✅ Updated cached user with fresh Foundry data');
  } catch (error) {
    console.error('❌ Error updating cached user:', error);
    throw error;
  }
}

/**
 * Check if Foundry user data is cached
 * 
 * @param googleUserId - Google User ID to check
 * @returns True if user data is cached
 */
export async function hasFoundryUserCache(googleUserId: string): Promise<boolean> {
  try {
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    const cachedData = await SecureStore.getItemAsync(cacheKey);
    return cachedData !== null;
  } catch (error) {
    console.error('❌ Error checking Foundry user cache:', error);
    return false;
  }
}

/**
 * Clear Foundry user cache for a specific user
 * Called on logout or when cache is invalidated
 * 
 * @param googleUserId - Google User ID to clear cache for
 */
export async function clearFoundryUserCache(googleUserId: string): Promise<void> {
  try {
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    await SecureStore.deleteItemAsync(cacheKey);
    console.log('🧹 Cleared Foundry user cache for googleUserId:', googleUserId);
  } catch (error) {
    console.error('❌ Error clearing Foundry user cache:', error);
    throw error;
  }
}

/**
 * Update specific fields in cached Foundry user data
 * Useful for updating individual user properties without full re-cache
 * 
 * @param googleUserId - Google User ID
 * @param updates - Partial user data object with fields to update
 */
export async function updateCachedFoundryUser(
  googleUserId: string,
  updates: Partial<CachedFoundryUser>
): Promise<CachedFoundryUser | null> {
  try {
    const existing = await getCachedFoundryUser(googleUserId);
    
    if (!existing) {
      console.log('⚠️ No existing cache to update for googleUserId:', googleUserId);
      return null;
    }
    
    const updated: CachedFoundryUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      cachedAt: Date.now(), // Update cache timestamp
    };
    
    const cacheKey = `${USER_KEY_PREFIX}${googleUserId}`;
    await SecureStore.setItemAsync(cacheKey, JSON.stringify(updated));
    
    console.log('✅ Updated cached Foundry user for googleUserId:', googleUserId);
    return updated;
  } catch (error) {
    console.error('❌ Error updating cached Foundry user:', error);
    return null;
  }
}

/**
 * Get cache statistics for debugging
 * 
 * @param googleUserId - Google User ID to get stats for
 * @returns Cache statistics object
 */
export async function getFoundryUserCacheStats(googleUserId: string): Promise<{
  isCached: boolean;
  cacheAge?: number;
  lastValidated?: number;
  source?: string;
  userId?: string;
}> {
  try {
    const userData = await getCachedFoundryUser(googleUserId);
    
    if (!userData) {
      return { isCached: false };
    }
    
    return {
      isCached: true,
      cacheAge: Date.now() - userData.cachedAt,
      lastValidated: userData.lastValidated,
      source: userData.source,
      userId: userData.userId,
    };
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    return { isCached: false };
  }
}
