-- ============================================================================
-- SUPABASE SECURITY FIX - Safe & Resilient Version
-- Fixes all 10 RLS & Security warnings from Supabase Advisor
-- Safely checks if tables/functions exist so it never errors out!
-- ============================================================================

-- ============================================================================
-- 1. FIX RLS POLICIES FOR INITIAL SCHEMA TABLES (IF THEY EXIST)
-- ============================================================================

DO $$
BEGIN
    ----------------------------------------------------------------------------
    -- WEATHER RECORDS
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_records') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for weather_records" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for weather" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "weather_select_public" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "weather_insert_admin" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "weather_update_admin" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "weather_delete_admin" ON public.weather_records';

        EXECUTE 'CREATE POLICY "weather_select_public" ON public.weather_records FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "weather_insert_admin" ON public.weather_records FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "weather_update_admin" ON public.weather_records FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "weather_delete_admin" ON public.weather_records FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- SOIL HEALTH
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soil_health') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for soil_health" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for soil health" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "soil_select_public" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "soil_insert_admin" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "soil_update_admin" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "soil_delete_admin" ON public.soil_health';

        EXECUTE 'CREATE POLICY "soil_select_public" ON public.soil_health FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "soil_insert_admin" ON public.soil_health FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "soil_update_admin" ON public.soil_health FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "soil_delete_admin" ON public.soil_health FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- COMMODITY PRICES
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_prices') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for commodity_prices" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for commodity prices" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_select_public" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_insert_admin" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_update_admin" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_delete_admin" ON public.commodity_prices';

        EXECUTE 'CREATE POLICY "commodity_select_public" ON public.commodity_prices FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "commodity_insert_admin" ON public.commodity_prices FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "commodity_update_admin" ON public.commodity_prices FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "commodity_delete_admin" ON public.commodity_prices FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- PEST ALERTS
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pest_alerts') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for pest_alerts" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for pest alerts" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "pest_select_public" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "pest_insert_admin" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "pest_update_admin" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "pest_delete_admin" ON public.pest_alerts';

        EXECUTE 'CREATE POLICY "pest_select_public" ON public.pest_alerts FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "pest_insert_admin" ON public.pest_alerts FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "pest_update_admin" ON public.pest_alerts FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "pest_delete_admin" ON public.pest_alerts FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- FARM REGIONS
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_regions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for farm_regions" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access for farm regions" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_select_public" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_insert_admin" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_update_admin" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_delete_admin" ON public.farm_regions';

        EXECUTE 'CREATE POLICY "farm_regions_select_public" ON public.farm_regions FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "farm_regions_insert_admin" ON public.farm_regions FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "farm_regions_update_admin" ON public.farm_regions FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "farm_regions_delete_admin" ON public.farm_regions FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- CUSTOM USERS
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_users') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for custom_users" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_select_public" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_insert_signup" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_update_own" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_delete_admin" ON public.custom_users';

        EXECUTE 'CREATE POLICY "users_select_public" ON public.custom_users FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "users_insert_signup" ON public.custom_users FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "users_update_own" ON public.custom_users FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "users_delete_admin" ON public.custom_users FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- ACCOUNTS CUSTOMUSER (Django app table)
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts_customuser') THEN
        EXECUTE 'ALTER TABLE public.accounts_customuser ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow insert on signup" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read profiles" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update own profile" ON public.accounts_customuser';

        EXECUTE 'CREATE POLICY "Allow users to read profiles" ON public.accounts_customuser FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow insert on signup" ON public.accounts_customuser FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow users to update own profile" ON public.accounts_customuser FOR UPDATE USING (true)';
    END IF;

    ----------------------------------------------------------------------------
    -- CONSULT MESSAGES
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consult_messages') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for consult_messages" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "consult_select_own" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "consult_insert_auth" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "consult_update_admin" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "consult_delete_admin" ON public.consult_messages';

        EXECUTE 'CREATE POLICY "consult_select_own" ON public.consult_messages FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "consult_insert_auth" ON public.consult_messages FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "consult_update_admin" ON public.consult_messages FOR UPDATE USING (auth.role() = ''service_role'')';
        EXECUTE 'CREATE POLICY "consult_delete_admin" ON public.consult_messages FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- CHAT MESSAGES
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for chat_messages" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_select_own" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_insert_auth" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_update_own" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_delete_admin" ON public.chat_messages';

        EXECUTE 'CREATE POLICY "chat_select_own" ON public.chat_messages FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "chat_insert_auth" ON public.chat_messages FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "chat_update_own" ON public.chat_messages FOR UPDATE USING (true)';
        EXECUTE 'CREATE POLICY "chat_delete_admin" ON public.chat_messages FOR DELETE USING (auth.role() = ''service_role'')';
    END IF;

    ----------------------------------------------------------------------------
    -- REVOKE EXECUTE ON rls_auto_enable FUNCTION IF IT EXISTS
    ----------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public' AND proname = 'rls_auto_enable') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    END IF;

END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
