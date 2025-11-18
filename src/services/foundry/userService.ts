// User Management Service for Foundry
import { Osdk } from "@osdk/client";
import { User, createuser } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";
import { userCache } from "../userCache";

// User management interfaces
export interface FoundryUserCheckResult {
  exists: boolean;
  user?: Osdk.Instance<User>;
  error?: any;
}

export interface UserProvisioningResult {
  success: boolean;
  user?: any;
  created: boolean;
  message: string;
  error?: any;
}

/**
 * Find user by Google ID using property filter (not primary key lookup)
 */
export async function findUserByGoogleId(googleId: string): Promise<Osdk.Instance<User> | null> {
  try {
    console.log('Searching for user by googleUserId:', googleId);
    const UserObjectSet = foundryClient(User).where({
      googleUserId: { $eq: googleId }
    });
    
    const results = await UserObjectSet.fetchPage();
    console.log('User search results:', results.data.length, 'users found');
    
    return results.data.length > 0 ? results.data[0] : null;
  } catch (error) {
    console.error('Error searching for user:', error);
    return null;
  }
}

/**
 * Create a new user in Foundry using the createuser action
 */
export async function createFoundryUser(googleProfile: any): Promise<any> {
  try {
    // Extract only the required parameters for the createuser action
    const actionParameters = {
      googleId: googleProfile.id,
      firstName: googleProfile.givenName || googleProfile.name.split(' ')[0],
      lastName: googleProfile.familyName || googleProfile.name.split(' ').slice(1).join(' '),
      email: googleProfile.email
    };
    
    console.log('🔨 Creating new user in Foundry with parameters:', actionParameters);
    
    const result = await foundryClient(createuser).applyAction(actionParameters, {
      $returnEdits: true
    });
    
    console.log('🎉 CREATE USER API RESPONSE - Full Result:', JSON.stringify(result, null, 2));
    
    // Log detailed breakdown of the response
    if (result.type === "edits") {
      console.log('📋 Response Type: edits');
      console.log('📊 Edited Object Types Count:', result.editedObjectTypes?.length || 0);
      console.log('📝 Edited Object Types:', result.editedObjectTypes);
      
      // Note: editedObjectTypes contains type names, not the actual objects
      // The actual created objects should be accessible through other properties
      console.log('🔍 Full result structure keys:', Object.keys(result));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

/**
 * Verify user exists or create them automatically with caching
 */
export async function verifyOrCreateUser(googleProfile: any): Promise<UserProvisioningResult> {
  try {
    console.log('🔍 Starting user verification/creation process for:', googleProfile.name);
    
    // Check cache first
    const cachedUser = userCache.getCachedUser();
    if (cachedUser && cachedUser.googleUserId === googleProfile.id) {
      console.log('📦 User found in cache, skipping Foundry lookup');
      return {
        success: true,
        user: cachedUser,
        created: false,
        message: `Found cached user record ${googleProfile.name} with userID ${cachedUser.userId}`
      };
    }
    
    // 1. Check if user exists by googleUserId property
    const existingUser = await findUserByGoogleId(googleProfile.id);
    
    if (existingUser) {
      console.log('👤 User found in Foundry:', existingUser);
      
      // Cache the found user
      const cachedUserData = userCache.cacheUser(existingUser, 'lookup');
      
      return {
        success: true,
        user: existingUser,
        created: false,
        message: `Found user record ${googleProfile.name} with userID ${existingUser.$primaryKey}`
      };
    }
    
    // 2. User doesn't exist, create them
    console.log('🔨 User not found, creating new user...');
    const result = await createFoundryUser(googleProfile);
    
    if (result.type === "edits" && result.editedObjectTypes && result.editedObjectTypes.length > 0) {
      console.log('🎉 User created successfully, result structure:', Object.keys(result));
      
      // After creation, we need to fetch the actual user object to get all properties
      // The creation result might not contain the full user object
      console.log('🔄 Fetching created user to get complete object...');
      const createdUser = await findUserByGoogleId(googleProfile.id);
      
      if (createdUser) {
        console.log('✅ Retrieved created user object:', createdUser);
        
        // Cache the created user
        const cachedUserData = userCache.cacheUser(createdUser, 'creation');
        
        return {
          success: true,
          user: createdUser,
          created: true,
          message: `User ${googleProfile.name} with userID ${createdUser.$primaryKey} created`
        };
      } else {
        // Fallback: cache the creation result as-is
        console.log('⚠️  Could not fetch created user, using creation result');
        const cachedUserData = userCache.cacheUser(result, 'creation');
        
        return {
          success: true,
          user: result,
          created: true,
          message: `User ${googleProfile.name} created (using creation result)`
        };
      }
    } else {
      throw new Error('User creation returned unexpected result format');
    }
    
  } catch (error) {
    console.error('❌ User verification/creation failed:', error);
    return {
      success: false,
      created: false,
      message: "User creation failed",
      error
    };
  }
}

/**
 * Legacy function for backward compatibility
 * Check if user exists by Google ID
 */
export async function checkUserExists(googleId: string): Promise<FoundryUserCheckResult> {
  const user = await findUserByGoogleId(googleId);
  return {
    exists: user !== null,
    user: user || undefined,
    error: user === null ? new Error('User not found') : undefined
  };
}

/**
 * Get user details from Foundry
 */
export async function getFoundryUser(googleId: string): Promise<Osdk.Instance<User> | null> {
  return await findUserByGoogleId(googleId);
}
