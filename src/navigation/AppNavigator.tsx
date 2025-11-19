/**
 * App Navigator Component
 * 
 * Handles screen rendering based on app state
 * Extracted from App.tsx for better separation of concerns
 */

import React from 'react';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingUpScreen from '../screens/SettingUpScreen';
import UserReadyScreen from '../screens/UserReadyScreen';
import SetupFailedScreen from '../screens/SetupFailedScreen';
import PreferencesSetupScreen from '../screens/PreferencesSetupScreen';
import FamilyGroupCheckScreen from '../screens/FamilyGroupCheckScreen';
import FamilyGroupSetupScreen from '../screens/FamilyGroupSetupScreen';
import { getSelectedGroup } from '../services/familyGroupCache';
import { useAppNavigation } from '../hooks/useAppNavigation';

export const AppNavigator: React.FC = () => {
  const { appState, userInfo, setupResult, handlers } = useAppNavigation();

  // Render appropriate screen based on app state
  const renderScreen = () => {
    console.log('🖥️  RENDERING SCREEN - Current appState:', appState);
    console.log('👤 Current userInfo:', userInfo ? `${userInfo.name} (${userInfo.email})` : 'null');
    
    switch (appState) {
      case 'splash':
        console.log('📱 DISPLAYING: SplashScreen');
        return <SplashScreen onFinish={handlers.handleSplashFinish} />;
      
      case 'login':
        console.log('📱 DISPLAYING: LoginScreen');
        return <LoginScreen onLoginSuccess={handlers.handleLoginSuccess} />;
      
      case 'setting-up':
        console.log('📱 DISPLAYING: SettingUpScreen (Beautiful Gear Loading)');
        console.log('👤 User name for screen:', userInfo?.givenName || userInfo?.name || 'User');
        return <SettingUpScreen userName={userInfo?.givenName || userInfo?.name || 'User'} />;
      
      case 'user-ready':
        console.log('📱 DISPLAYING: UserReadyScreen (Welcome Back!)');
        return (
          <UserReadyScreen 
            message={setupResult?.message || 'Setup complete!'}
            isNewUser={setupResult?.created || false}
            onContinue={handlers.handleUserReadyContinue}
          />
        );
      
      case 'setup-failed':
        console.log('📱 DISPLAYING: SetupFailedScreen');
        return <SetupFailedScreen onRetry={handlers.handleSetupRetry} onSignOut={handlers.handleSignOut} />;
      
      case 'preferences-setup':
        console.log('📱 DISPLAYING: PreferencesSetupScreen');
        return (
          <PreferencesSetupScreen 
            onPreferencesCreated={handlers.handlePreferencesCreated}
            onError={handlers.handlePreferencesError}
            onSignOut={handlers.handleSignOut}
          />
        );
      
      case 'checking-family-groups':
        console.log('📱 DISPLAYING: FamilyGroupCheckScreen');
        return (
          <FamilyGroupCheckScreen
            onNoGroups={handlers.handleNoFamilyGroups}
            onHasGroups={handlers.handleHasFamilyGroups}
            onError={handlers.handleFamilyGroupError}
          />
        );
      
      case 'family-group-setup':
        console.log('📱 DISPLAYING: FamilyGroupSetupScreen');
        return (
          <FamilyGroupSetupScreen
            onGroupCreated={handlers.handleGroupCreated}
            onSignOut={handlers.handleSignOut}
          />
        );
      
      case 'main':
        console.log('📱 DISPLAYING: CalendarScreen (Main App)');
        const selectedGroup = getSelectedGroup();
        return (
          <CalendarScreen 
            onSignOut={handlers.handleSignOut}
            familyGroupName={selectedGroup?.groupName}
          />
        );
      
      default:
        console.log('📱 DISPLAYING: SplashScreen (default fallback)');
        return <SplashScreen onFinish={handlers.handleSplashFinish} />;
    }
  };

  return renderScreen();
};

export default AppNavigator;
