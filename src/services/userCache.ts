// User Cache Service - Local in-memory storage for user data
import { Osdk } from "@osdk/client";
import { User } from "@familycalnderapp/sdk";

export interface CachedUser {
  // Foundry User object properties
  $primaryKey: string;
  $title: string;
  userId: string;
  googleUserId: string;
  email: string;
  displayName: string;
  accountStatus: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
  
  // Cache metadata
  cachedAt: string;
  source: 'lookup' | 'creation';
}

class UserCacheService {
  private cachedUser: CachedUser | null = null;
  // No expiration - cache persists until cleared (logout or app restart)

  /**
   * Cache user data from Foundry lookup or creation
   */
  cacheUser(foundryUser: Osdk.Instance<User> | any, source: 'lookup' | 'creation'): CachedUser {
    console.log(`📦 Caching user data from ${source}:`, foundryUser);
    
    // Handle both Foundry User object and creation response formats
    const userData = this.normalizeUserData(foundryUser);
    
    const cachedUser: CachedUser = {
      ...userData,
      cachedAt: new Date().toISOString(),
      source
    };
    
    this.cachedUser = cachedUser;
    console.log('✅ User cached successfully:', {
      userId: cachedUser.userId,
      displayName: cachedUser.displayName,
      source: cachedUser.source,
      cachedAt: cachedUser.cachedAt
    });
    
    return cachedUser;
  }

  /**
   * Normalize user data from different sources (lookup vs creation)
   */
  private normalizeUserData(userData: any): Omit<CachedUser, 'cachedAt' | 'source'> {
    // Handle Foundry User object (from lookup)
    if (userData.$primaryKey && userData.$title) {
      return {
        $primaryKey: userData.$primaryKey,
        $title: userData.$title,
        userId: userData.userId || userData.$primaryKey,
        googleUserId: userData.googleUserId,
        email: userData.email,
        displayName: userData.displayName || userData.$title,
        accountStatus: userData.accountStatus || 'active',
        createdAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt,
        updatedAt: userData.updatedAt
      };
    }
    
    // Handle creation response format
    if (userData.editedObjects && userData.editedObjects.length > 0) {
      const createdUser = userData.editedObjects[0];
      return this.normalizeUserData(createdUser);
    }
    
    // Handle direct user object from creation
    return {
      $primaryKey: userData.$primaryKey || userData.userId,
      $title: userData.$title || userData.displayName,
      userId: userData.userId || userData.$primaryKey,
      googleUserId: userData.googleUserId,
      email: userData.email,
      displayName: userData.displayName || userData.$title,
      accountStatus: userData.accountStatus || 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Get cached user data if available
   * No expiration check - cache persists until cleared
   */
  getCachedUser(): CachedUser | null {
    if (!this.cachedUser) {
      console.log('📦 No user data in cache');
      return null;
    }

    const cacheAge = Date.now() - new Date(this.cachedUser.cachedAt).getTime();
    console.log('📦 Retrieved user from cache:', {
      userId: this.cachedUser.userId,
      displayName: this.cachedUser.displayName,
      cacheAge: Math.round(cacheAge / 1000) + 's',
      note: 'No expiration - persists until logout/restart'
    });
    
    return this.cachedUser;
  }

  /**
   * Check if user is cached and valid
   */
  isUserCached(): boolean {
    return this.getCachedUser() !== null;
  }

  /**
   * Clear cached user data
   */
  clearCache(): void {
    console.log('📦 Clearing user cache');
    this.cachedUser = null;
  }

  /**
   * Update specific user properties in cache
   */
  updateCachedUser(updates: Partial<CachedUser>): CachedUser | null {
    if (!this.cachedUser) {
      console.log('📦 No cached user to update');
      return null;
    }

    this.cachedUser = {
      ...this.cachedUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log('📦 Updated cached user:', updates);
    return this.cachedUser;
  }

  /**
   * Get user ID from cache (convenience method)
   */
  getCachedUserId(): string | null {
    const user = this.getCachedUser();
    return user ? user.userId : null;
  }

  /**
   * Get Google ID from cache (convenience method)
   */
  getCachedGoogleId(): string | null {
    const user = this.getCachedUser();
    return user ? user.googleUserId : null;
  }

  /**
   * Get display name from cache (convenience method)
   */
  getCachedDisplayName(): string | null {
    const user = this.getCachedUser();
    return user ? user.displayName : null;
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    isCached: boolean;
    cacheAge?: number;
    source?: string;
    userId?: string;
  } {
    const user = this.getCachedUser();
    if (!user) {
      return { isCached: false };
    }

    return {
      isCached: true,
      cacheAge: Date.now() - new Date(user.cachedAt).getTime(),
      source: user.source,
      userId: user.userId
    };
  }
}

// Export singleton instance
export const userCache = new UserCacheService();
