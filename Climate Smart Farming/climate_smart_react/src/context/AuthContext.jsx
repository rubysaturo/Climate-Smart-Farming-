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
      try {
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
      } catch (err) {
        console.warn('Supabase session check warning:', err);
      }

      // Fallback: localStorage user session
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
        .maybeSingle();
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
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, name }
        }
      });

      if (authErr) {
        console.error('Supabase Auth signUp error:', authErr);
        throw new Error(authErr.message);
      }
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
        console.error('Profile insert error:', profileError);
        if (profileError.code === '23505') {
          throw new Error('Username or email already exists. Please choose a different one.');
        }
        throw new Error(profileError.message || 'Failed to save profile data.');
      }

      return authData.user;
    } catch (err) {
      console.error('Register failed:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (usernameOrEmail, password, saveInfo) => {
    setAuthError(null);
    try {
      let emailToAuth = usernameOrEmail;
      let profileData = null;

      // 1. Try finding user profile by username or email in accounts_customuser
      const { data: byUsername } = await supabase
        .from('accounts_customuser')
        .select('*')
        .eq('username', usernameOrEmail)
        .maybeSingle();

      if (byUsername) {
        profileData = byUsername;
        emailToAuth = byUsername.email;
      } else {
        const { data: byEmail } = await supabase
          .from('accounts_customuser')
          .select('*')
          .eq('email', usernameOrEmail)
          .maybeSingle();
        if (byEmail) {
          profileData = byEmail;
          emailToAuth = byEmail.email;
        }
      }

      // 2. Sign in with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password
      });

      if (authErr) {
        console.error('Supabase Auth signIn error:', authErr);
        throw new Error('Invalid username/email or password');
      }

      // 3. Build user data object
      const userData = profileData ? {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        name: profileData.name || profileData.username,
        role: profileData.role || 'farmer',
        sector: profileData.sector,
        phone_number: profileData.phone_number,
        sms_weather: profileData.sms_weather,
        sms_soil: profileData.sms_soil,
        sms_market: profileData.sms_market,
        sms_app: profileData.sms_app,
      } : {
        id: authData.user.id,
        username: authData.user.user_metadata?.username || usernameOrEmail,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || usernameOrEmail,
        role: 'farmer',
        sector: 'Sector 74 - Premium Wheat Estate',
      };

      const storage = saveInfo ? localStorage : sessionStorage;
      storage.setItem('agrismart_user', JSON.stringify(userData));
      if (saveInfo) localStorage.setItem('agrismart_save_info', 'true');

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login failed:', err);
      setAuthError(err.message);
      throw err;
    }
  };

  // ── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (_) {}
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
        .maybeSingle();

      if (error) throw new Error('Failed to update profile');

      const updatedUser = { ...user, ...(data || profileData) };
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
      forgotPassword,
      theme,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};
