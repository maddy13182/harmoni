/**
 * App Version Constants
 * 
 * Centralized version information for the Harmoni app.
 * Automatically syncs with app.json configuration.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get version from app.json
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// Get build numbers (platform-specific)
export const IOS_BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber || '1';
export const ANDROID_VERSION_CODE = Constants.expoConfig?.android?.versionCode?.toString() || '1';

// Get current platform's build number
export const BUILD_NUMBER = Platform.select({
  ios: IOS_BUILD_NUMBER,
  android: ANDROID_VERSION_CODE,
  default: '1',
});

// Full version string (e.g., "0.9.0 (1)")
export const FULL_VERSION = `${APP_VERSION} (${BUILD_NUMBER})`;

// App name
export const APP_NAME = Constants.expoConfig?.name || 'Harmoni';

// Bundle identifiers
export const BUNDLE_ID = Platform.select({
  ios: Constants.expoConfig?.ios?.bundleIdentifier || 'com.harmoni.familycalendar',
  android: Constants.expoConfig?.android?.package || 'com.harmoni.familycalendar',
  default: 'com.harmoni.familycalendar',
});

// Build date (when the app was compiled)
export const BUILD_DATE = new Date().toISOString().split('T')[0];

// Environment
export const IS_DEV = __DEV__;
export const ENVIRONMENT = IS_DEV ? 'Development' : 'Production';

/**
 * Get formatted version info for display
 */
export const getVersionInfo = () => ({
  appName: APP_NAME,
  version: APP_VERSION,
  buildNumber: BUILD_NUMBER,
  fullVersion: FULL_VERSION,
  platform: Platform.OS,
  bundleId: BUNDLE_ID,
  environment: ENVIRONMENT,
  buildDate: BUILD_DATE,
});

/**
 * Get version string for display in UI
 */
export const getVersionString = (includeBuildNumber: boolean = true): string => {
  if (includeBuildNumber) {
    return `Version ${APP_VERSION} (Build ${BUILD_NUMBER})`;
  }
  return `Version ${APP_VERSION}`;
};

/**
 * Get short version for compact display
 */
export const getShortVersion = (): string => {
  return `v${APP_VERSION}`;
};
