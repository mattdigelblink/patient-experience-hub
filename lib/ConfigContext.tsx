'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ConfigContextType {
  journeyNotesEnabled: boolean;
  setJourneyNotesEnabled: (enabled: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [journeyNotesEnabled, setJourneyNotesEnabled] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('journeyNotesEnabled');
    if (stored !== null) {
      setJourneyNotesEnabled(stored === 'true');
    }
  }, []);

  const handleSetJourneyNotesEnabled = (enabled: boolean) => {
    setJourneyNotesEnabled(enabled);
    localStorage.setItem('journeyNotesEnabled', String(enabled));
  };

  return (
    <ConfigContext.Provider
      value={{
        journeyNotesEnabled,
        setJourneyNotesEnabled: handleSetJourneyNotesEnabled,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
