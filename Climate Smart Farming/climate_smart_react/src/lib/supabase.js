import { createClient } from '@supabase/supabase-js';

// Supabase credentials — the anon key is a PUBLIC key (safe for frontend).
// Environment variables take priority; hardcoded values are the fallback
// so the app works on Vercel even without env vars configured.
const SUPABASE_URL = 'https://xpsirvqhvjlspuatpkgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwc2lydnFodmpsc3B1YXRwa2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTc4MDksImV4cCI6MjEwMDI5MzgwOX0.5BLPl1QewxV9OJ1a3rQKQ44ycsc5BtYp9VoZy5DaplQ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
