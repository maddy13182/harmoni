/**
 * Harmoni Family Calendar App - Main Entry Point
 * 
 * Clean, modular entry point that delegates to:
 * - AppStateProvider: Global state management
 * - AppNavigator: Screen rendering and navigation logic
 * 
 * Refactored from 314 lines to ~30 lines for better maintainability
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './src/context/AppStateContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <AppNavigator />
      </AppStateProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
