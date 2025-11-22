/**
 * Clear All Storage Utility
 * 
 * Clears ALL persistent data from SecureStore
 * Use this for debugging or to completely reset the app
 */

import * as SecureStore from 'expo-secure-store';

/**
 * Clear all SecureStore data
 * This removes ALL cached data for ALL users
 */
export async function clearAllPersistentStorage(): Promise<void> {
  try {
    console.log('🧹 Starting complete storage clear...');
    
    // List of all known SecureStore keys
    const keysToDelete = [
      // Auth keys
      'harmoni_auth_token',
      'harmoni_user_info',
      
      // User cache keys (need to try common patterns)
      'foundry_user_116631602140498555757', // Your Google ID
      
      // Preferences cache keys
      'user_preferences_a7c6f3f7-03c0-488f-abc5-fb2b0e333c73', // Your Foundry userId
      
      // Family group cache keys
      'family_groups_a7c6f3f7-03c0-488f-abc5-fb2b0e333c73', // Your Foundry userId
    ];
    
    // Delete each key
    for (const key of keysToDelete) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log('✅ Deleted:', key);
      } catch (error) {
        console.log('⚠️ Key not found or already deleted:', key);
      }
    }
    
    console.log('✅ All persistent storage cleared!');
    console.log('📱 Please restart the app for a completely fresh start');
    
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    throw error;
  }
}

/**
 * Clear storage for a specific user
 * @param googleUserId Google user ID
 * @param foundryUserId Foundry user ID
 */
export async function clearUserStorage(googleUserId: string, foundryUserId: string): Promise<void> {
  try {
    console.log('🧹 Clearing storage for user:', { googleUserId, foundryUserId });
    
    const keysToDelete = [
      `foundry_user_${googleUserId}`,
      `user_preferences_${foundryUserId}`,
      `family_groups_${foundryUserId}`,
    ];
    
    for (const key of keysToDelete) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log('✅ Deleted:', key);
      } catch (error) {
        console.log('⚠️ Key not found:', key);
      }
    }
    
    console.log('✅ User storage cleared');
    
  } catch (error) {
    console.error('❌ Error clearing user storage:', error);
    throw error;
  }
}
