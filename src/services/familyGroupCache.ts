/**
 * Family Group Cache Service - User-Specific with Persistent Storage
 * 
 * Purpose: User-isolated caching for family groups with dual-layer storage:
 * 1. In-memory cache (fast access, session-only)
 * 2. SecureStore cache (persistent, encrypted, survives app restarts)
 * 
 * Features:
 * - User-specific isolation (keyed by Foundry userId)
 * - Persistent storage across app restarts
 * - Automatic cache expiry (30 minutes)
 * - Secure cleanup on logout
 * 
 * IMPORTANT: All functions require userId parameter to ensure data isolation
 */

import * as SecureStore from 'expo-secure-store';
import { FamilyGroup } from '../types';

interface UserFamilyGroupCache {
  groups: FamilyGroup[];
  selectedGroup: FamilyGroup | null;
  timestamp: number;
  userId: string; // For validation
}

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

// SecureStore key prefix
const CACHE_KEY_PREFIX = 'family_groups_';

// In-memory cache (Map keyed by userId for fast access)
const memoryCache: Map<string, UserFamilyGroupCache> = new Map();

/**
 * Generate SecureStore key for a user
 */
const getCacheKey = (userId: string): string => {
  return `${CACHE_KEY_PREFIX}${userId}`;
};

/**
 * Store family groups in cache (both memory and SecureStore)
 * @param userId Foundry user ID
 * @param groups Array of family groups to cache
 */
export const storeFamilyGroups = async (userId: string, groups: FamilyGroup[]): Promise<void> => {
  try {
    if (!userId) {
      console.error('[FamilyGroupCache] Cannot store groups: userId is required');
      return;
    }

    const cacheData: UserFamilyGroupCache = {
      groups,
      selectedGroup: groups[0] || null, // Default to first group
      timestamp: Date.now(),
      userId,
    };

    // Store in memory for fast access
    memoryCache.set(userId, cacheData);

    // Store in SecureStore for persistence
    await SecureStore.setItemAsync(getCacheKey(userId), JSON.stringify(cacheData));

    console.log('[FamilyGroupCache] Stored family groups for user:', {
      userId,
      count: groups.length,
      selectedGroup: cacheData.selectedGroup?.groupName,
      storage: 'memory + SecureStore',
    });
    
    // Log detailed group information
    if (groups.length > 0) {
      console.log('[FamilyGroupCache] 📋 DETAILED CACHED GROUP DATA:');
      groups.forEach((group, index) => {
        console.log(`[FamilyGroupCache] Cached Group ${index + 1}:`, {
          familyGroupId: group.familyGroupId,
          groupName: group.groupName,
          groupColor: group.groupColor,
          allKeys: Object.keys(group),
        });
      });
    }
  } catch (error) {
    console.error('[FamilyGroupCache] Error storing family groups:', error);
    // Continue even if SecureStore fails - memory cache still works
  }
};

/**
 * Get all cached family groups for a user
 * Checks memory first, then SecureStore, returns empty array if expired
 * @param userId Foundry user ID
 * @returns Array of family groups or empty array
 */
export const getFamilyGroups = async (userId: string): Promise<FamilyGroup[]> => {
  try {
    if (!userId) {
      console.error('[FamilyGroupCache] Cannot get groups: userId is required');
      return [];
    }

    // Check memory cache first
    let cacheData = memoryCache.get(userId);

    // If not in memory, try SecureStore
    if (!cacheData) {
      const storedData = await SecureStore.getItemAsync(getCacheKey(userId));
      if (storedData) {
        cacheData = JSON.parse(storedData);
        
        // Validate userId matches
        if (cacheData && cacheData.userId === userId) {
          // Restore to memory cache
          memoryCache.set(userId, cacheData);
          console.log('[FamilyGroupCache] Restored from SecureStore for user:', userId);
        } else {
          console.warn('[FamilyGroupCache] UserId mismatch in cached data, ignoring');
          return [];
        }
      }
    }

    // Check if cache is expired
    if (cacheData && isCacheExpired(cacheData.timestamp)) {
      console.log('[FamilyGroupCache] Cache expired for user:', userId);
      await clearFamilyGroupCache(userId);
      return [];
    }

    return cacheData?.groups || [];
  } catch (error) {
    console.error('[FamilyGroupCache] Error getting family groups:', error);
    return [];
  }
};

/**
 * Get the currently selected family group for a user
 * @param userId Foundry user ID
 * @returns Selected family group or null
 */
export const getSelectedGroup = async (userId: string): Promise<FamilyGroup | null> => {
  try {
    if (!userId) {
      console.error('[FamilyGroupCache] Cannot get selected group: userId is required');
      return null;
    }

    // Check memory cache first
    let cacheData = memoryCache.get(userId);

    // If not in memory, try SecureStore
    if (!cacheData) {
      const storedData = await SecureStore.getItemAsync(getCacheKey(userId));
      if (storedData) {
        cacheData = JSON.parse(storedData);
        
        // Validate userId matches
        if (cacheData && cacheData.userId === userId) {
          memoryCache.set(userId, cacheData);
        } else {
          return null;
        }
      }
    }

    // Check if cache is expired
    if (cacheData && isCacheExpired(cacheData.timestamp)) {
      await clearFamilyGroupCache(userId);
      return null;
    }

    return cacheData?.selectedGroup || null;
  } catch (error) {
    console.error('[FamilyGroupCache] Error getting selected group:', error);
    return null;
  }
};

/**
 * Set the selected family group for a user
 * @param userId Foundry user ID
 * @param group Family group to select
 */
export const setSelectedGroup = async (userId: string, group: FamilyGroup): Promise<void> => {
  try {
    if (!userId) {
      console.error('[FamilyGroupCache] Cannot set selected group: userId is required');
      return;
    }

    // Get current cache data
    let cacheData = memoryCache.get(userId);

    if (!cacheData) {
      // Try to load from SecureStore
      const storedData = await SecureStore.getItemAsync(getCacheKey(userId));
      if (storedData) {
        cacheData = JSON.parse(storedData);
        if (cacheData?.userId !== userId) {
          console.error('[FamilyGroupCache] UserId mismatch, cannot set selected group');
          return;
        }
      } else {
        console.error('[FamilyGroupCache] No cache found for user, cannot set selected group');
        return;
      }
    }

    // Update selected group
    cacheData.selectedGroup = group;
    cacheData.timestamp = Date.now(); // Refresh timestamp

    // Update both caches
    memoryCache.set(userId, cacheData);
    await SecureStore.setItemAsync(getCacheKey(userId), JSON.stringify(cacheData));

    console.log('[FamilyGroupCache] Selected group updated for user:', {
      userId,
      groupName: group.groupName,
    });
  } catch (error) {
    console.error('[FamilyGroupCache] Error setting selected group:', error);
  }
};

/**
 * Check if cache timestamp has expired
 * @param timestamp Cache timestamp
 * @returns true if expired
 */
const isCacheExpired = (timestamp: number): boolean => {
  if (timestamp === 0) return true;
  const elapsed = Date.now() - timestamp;
  return elapsed > CACHE_DURATION;
};

/**
 * Check if user has valid cached groups
 * @param userId Foundry user ID
 * @returns true if cache has valid data
 */
export const hasCachedGroups = async (userId: string): Promise<boolean> => {
  const groups = await getFamilyGroups(userId);
  return groups.length > 0;
};

/**
 * Clear cached family group data for a specific user
 * Should be called on sign out
 * @param userId Foundry user ID
 */
export const clearFamilyGroupCache = async (userId: string): Promise<void> => {
  try {
    if (!userId) {
      console.warn('[FamilyGroupCache] Cannot clear cache: userId is required');
      return;
    }

    // Clear from memory
    memoryCache.delete(userId);

    // Clear from SecureStore
    await SecureStore.deleteItemAsync(getCacheKey(userId));

    console.log('[FamilyGroupCache] Cache cleared for user:', userId);
  } catch (error) {
    console.error('[FamilyGroupCache] Error clearing cache:', error);
  }
};

/**
 * Clear ALL family group caches (all users)
 * Use this for complete app reset or debugging
 */
export const clearAllFamilyGroupCaches = async (): Promise<void> => {
  try {
    // Clear all memory caches
    const userIds = Array.from(memoryCache.keys());
    memoryCache.clear();

    // Clear all SecureStore caches
    for (const userId of userIds) {
      await SecureStore.deleteItemAsync(getCacheKey(userId));
    }

    console.log('[FamilyGroupCache] All caches cleared for all users');
  } catch (error) {
    console.error('[FamilyGroupCache] Error clearing all caches:', error);
  }
};

/**
 * Add a newly created family group to cache
 * @param userId Foundry user ID
 * @param group Newly created family group
 */
export const addFamilyGroup = async (userId: string, group: FamilyGroup): Promise<void> => {
  try {
    if (!userId) {
      console.error('[FamilyGroupCache] Cannot add group: userId is required');
      return;
    }

    // Get current groups
    const currentGroups = await getFamilyGroups(userId);
    
    // Add new group
    const updatedGroups = [...currentGroups, group];
    
    // Store updated list
    await storeFamilyGroups(userId, updatedGroups);

    console.log('[FamilyGroupCache] Added new family group for user:', {
      userId,
      groupName: group.groupName,
      totalGroups: updatedGroups.length,
    });
  } catch (error) {
    console.error('[FamilyGroupCache] Error adding family group:', error);
  }
};

/**
 * Get cache statistics for debugging
 * @param userId Foundry user ID
 * @returns Cache statistics object
 */
export const getCacheStats = async (userId: string) => {
  try {
    const groups = await getFamilyGroups(userId);
    const selectedGroup = await getSelectedGroup(userId);
    const cacheData = memoryCache.get(userId);

    return {
      userId,
      groupCount: groups.length,
      selectedGroup: selectedGroup?.groupName || 'None',
      cacheAge: cacheData ? Date.now() - cacheData.timestamp : 0,
      isExpired: cacheData ? isCacheExpired(cacheData.timestamp) : true,
      inMemory: memoryCache.has(userId),
    };
  } catch (error) {
    console.error('[FamilyGroupCache] Error getting cache stats:', error);
    return {
      userId,
      groupCount: 0,
      selectedGroup: 'Error',
      cacheAge: 0,
      isExpired: true,
      inMemory: false,
    };
  }
};
