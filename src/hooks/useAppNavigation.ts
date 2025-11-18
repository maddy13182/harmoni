/**
 * App Navigation Hook
 * 
 * Custom hook that manages app navigation state and all handler functions
 * Extracted from App.tsx for better modularity and testability
 */

import { useState } from 'react';
import { isAuthenticated, getUserInfo } from '../services/authService';
import { verifyOrCreateUser, checkUserPreferences, getCurrentUser } from '../services/foundryClient';
import { getSelectedGroup } from '../services/familyGroupCache';
import { useAppState } from '../context/AppStateContext';

export type AppState = 'splash' | 'login' | 'setting-up' | 'user-ready' | 'setup-failed' | 'preferences-setup' | 'checking-family-groups' | 'family-group-setup' | 'main';

export const useAppNavigation = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const { userInfo, setUserInfo, setupResult, setSetupResult, clearAppState } = useAppState();

  // Enhanced state setter with logging
  const setAppStateWithLogging = (newState: AppState) => {
    console.log('🔄 STATE CHANGE:', appState, '→', newState);
    setAppState(newState);
  };

  const handleSplashFinish = () => {
    console.log('🚀 handleSplashFinish called - transitioning to setting-up');
    setAppStateWithLogging('setting-up');
    checkAuthStatusAndSetup();
  };

  const handleLoginSuccess = () => {
    console.log('✅ handleLoginSuccess called - skipping welcome, going directly to setting-up');
    setAppStateWithLogging('setting-up');
    setupUserInFoundry();
  };

  const handleWelcomeContinue = async () => {
    console.log('👋 handleWelcomeContinue called - transitioning to setting-up');
    setAppStateWithLogging('setting-up');
    await setupUserInFoundry();
  };

  const checkAuthStatusAndSetup = async () => {
    try {
      console.log('Checking authentication status...');
      const authenticated = await isAuthenticated();
      console.log('Authentication status:', authenticated);
      
      if (authenticated) {
        console.log('User is authenticated, verifying Foundry setup...');
        await setupUserInFoundry();
      } else {
        console.log('User is not authenticated, going to login');
        setAppStateWithLogging('login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAppStateWithLogging('login');
    }
  };

  const setupUserInFoundry = async () => {
    try {
      console.log('Starting user setup process...');
      const currentUserInfo = await getUserInfo();
      
      if (!currentUserInfo) {
        console.log('No user info found, redirecting to login');
        setAppStateWithLogging('login');
        return;
      }

      setUserInfo(currentUserInfo);
      console.log('Setting up user in Foundry:', currentUserInfo.name);
      
      const result = await verifyOrCreateUser(currentUserInfo);
      setSetupResult(result);
      
      if (result.success) {
        console.log('User setup successful:', result.message);
        setAppStateWithLogging('user-ready');
      } else {
        console.log('User setup failed:', result.error);
        setAppStateWithLogging('setup-failed');
      }
    } catch (error) {
      console.error('Error during user setup:', error);
      setSetupResult({
        success: false,
        created: false,
        message: "User creation failed",
        error
      });
      setAppStateWithLogging('setup-failed');
    }
  };

  const handleUserReadyContinue = async () => {
    console.log('🎯 handleUserReadyContinue called - checking preferences in background');
    await checkUserPreferencesStatusInBackground();
  };

  const checkUserPreferencesStatusInBackground = async () => {
    try {
      console.log('🔍 Checking user preferences status in background...');
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ No cached user found, redirecting to login');
        setAppStateWithLogging('login');
        return;
      }

      console.log('👤 Checking preferences for user:', currentUser.userId);
      const preferencesResult = await checkUserPreferences(currentUser.userId);
      
      if (preferencesResult.hasPreferences) {
        console.log('✅ User has preferences, checking family groups');
        setAppStateWithLogging('checking-family-groups');
      } else {
        console.log('📝 User needs to set up preferences');
        setAppStateWithLogging('preferences-setup');
      }
    } catch (error) {
      console.error('❌ Error checking user preferences:', error);
      setAppStateWithLogging('checking-family-groups');
    }
  };

  const handlePreferencesCreated = () => {
    console.log('✅ Preferences created successfully, checking family groups');
    setAppStateWithLogging('checking-family-groups');
  };

  const handlePreferencesError = (error: string) => {
    console.error('❌ Preferences setup error:', error);
    setAppStateWithLogging('checking-family-groups');
  };

  const handleNoFamilyGroups = () => {
    console.log('📭 No family groups found, going to family group setup');
    setAppStateWithLogging('family-group-setup');
  };

  const handleHasFamilyGroups = () => {
    console.log('✅ User has family groups, going to main app');
    const selectedGroup = getSelectedGroup();
    console.log('📋 Selected family group:', selectedGroup?.groupName);
    setAppStateWithLogging('main');
  };

  const handleFamilyGroupError = (error: any) => {
    console.error('❌ Family group check error:', error);
    setAppStateWithLogging('main');
  };

  const handleGroupCreated = (groupName: string) => {
    console.log('✅ Family group created:', groupName);
    setAppStateWithLogging('main');
  };

  const handleSetupRetry = () => {
    console.log('🔄 handleSetupRetry called - transitioning to setting-up');
    setAppStateWithLogging('setting-up');
    setupUserInFoundry();
  };

  const handleSignOut = () => {
    console.log('🚪 handleSignOut called - clearing data and transitioning to login');
    clearAppState();
    setAppStateWithLogging('login');
  };

  return {
    appState,
    userInfo,
    setupResult,
    handlers: {
      handleSplashFinish,
      handleLoginSuccess,
      handleWelcomeContinue,
      handleUserReadyContinue,
      handlePreferencesCreated,
      handlePreferencesError,
      handleNoFamilyGroups,
      handleHasFamilyGroups,
      handleFamilyGroupError,
      handleGroupCreated,
      handleSetupRetry,
      handleSignOut,
    },
  };
};
