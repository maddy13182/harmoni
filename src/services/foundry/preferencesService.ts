// User Preferences Service for Foundry
import { User, createUserPreference } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";

/**
 * Get user preferences using link traversal
 */
export async function getUserPreferences(userId: string): Promise<any | null> {
  try {
    console.log('🔍 Looking up user preferences for userId:', userId);
    
    // Use link traversal to get user preferences
    const userPreferencesResult = await foundryClient(User)
      .where({ userId: { $eq: userId } })
      .pivotTo("userPreference")
      .fetchPage();
    
    console.log('📋 User preferences search results:', userPreferencesResult.data.length, 'preferences found');
    
    if (userPreferencesResult.data.length > 0) {
      const preferences = userPreferencesResult.data[0];
      console.log('✅ User preferences found:', preferences);
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
 */
export async function createUserPreferences(preferencesData: any): Promise<any> {
  try {
    console.log('🔨 Creating user preferences with data:', preferencesData);
    
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
