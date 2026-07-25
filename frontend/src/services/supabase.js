import { createClient } from "@supabase/supabase-js";
import env from "@/lib/env";

// ── Client creation ──────────────────────────────────────────────────────────
// Credentials are validated in src/lib/env.js. If the variables are missing,
// the client is null and all helpers degrade to no-ops.

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } = env;

const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: "csf_supabase_auth",
        flowType: "pkce",
      },
      realtime: {
        params: { eventsPerSecond: 2 },
      },
    })
  : null;

// ── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Sign up a new user with email and password.
 * Returns { user, session } on success, throws on error.
 */
export const signUp = async ({ email, password, metadata = {} }) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return { user: data.user, session: data.session };
};

/**
 * Sign in with email and password.
 * Returns { user, session } on success, throws on error.
 */
export const signIn = async ({ email, password }) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: data.user, session: data.session };
};

/**
 * Sign out the current user. Clears local session.
 */
export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current session (access + refresh tokens).
 * Returns null if no session exists.
 */
export const getSession = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("[supabase] getSession error:", error.message);
    return null;
  }
  return data.session;
};

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export const getUser = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("[supabase] getUser error:", error.message);
    return null;
  }
  return data.user;
};

/**
 * Force-refresh the current session token.
 * Supabase auto-refreshes, but this can be called explicitly.
 */
export const refreshSession = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.warn("[supabase] refreshSession error:", error.message);
    return null;
  }
  return data.session;
};

/**
 * Send a password reset email.
 */
export const resetPassword = async (email) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

/**
 * Update the current user's password (requires valid session).
 */
export const updatePassword = async (newPassword) => {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

/**
 * Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
 * Returns an unsubscribe function.
 *
 * Usage:
 *   const unsub = onAuthStateChange((event, session) => { ... });
 *   // later: unsub()
 */
export const onAuthStateChange = (callback) => {
  if (!supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

// ── Table query helpers ──────────────────────────────────────────────────────

/**
 * Query a Supabase table. Returns { data, error }.
 *
 * Usage:
 *   const { data, error } = await queryTable("accounts_customuser", {
 *     select: "*",
 *     filters: { supabase_uid: userId },
 *   });
 */
export const queryTable = async (table, { select = "*", filters = {}, order = null, limit = null } = {}) => {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };

  let query = supabase.from(table).select(select);

  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? false });
  }

  if (limit) {
    query = query.limit(limit);
  }

  return query;
};

/**
 * Insert a row into a Supabase table. Returns { data, error }.
 */
export const insertRow = async (table, row) => {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  return supabase.from(table).insert([row]).select().single();
};

/**
 * Update rows in a Supabase table. Returns { data, error }.
 */
export const updateRow = async (table, updates, matchColumn, matchValue) => {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  return supabase.from(table).update(updates).eq(matchColumn, matchValue).select().single();
};

/**
 * Delete rows from a Supabase table. Returns { data, error }.
 */
export const deleteRow = async (table, matchColumn, matchValue) => {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  return supabase.from(table).delete().eq(matchColumn, matchValue);
};

// ── Exports ──────────────────────────────────────────────────────────────────

export { supabase };
export default supabase;
