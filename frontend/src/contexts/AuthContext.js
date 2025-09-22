import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('icare-token');
    const savedUser = localStorage.getItem('icare-user');
    
    if (token && savedUser) {
      try {
        // Verify token is still valid by fetching current user
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('icare-user', JSON.stringify(currentUser));
      } catch (error) {
        // Token invalid, clear local storage
        localStorage.removeItem('icare-token');
        localStorage.removeItem('icare-user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('icare-token', response.token);
        localStorage.setItem('icare-user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Erreur de connexion au serveur' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('icare-token', response.token);
        localStorage.setItem('icare-user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Erreur lors de la création du compte' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Erreur de connexion au serveur' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('icare-token');
    localStorage.removeItem('icare-user');
    // Clear all user-specific data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('icare-preferences-') || key.startsWith('icare-time-saved-')) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};