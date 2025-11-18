/**
 * Family Group Cache Service
 * 
 * Purpose: In-memory caching for family groups to reduce API calls
 * and improve app performance.
 * 
 * Features:
 * - Store family groups in memory
 * - Track selected family group
 * - Cache expiry management
 * - Clear cache on sign out
 */

import { FamilyGroup } from '../types';

interface FamilyGroupCache {
  groups: FamilyGroup[];
  selectedGroup: FamilyGroup | null;
  timestamp: number;
}

// Cache duration: 30 minutes (same as user cache)
const CACHE_DURATION = 30 * 60 * 1000;

// In-memory cache
let cache: FamilyGroupCache = {
  groups: [],
  selectedGroup: null,
  timestamp: 0,
};

/**
 * Store family groups in cache
 * @param groups Array of family groups to cache
 */
export const storeFamilyGroups = (groups: FamilyGroup[]): void => {
  cache.groups = groups;
  cache.selectedGroup = groups[0] || null; // Default to first group
  cache.timestamp = Date.now();
  
  console.log('[FamilyGroupCache] Stored family groups:', {
    count: groups.length,
    selectedGroup: cache.selectedGroup?.groupName,
  });
};

/**
 * Get all cached family groups
 * @returns Array of family groups or empty array if cache expired
 */
export const getFamilyGroups = (): FamilyGroup[] => {
  if (isCacheExpired()) {
    console.log('[FamilyGroupCache] Cache expired, returning empty array');
    return [];
  }
  return cache.groups;
};

/**
 * Get the currently selected family group
 * @returns Selected family group or null
 */
export const getSelectedGroup = (): FamilyGroup | null => {
  if (isCacheExpired()) {
    console.log('[FamilyGroupCache] Cache expired, returning null');
    return null;
  }
  return cache.selectedGroup;
};

/**
 * Set the selected family group
 * @param group Family group to select
 */
export const setSelectedGroup = (group: FamilyGroup): void => {
  cache.selectedGroup = group;
  console.log('[FamilyGroupCache] Selected group:', group.groupName);
};

/**
 * Check if cache has expired
 * @returns true if cache is expired or empty
 */
const isCacheExpired = (): boolean => {
  if (cache.timestamp === 0) {
    return true;
  }
  const now = Date.now();
  const elapsed = now - cache.timestamp;
  return elapsed > CACHE_DURATION;
};

/**
 * Check if cache is valid and has data
 * @returns true if cache has valid data
 */
export const hasCachedGroups = (): boolean => {
  return !isCacheExpired() && cache.groups.length > 0;
};

/**
 * Clear all cached family group data
 * Should be called on sign out
 */
export const clearFamilyGroupCache = (): void => {
  cache = {
    groups: [],
    selectedGroup: null,
    timestamp: 0,
  };
  console.log('[FamilyGroupCache] Cache cleared');
};

/**
 * Add a newly created family group to cache
 * @param group Newly created family group
 */
export const addFamilyGroup = (group: FamilyGroup): void => {
  cache.groups.push(group);
  // If this is the first group, select it
  if (cache.groups.length === 1) {
    cache.selectedGroup = group;
  }
  cache.timestamp = Date.now();
  
  console.log('[FamilyGroupCache] Added new family group:', {
    groupName: group.groupName,
    totalGroups: cache.groups.length,
  });
};

/**
 * Get cache statistics for debugging
 * @returns Cache statistics object
 */
export const getCacheStats = () => {
  return {
    groupCount: cache.groups.length,
    selectedGroup: cache.selectedGroup?.groupName || 'None',
    cacheAge: cache.timestamp > 0 ? Date.now() - cache.timestamp : 0,
    isExpired: isCacheExpired(),
  };
};
