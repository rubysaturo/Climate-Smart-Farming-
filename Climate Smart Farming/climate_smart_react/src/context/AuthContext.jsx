import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('agrismart_theme') || 'light');

  // On mount: check for existing Supabase session OR legacy localStorage session
  useEffect(() => {
    const initAuth = async () => {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setLoading(false);
          return;
        }
      }

      // Fallback: legacy localStorage user (from old Django JWT sessions)
      const storedUser = localStorage.getItem('agrismart_user') || sessionStorage.getItem('agrismart_user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (_) {}
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes (login / logout via Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('agrismart_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Fetch user profile from accounts_customuser table
  const fetchProfile = async (supabaseUserId) => {
    try {
      const { data, error } = await supabase
        .from('accounts_customuser')
        .select('*')
        .eq('supabase_uid', supabaseUserId)
        .single();
      if (error || !data) return null;
      return data;
    } catch (_) {
      return null;
    }
  };

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const register = async (signUpData) => {
    setAuthError(null);
    try {
      const { username, password, email, name, phone_number, sector, role } = signUpData;

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, name }
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData?.user) throw new Error('Registration failed. Please try again.');

      // 2. Store profile in accounts_customuser table
      const { error: profileError } = await supabase
        .from('accounts_customuser')
        .insert([{
          username,
          email,
          name: name || '',
          phone_number: phone_number || '',
          sector: sector || 'Sector 74 - Premium Wheat Estate',
          role: role || 'farmer',
          password: 'supabase-auth', // placeholder - auth handled by Supabase
          is_superuser: false,
          is_staff: role === 'admin',
          is_active: true,
          first_name: '',
          last_name: '',
          sms_weather: true,
          sms_soil: true,
          sms_market: true,
          sms_app: true,
          supabase_uid: authData.user.id
        }]);

      if (profileError) {
        // Username or email already exists
        if (profileError.code === '23505') {
          throw new Error('Username or email already exists. Please choose a different one.');
        }
        throw new Error(profileError.message || 'Failed to save profile data.');
      }

      return authData.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (username, password, saveInfo) => {
    setAuthError(null);
    try {
      // Try to find user's email from username in our table
      const { data: profileData, error: lookupError } = await supabase
        .from('accounts_customuser')
        .select('email, username, role, name, sector, phone_number, sms_weather, sms_soil, sms_market, sms_app, id')
        .eq('username', username)
        .single();

      if (lookupError || !profileData) {
        throw new Error('Invalid username or password');
      }

      // Sign in with Supabase Auth using email
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password
      });

      if (authErr) throw new Error('Invalid username or password');

      const userData = {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        sector: profileData.sector,
        phone_number: profileData.phone_number,
        sms_weather: profileData.sms_weather,
        sms_soil: profileData.sms_soil,
        sms_market: profileData.sms_market,
        sms_app: profileData.sms_app,
      };

      const storage = saveInfo ? localStorage : sessionStorage;
      storage.setItem('agrismart_user', JSON.stringify(userData));
      if (saveInfo) localStorage.setItem('agrismart_save_info', 'true');

      setTimeout(() => setUser(userData), 1500);
      return userData;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('agrismart_access');
    localStorage.removeItem('agrismart_refresh');
    localStorage.removeItem('agrismart_user');
    localStorage.removeItem('agrismart_save_info');
    sessionStorage.removeItem('agrismart_access');
    sessionStorage.removeItem('agrismart_refresh');
    sessionStorage.removeItem('agrismart_user');
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('accounts_customuser')
        .update(profileData)
        .eq('username', user?.username)
        .select()
        .single();

      if (error) throw new Error('Failed to update profile');

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);

      const storage = localStorage.getItem('agrismart_save_info') === 'true' ? localStorage : sessionStorage;
      storage.setItem('agrismart_user', JSON.stringify(updatedUser));
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
