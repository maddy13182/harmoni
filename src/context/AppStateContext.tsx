/**
 * App State Context
 * 
 * Global state management for the application
 * Provides user info and setup result state across the app
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppStateContextType {
  userInfo: any | null;
  setUserInfo: (info: any | null) => void;
  setupResult: any | null;
  setSetupResult: (result: any | null) => void;
  clearAppState: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [setupResult, setSetupResult] = useState<any | null>(null);

  const clearAppState = () => {
    setUserInfo(null);
    setSetupResult(null);
  };

  return (
    <AppStateContext.Provider
      value={{
        userInfo,
        setUserInfo,
        setupResult,
        setSetupResult,
        clearAppState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
