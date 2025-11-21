// User Preferences Service for Foundry
import { User, createUserPreference, modifyUserPreference } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";
import { 
  cacheUserPreferences, 
  getCachedPreferences,
  clearPreferencesCache
} from "../preferencesCache";

/**
 * Get user preferences using link traversal
 * Checks cache first, then queries Foundry if not cached
 */
export async function getUserPreferences(userId: string): Promise<any | null> {
  try {
    console.log('🔍 Looking up user preferences for userId:', userId);
    
    // 1. Check cache first
    const cached = await getCachedPreferences(userId);
    if (cached) {
      console.log('✅ Returning cached preferences (age:', Math.round((Date.now() - cached.cachedAt) / 1000), 'seconds)');
      return cached;
    }
    
    // 2. Query Foundry if not cached
    console.log('📡 No cache found, querying Foundry...');
    const userPreferencesResult = await foundryClient(User)
      .where({ userId: { $eq: userId } })
      .pivotTo("userPreference")
      .fetchPage();
    
    console.log('📋 User preferences search results:', userPreferencesResult.data.length, 'preferences found');
    
    if (userPreferencesResult.data.length > 0) {
      const preferences = userPreferencesResult.data[0];
      console.log('✅ User preferences found:', preferences);
      
      // 3. Cache the result
      await cacheUserPreferences(userId, preferences);
      console.log('💾 Preferences cached for future use');
      
      return preferences;
    }
    
    console.log('📭 No user preferences found');
    return null;
  } catch (error) {
    console.error('❌ Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Create user preferences using the createUserPreference action
 * After creation, queries back the preferences and caches them
 */
export async function createUserPreferences(preferencesData: any): Promise<any> {
  try {
    console.log('🔨 Creating user preferences with data:', preferencesData);
    
    // 1. Create in Foundry
    const result = await foundryClient(createUserPreference).applyAction(preferencesData, {
      $returnEdits: true
    });
    
    console.log('🎉 CREATE USER PREFERENCES API RESPONSE:', JSON.stringify(result, null, 2));
    
    if (result.type === "edits") {
      console.log('📋 Response Type: edits');
      console.log('📊 Edited Object Types Count:', result.editedObjectTypes?.length || 0);
      console.log('📝 Edited Object Types:', result.editedObjectTypes);
      console.log('🔍 Full result structure keys:', Object.keys(result));
    }
    
    // 2. Query back the created preferences to get complete data including auto-generated fields
    const userId = preferencesData.userId;
    console.log('📡 Querying back created preferences for userId:', userId);
    
    const createdPreferences = await foundryClient(User)
      .where({ userId: { $eq: userId } })
      .pivotTo("userPreference")
      .fetchPage();
    
    if (createdPreferences.data.length > 0) {
      const fullPreferences = createdPreferences.data[0];
      console.log('✅ Retrieved complete preferences:', fullPreferences);
      
      // 3. Cache the complete preferences
      await cacheUserPreferences(userId, fullPreferences);
      console.log('💾 Created preferences cached for future use');
      
      return {
        ...result,
        preferences: fullPreferences
      };
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error creating user preferences:', error);
    throw error;
  }
}

/**
 * Check if user has preferences and return them
 */
export async function checkUserPreferences(userId: string): Promise<{
  hasPreferences: boolean;
  preferences?: any;
  error?: any;
}> {
  try {
    const preferences = await getUserPreferences(userId);
    return {
      hasPreferences: preferences !== null,
      preferences: preferences || undefined
    };
  } catch (error) {
    console.error('❌ Error checking user preferences:', error);
    return {
      hasPreferences: false,
      error
    };
  }
}

/**
 * Update user preferences using the modifyUserPreference action
 * After update, refreshes the cache with the latest data
 */
export async function updateUserPreferences(
  userPreferenceId: string,
  updates: {
    calendarViewPreference?: string;
    currentTimezone?: string;
    dateFormat?: string;
    defaultEventDurationMinutes?: number;
    defaultEventPrivacy?: string;
    emailNotificationsEnabled?: boolean;
    homeTimezone?: string;
    isTraveling?: boolean;
    timeFormat?: string;
    weekStartsOn?: number;
    locale?: string;
    pushNotificationsEnabled?: boolean;
    theme?: string;
  }
): Promise<any> {
  try {
    console.log('🔧 Updating user preferences:', userPreferenceId, updates);
    
    // 1. Apply the modify action
    const result = await foundryClient(modifyUserPreference).applyAction(
      {
        user_preference: userPreferenceId,
        ...updates
      },
      {
        $returnEdits: true
      }
    );
    
    console.log('✅ UPDATE USER PREFERENCES API RESPONSE:', JSON.stringify(result, null, 2));
    
    if (result.type === "edits") {
      console.log('📋 Response Type: edits');
      console.log('📊 Edited Object Types Count:', result.editedObjectTypes?.length || 0);
      
      // 2. The result should contain the updated preferences
      // We'll need to refresh from Foundry to get the complete updated object
      // Extract userId from the current cache or query
      return result;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Refresh user preferences from Foundry (bypasses cache)
 * Used after operations that modify preferences in Foundry
 */
export async function refreshUserPreferences(userId: string): Promise<any | null> {
  try {
    console.log('🔄 Refreshing user preferences from Foundry for userId:', userId);
    
    // Clear existing cache first
    await clearPreferencesCache(userId);
    console.log('🧹 Cleared stale preferences cache');
    
    // Query fresh from Foundry
    const userPreferencesResult = await foundryClient(User)
      .where({ userId: { $eq: userId } })
      .pivotTo("userPreference")
      .fetchPage();
    
    if (userPreferencesResult.data.length > 0) {
      const preferences = userPreferencesResult.data[0];
      console.log('✅ Refreshed preferences from Foundry:', preferences);
      
      // Cache the fresh data
      await cacheUserPreferences(userId, preferences);
      console.log('💾 Fresh preferences cached');
      
      return preferences;
    }
    
    console.log('📭 No preferences found during refresh');
    return null;
  } catch (error) {
    console.error('❌ Error refreshing user preferences:', error);
    return null;
  }
}
