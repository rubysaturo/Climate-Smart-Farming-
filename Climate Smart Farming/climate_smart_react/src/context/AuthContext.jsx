import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('agrismart_theme') || 'light');

  useEffect(() => {
    const storedUser = localStorage.getItem('agrismart_user') || sessionStorage.getItem('agrismart_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('agrismart_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const login = async (username, password, saveInfo) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;

      if (saveInfo) {
        localStorage.setItem('agrismart_access', access);
        localStorage.setItem('agrismart_refresh', refresh);
        localStorage.setItem('agrismart_user', JSON.stringify(userData));
        localStorage.setItem('agrismart_save_info', 'true');
      } else {
        sessionStorage.setItem('agrismart_access', access);
        sessionStorage.setItem('agrismart_refresh', refresh);
        sessionStorage.setItem('agrismart_user', JSON.stringify(userData));
        localStorage.removeItem('agrismart_save_info');
      }

      // Delay setting the user state so the success toast is shown on the login screen
      setTimeout(() => {
        setUser(userData);
      }, 1500);

      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid username or password';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrismart_access');
    localStorage.removeItem('agrismart_refresh');
    localStorage.removeItem('agrismart_user');
    localStorage.removeItem('agrismart_save_info');
    
    sessionStorage.removeItem('agrismart_access');
    sessionStorage.removeItem('agrismart_refresh');
    sessionStorage.removeItem('agrismart_user');
  };

  const register = async (signUpData) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/register/', signUpData);
      return response.data;
    } catch (err) {
      const errorMsg = Object.values(err.response?.data || {}).flat().join(' ') || 'Registration failed';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/api/auth/me/', profileData);
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      if (localStorage.getItem('agrismart_save_info') === 'true') {
        localStorage.setItem('agrismart_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('agrismart_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    } catch (err) {
      throw new Error('Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      updateProfile,
      theme,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};
