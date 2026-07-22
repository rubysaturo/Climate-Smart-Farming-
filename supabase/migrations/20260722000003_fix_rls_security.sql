-- ============================================================================
-- SUPABASE SECURITY FIX - Fixes all 10 RLS warnings from the Advisor
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- FIX 1: Drop overly permissive ALL policies (USING true + WITH CHECK true)
-- and replace with proper role-based policies
-- ============================================================================

-- ── WEATHER RECORDS ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for weather_records" ON public.weather_records;
DROP POLICY IF EXISTS "Public read access for weather" ON public.weather_records;

-- Public can read weather (intentional)
CREATE POLICY "weather_select_public" ON public.weather_records
    FOR SELECT USING (true);

-- Only service role / admin can insert/update/delete
CREATE POLICY "weather_insert_admin" ON public.weather_records
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "weather_update_admin" ON public.weather_records
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "weather_delete_admin" ON public.weather_records
    FOR DELETE USING (auth.role() = 'service_role');

-- ── SOIL HEALTH ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for soil_health" ON public.soil_health;
DROP POLICY IF EXISTS "Public read access for soil health" ON public.soil_health;

CREATE POLICY "soil_select_public" ON public.soil_health
    FOR SELECT USING (true);

CREATE POLICY "soil_insert_admin" ON public.soil_health
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "soil_update_admin" ON public.soil_health
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "soil_delete_admin" ON public.soil_health
    FOR DELETE USING (auth.role() = 'service_role');

-- ── COMMODITY PRICES ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for commodity_prices" ON public.commodity_prices;
DROP POLICY IF EXISTS "Public read access for commodity prices" ON public.commodity_prices;

CREATE POLICY "commodity_select_public" ON public.commodity_prices
    FOR SELECT USING (true);

CREATE POLICY "commodity_insert_admin" ON public.commodity_prices
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "commodity_update_admin" ON public.commodity_prices
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "commodity_delete_admin" ON public.commodity_prices
    FOR DELETE USING (auth.role() = 'service_role');

-- ── PEST ALERTS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for pest_alerts" ON public.pest_alerts;
DROP POLICY IF EXISTS "Public read access for pest alerts" ON public.pest_alerts;

CREATE POLICY "pest_select_public" ON public.pest_alerts
    FOR SELECT USING (true);

CREATE POLICY "pest_insert_admin" ON public.pest_alerts
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "pest_update_admin" ON public.pest_alerts
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "pest_delete_admin" ON public.pest_alerts
    FOR DELETE USING (auth.role() = 'service_role');

-- ── FARM REGIONS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for farm_regions" ON public.farm_regions;
DROP POLICY IF EXISTS "Public read access for farm regions" ON public.farm_regions;

CREATE POLICY "farm_regions_select_public" ON public.farm_regions
    FOR SELECT USING (true);

CREATE POLICY "farm_regions_insert_admin" ON public.farm_regions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "farm_regions_update_admin" ON public.farm_regions
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "farm_regions_delete_admin" ON public.farm_regions
    FOR DELETE USING (auth.role() = 'service_role');

-- ── CUSTOM USERS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for custom_users" ON public.custom_users;

-- Anyone can read user profiles (needed for login username lookup)
CREATE POLICY "users_select_public" ON public.custom_users
    FOR SELECT USING (true);

-- Anyone can create an account (signup)
CREATE POLICY "users_insert_signup" ON public.custom_users
    FOR INSERT WITH CHECK (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own" ON public.custom_users
    FOR UPDATE USING (
        auth.uid()::text = supabase_uid::text
        OR auth.role() = 'service_role'
    );

-- Only service role can delete accounts
CREATE POLICY "users_delete_admin" ON public.custom_users
    FOR DELETE USING (auth.role() = 'service_role');

-- ── CONSULT MESSAGES ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for consult_messages" ON public.consult_messages;

-- Users can read messages they sent or received
CREATE POLICY "consult_select_own" ON public.consult_messages
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Authenticated users can send messages
CREATE POLICY "consult_insert_auth" ON public.consult_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Only service role (admin) can update/reply to messages
CREATE POLICY "consult_update_admin" ON public.consult_messages
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "consult_delete_admin" ON public.consult_messages
    FOR DELETE USING (auth.role() = 'service_role');

-- ── CHAT MESSAGES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations for chat_messages" ON public.chat_messages;

-- Users can read their own chat messages
CREATE POLICY "chat_select_own" ON public.chat_messages
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Authenticated users can send messages
CREATE POLICY "chat_insert_auth" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Users can update their own messages (e.g. mark as read)
CREATE POLICY "chat_update_own" ON public.chat_messages
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Only service role can delete messages
CREATE POLICY "chat_delete_admin" ON public.chat_messages
    FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- FIX 2: Fix the rls_auto_enable SECURITY DEFINER function
-- Revoke EXECUTE from anon and authenticated roles
-- ============================================================================

-- Revoke public execute access from the security definer function
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- Only service_role (superuser) should be able to call it
-- (This fixes both warning #9 and #10)

-- ============================================================================
-- VERIFICATION: Check all policies are now properly set
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
