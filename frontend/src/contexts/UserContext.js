import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    hideReels: true,
    hideStories: false,
    hideSuggestions: true,
    lockMode: false,
    lockEndTime: null
  });
  const [timeSaved, setTimeSaved] = useState(0);

  useEffect(() => {
    if (user) {
      const savedPrefs = localStorage.getItem(`icare-preferences-${user.id}`);
      const savedTime = localStorage.getItem(`icare-time-saved-${user.id}`);
      
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      if (savedTime) {
        setTimeSaved(parseInt(savedTime));
      }
    }
  }, [user]);

  const updatePreferences = (newPrefs) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    if (user) {
      localStorage.setItem(`icare-preferences-${user.id}`, JSON.stringify(updatedPrefs));
    }
  };

  const addTimeSaved = (minutes) => {
    const newTime = timeSaved + minutes;
    setTimeSaved(newTime);
    if (user) {
      localStorage.setItem(`icare-time-saved-${user.id}`, newTime.toString());
    }
  };

  const enableLockMode = (hours) => {
    const lockEndTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    updatePreferences({ 
      lockMode: true, 
      lockEndTime: lockEndTime.toISOString() 
    });
  };

  const isLockModeActive = () => {
    if (!preferences.lockMode || !preferences.lockEndTime) return false;
    return new Date() < new Date(preferences.lockEndTime);
  };

  return (
    <UserContext.Provider value={{
      preferences,
      updatePreferences,
      timeSaved,
      addTimeSaved,
      enableLockMode,
      isLockModeActive
    }}>
      {children}
    </UserContext.Provider>
  );
};