import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "@/services/api";
import {
  supabase,
  signUp as sbSignUp,
  signOut as sbSignOut,
  onAuthStateChange as sbOnAuthStateChange,
} from "@/services/supabase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const STORAGE_KEYS = Object.freeze({
  ACCESS: "csf_access",
  REFRESH: "csf_refresh",
  USER: "csf_user",
});

const SUPABASE_ENABLED = !!supabase;

const buildUser = (raw) => ({
  id: raw.id,
  username: raw.username,
  email: raw.email,
  name: raw.name || raw.username,
  role: raw.role || "farmer",
  sector: raw.sector || "",
  phone_number: raw.phone_number || "",
  sms_weather: raw.sms_weather ?? true,
  sms_soil: raw.sms_soil ?? true,
  sms_market: raw.sms_market ?? true,
  sms_app: raw.sms_app ?? true,
});

const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS);
  localStorage.removeItem(STORAGE_KEYS.REFRESH);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDjangoProfile = useCallback(async () => {
    try {
      const { data } = await auth.getProfile();
      const u = buildUser(data);
      setUser(u);
      saveUser(u);
      return u;
    } catch {
      setUser(null);
      clearAuthStorage();
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS);
      if (token) {
        await fetchDjangoProfile();
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [fetchDjangoProfile]);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;

    const unsub = sbOnAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        clearAuthStorage();
      }
    });

    return unsub;
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await auth.login(identifier, password);
    const u = buildUser(data.user);

    localStorage.setItem(STORAGE_KEYS.ACCESS, data.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH, data.refresh);
    saveUser(u);
    setUser(u);

    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await auth.register(payload);

    if (SUPABASE_ENABLED) {
      try {
        await sbSignUp({
          email: payload.email,
          password: payload.password,
          metadata: { username: payload.username, name: payload.name || payload.username },
        });
      } catch (sbErr) {
        console.warn("[AuthContext] Supabase signUp failed (non-critical):", sbErr.message);
      }
    }

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH);
      if (refreshToken) {
        await auth.logout(refreshToken);
      }
    } catch {
      // ignore — token may already be invalid
    }

    if (SUPABASE_ENABLED) {
      try {
        await sbSignOut();
      } catch {
        // ignore
      }
    }

    clearAuthStorage();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await auth.updateProfile(payload);
    const u = buildUser(data);
    setUser(u);
    saveUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    supabaseEnabled: SUPABASE_ENABLED,
  }), [user, loading, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
