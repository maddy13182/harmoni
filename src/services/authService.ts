// Google OAuth Authentication Service
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { clearUserCache } from './foundryClient';

// Enable web browser to close after authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// iOS Client ID for production standalone app
const GOOGLE_IOS_CLIENT_ID = '1029771347588-m61s1m0vpiv0lc8tsc1k1at1q4ermgtl.apps.googleusercontent.com';
// Web Client ID for Expo Go development
const GOOGLE_WEB_CLIENT_ID = '1029771347588-94gav3kiecrqlf6pkihne2vgeeet0a1d.apps.googleusercontent.com';
// Android Client ID for Android app
const GOOGLE_ANDROID_CLIENT_ID = '1029771347588-qrpi0qt8uv85fg5rrnhksa820jo0runn.apps.googleusercontent.com';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

// Storage keys
const TOKEN_KEY = 'harmoni_auth_token';
const USER_KEY = 'harmoni_user_info';

/**
 * Initialize Google OAuth request using Expo's Google provider
 * This properly handles redirect URIs for both development and production
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  console.log('Google Auth Request created:', request ? 'exists' : 'null');
  if (request) {
    console.log('Redirect URI:', request.redirectUri);
  }

  return { request, response, promptAsync };
};

/**
 * Fetch user info from Google
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<UserInfo> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      givenName: data.given_name,
      familyName: data.family_name,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

/**
 * Store authentication token securely
 */
export async function storeAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
}

/**
 * Retrieve stored authentication token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

/**
 * Store user info securely
 */
export async function storeUserInfo(userInfo: UserInfo): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error storing user info:', error);
    throw error;
  }
}

/**
 * Retrieve stored user info
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const userInfoString = await SecureStore.getItemAsync(USER_KEY);
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return null;
  }
}

/**
 * Clear all stored authentication data
 */
export async function clearAuthData(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthToken();
    return token !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Sign out user - clears both auth data and user cache
 */
export async function signOut(): Promise<void> {
  console.log('🚪 Signing out user...');
  
  // Clear secure storage (auth tokens and user info)
  await clearAuthData();
  
  // Clear in-memory user cache
  clearUserCache();
  
  console.log('✅ User signed out successfully');
}
