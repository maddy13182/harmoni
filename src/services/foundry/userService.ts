// User Management Service for Foundry
import { Osdk } from "@osdk/client";
import { User, createuser } from "@familycalnderapp/sdk";
import { foundryClient } from "./foundryConfig";
import { userCache } from "../userCache";
import { 
  getCachedFoundryUser, 
  cacheFoundryUser,
  CachedFoundryUser,
  validateCachedUser,
  updateCachedUserFromFoundry,
  clearFoundryUserCache
} from "../persistentUserCache";

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
 * Verify user exists or create them automatically with caching and validation
 * 
 * Strategy: "Cache with Validation"
 * 1. Check persistent cache (SecureStore) first
 * 2. If found, validate against Foundry (sync check)
 * 3. If validation passes:
 *    - Update cache if non-critical fields changed
 *    - Continue with cached data
 * 4. If validation fails (IDs changed):
 *    - Clear cache and force re-login
 * 5. If not cached, query Foundry (lookup or create)
 * 6. Store in persistent cache + memory
 * 
 * @param googleProfile - Google user profile from OAuth
 * @param skipValidation - Skip Foundry validation (for first login)
 */
export async function verifyOrCreateUser(
  googleProfile: any,
  skipValidation: boolean = false
): Promise<UserProvisioningResult> {
  try {
    console.log('🔍 Starting user verification/creation process for:', googleProfile.name);
    console.log('🔧 Skip validation:', skipValidation);
    
    // STEP 1: Check persistent cache first (SecureStore)
    const persistentUser = await getCachedFoundryUser(googleProfile.id);
    
    if (persistentUser && !skipValidation) {
      console.log('📦 User found in persistent cache (SecureStore)');
      console.log('🔍 Validating cached data against Foundry...');
      
      // STEP 2: Query Foundry to validate cached data
      const foundryUser = await findUserByGoogleId(googleProfile.id);
      
      if (!foundryUser) {
        console.log('❌ User not found in Foundry - cache invalid');
        console.log('🧹 Clearing invalid cache...');
        await clearFoundryUserCache(googleProfile.id);
        
        return {
          success: false,
          created: false,
          message: "User not found in Foundry. Please log in again.",
          error: new Error('Cache invalidated - user not found in Foundry')
        };
      }
      
      // STEP 3: Validate cached data against Foundry data
      const validation = validateCachedUser(persistentUser, foundryUser);
      
      if (validation.needsRelogin) {
        // Critical fields changed - clear cache and force re-login
        console.log('🚨 CRITICAL FIELDS CHANGED - Clearing cache and forcing re-login');
        console.log('Changed fields:', validation.changes?.changedFields);
        await clearFoundryUserCache(googleProfile.id);
        
        return {
          success: false,
          created: false,
          message: "Your account information has changed. Please log in again.",
          error: new Error('Cache invalidated - critical fields changed')
        };
      }
      
      if (validation.needsUpdate) {
        // Non-critical fields changed - update cache and continue
        console.log('📝 Non-critical fields changed - updating cache');
        console.log('Changed fields:', validation.changes?.changedFields);
        await updateCachedUserFromFoundry(googleProfile.id, foundryUser);
        
        // Load updated data to in-memory cache
        const updatedUser = await getCachedFoundryUser(googleProfile.id);
        if (updatedUser) {
          userCache.cacheUser(updatedUser, updatedUser.source);
        }
        
        return {
          success: true,
          user: foundryUser,
          created: false,
          message: `User data synced for ${googleProfile.name}`
        };
      }
      
      // Cache is valid and up-to-date
      console.log('✅ Cache valid and up-to-date - using cached data');
      userCache.cacheUser(persistentUser, persistentUser.source);
      
      return {
        success: true,
        user: persistentUser,
        created: false,
        message: `Found cached user record ${googleProfile.name} with userID ${persistentUser.userId}`
      };
    }
    
    if (persistentUser && skipValidation) {
      // Skip validation (first login) - use cached data directly
      console.log('📦 User found in cache - skipping validation (first login)');
      userCache.cacheUser(persistentUser, persistentUser.source);
      
      return {
        success: true,
        user: persistentUser,
        created: false,
        message: `Found cached user record ${googleProfile.name} with userID ${persistentUser.userId}`
      };
    }
    
    console.log('📭 No persistent cache found - querying Foundry');
    
    // STEP 2: Check if user exists in Foundry by googleUserId property
    const existingUser = await findUserByGoogleId(googleProfile.id);
    
    if (existingUser) {
      console.log('👤 User found in Foundry:', existingUser);
      
      // STEP 3: Store in persistent cache (SecureStore) using googleId as key
      await cacheFoundryUser(
        googleProfile.id,
        existingUser,
        'lookup'
      );
      
      // Also cache in memory for fast access during session
      const cachedUserData = userCache.cacheUser(existingUser, 'lookup');
      
      return {
        success: true,
        user: existingUser,
        created: false,
        message: `Found user record ${googleProfile.name} with userID ${existingUser.$primaryKey}`
      };
    }
    
    // STEP 4: User doesn't exist, create them
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
        
        // STEP 5: Store in persistent cache (SecureStore) using googleId as key
        await cacheFoundryUser(
          googleProfile.id,
          createdUser,
          'creation'
        );
        
        // Also cache in memory for fast access during session
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
        
        // Use googleId for persistent cache
        await cacheFoundryUser(googleProfile.id, result, 'creation');
        
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
