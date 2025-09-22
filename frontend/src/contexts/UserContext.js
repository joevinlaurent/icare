import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../services/api';

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
  const [stats, setStats] = useState({
    time_saved: 0,
    sessions_count: 0,
    weekly_time_saved: 0,
    total_sessions: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Reset data when user logs out
      setPreferences({
        hideReels: true,
        hideStories: false,
        hideSuggestions: true,
        lockMode: false,
        lockEndTime: null
      });
      setTimeSaved(0);
      setStats({
        time_saved: 0,
        sessions_count: 0,
        weekly_time_saved: 0,
        total_sessions: 0
      });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load preferences
      const prefsData = await userAPI.getPreferences();
      setPreferences({
        hideReels: prefsData.hide_reels,
        hideStories: prefsData.hide_stories,
        hideSuggestions: prefsData.hide_suggestions,
        lockMode: prefsData.lock_mode,
        lockEndTime: prefsData.lock_end_time
      });

      // Load stats
      const statsData = await userAPI.getStats();
      setStats(statsData);
      setTimeSaved(statsData.time_saved);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to local storage for offline functionality
      const savedPrefs = localStorage.getItem(`icare-preferences-${user.id}`);
      const savedTime = localStorage.getItem(`icare-time-saved-${user.id}`);
      
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      if (savedTime) {
        setTimeSaved(parseInt(savedTime));
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    
    try {
      // Convert camelCase to snake_case for API
      const apiPrefs = {
        hide_reels: updatedPrefs.hideReels,
        hide_stories: updatedPrefs.hideStories,
        hide_suggestions: updatedPrefs.hideSuggestions,
        lock_mode: updatedPrefs.lockMode,
        lock_end_time: updatedPrefs.lockEndTime
      };

      const response = await userAPI.updatePreferences(apiPrefs);
      
      // Update local state with API response
      setPreferences({
        hideReels: response.hide_reels,
        hideStories: response.hide_stories,
        hideSuggestions: response.hide_suggestions,
        lockMode: response.lock_mode,
        lockEndTime: response.lock_end_time
      });

      // Backup to localStorage
      if (user) {
        localStorage.setItem(`icare-preferences-${user.id}`, JSON.stringify(updatedPrefs));
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      
      // If API fails, update local state and localStorage
      setPreferences(updatedPrefs);
      if (user) {
        localStorage.setItem(`icare-preferences-${user.id}`, JSON.stringify(updatedPrefs));
      }
      
      // Rethrow error so UI can handle it
      throw error;
    }
  };

  const addTimeSaved = async (minutes) => {
    try {
      const response = await userAPI.addTimeSaved({ 
        minutes, 
        platform: 'instagram' 
      });
      
      // Update local state
      setTimeSaved(response.total_time_saved);
      
      // Refresh stats
      const statsData = await userAPI.getStats();
      setStats(statsData);
      
      // Backup to localStorage
      if (user) {
        localStorage.setItem(`icare-time-saved-${user.id}`, response.total_time_saved.toString());
      }
    } catch (error) {
      console.error('Error adding time saved:', error);
      
      // Fallback to local calculation
      const newTime = timeSaved + minutes;
      setTimeSaved(newTime);
      if (user) {
        localStorage.setItem(`icare-time-saved-${user.id}`, newTime.toString());
      }
    }
  };

  const enableLockMode = async (hours) => {
    const lockEndTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    
    try {
      await updatePreferences({ 
        lockMode: true, 
        lockEndTime: lockEndTime 
      });
    } catch (error) {
      console.error('Error enabling lock mode:', error);
      throw error;
    }
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
      isLockModeActive,
      stats,
      loading,
      loadUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};