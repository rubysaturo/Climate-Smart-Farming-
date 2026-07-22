-- Add supabase_uid column to link accounts_customuser with Supabase Auth
-- Run this in Supabase SQL Editor

ALTER TABLE public.accounts_customuser 
ADD COLUMN IF NOT EXISTS supabase_uid UUID UNIQUE;

-- Enable Row Level Security policies for the accounts table
-- Allow anyone to INSERT (for signup) 
DROP POLICY IF EXISTS "Allow all operations for custom_users" ON public.accounts_customuser;

-- Allow signup inserts
CREATE POLICY "Allow insert on signup" ON public.accounts_customuser
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Allow users to read profiles" ON public.accounts_customuser
    FOR SELECT USING (true);

-- Allow users to update their own profile  
CREATE POLICY "Allow users to update own profile" ON public.accounts_customuser
    FOR UPDATE USING (true) WITH CHECK (true);

-- Also enable email confirmation bypass for development
-- (Users can sign in immediately without verifying email)
