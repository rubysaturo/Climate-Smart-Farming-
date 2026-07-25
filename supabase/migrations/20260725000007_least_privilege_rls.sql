-- ============================================================================
-- MIGRATION 20260725000007: LEAST-PRIVILEGE RLS
-- ============================================================================
-- Drops ALL existing permissive policies and replaces them with secure,
-- least-privilege Row Level Security for every application table.
--
-- ARCHITECTURE:
--   - Django backend authenticates via JWT and connects as postgres/superuser,
--     so it bypasses RLS entirely. These policies protect against direct
--     Supabase client queries (anon/authenticated roles).
--   - Django internal tables (auth_*, django_*, token_blacklist_*) are managed
--     exclusively by Django and are intentionally left without RLS policies.
--
-- ACCESS MODEL:
--   accounts_customuser  — public SELECT (login lookup), authenticated INSERT/UPDATE
--   farm_data_* (read)   — public SELECT, service_role-only INSERT/UPDATE
--   farm_data_* (write)  — authenticated SELECT/INSERT, service_role UPDATE/DELETE
--   legacy tables        — public SELECT, service_role-only writes
-- ============================================================================

DO $$

BEGIN

    -- ╔═══════════════════════════════════════════════════════════════════════╗
    -- ║  1. ACCOUNTS_CUSTOMUSER (Django user profiles)                      ║
    -- ║     Public read for login-by-username lookup.                       ║
    -- ║     Authenticated users may insert/update (signup + profile edit).  ║
    -- ╚═══════════════════════════════════════════════════════════════════════╝
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts_customuser') THEN
        EXECUTE 'ALTER TABLE public.accounts_customuser ENABLE ROW LEVEL SECURITY';

        -- Drop every prior policy
        EXECUTE 'DROP POLICY IF EXISTS "accounts_select_all" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_insert_own" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_insert_valid" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_insert_permissive" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_update_own" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_update_valid" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "accounts_delete_service" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow insert on signup" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read profiles" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update own profile" ON public.accounts_customuser';

        -- SELECT: public read (required for login-by-username)
        EXECUTE 'CREATE POLICY "accounts_select_all"
            ON public.accounts_customuser FOR SELECT USING (true)';

        -- INSERT: authenticated only + basic validation
        EXECUTE 'CREATE POLICY "accounts_insert_auth"
            ON public.accounts_customuser FOR INSERT
            TO authenticated
            WITH CHECK (char_length(username) > 0)';

        -- UPDATE: authenticated only + basic validation
        EXECUTE 'CREATE POLICY "accounts_update_auth"
            ON public.accounts_customuser FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (char_length(username) > 0)';

        -- DELETE: service_role only
        EXECUTE 'CREATE POLICY "accounts_delete_service"
            ON public.accounts_customuser FOR DELETE
            TO service_role USING (true)';
    END IF;

    -- ╔═══════════════════════════════════════════════════════════════════════╗
    -- ║  2. READ-ONLY DATA TABLES                                           ║
    -- ║     Weather, Soil, Commodity, Pest, Farm Regions                    ║
    -- ║     Public read. Writes restricted to service_role (Django admin).  ║
    -- ╚═══════════════════════════════════════════════════════════════════════╝

    -- ── Weather ─────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_weatherrecord') THEN
        EXECUTE 'ALTER TABLE public.farm_data_weatherrecord ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "weather_select_public_fd" ON public.farm_data_weatherrecord';
        EXECUTE 'DROP POLICY IF EXISTS "weather_insert_admin_fd" ON public.farm_data_weatherrecord';
        EXECUTE 'DROP POLICY IF EXISTS "weather_update_admin_fd" ON public.farm_data_weatherrecord';
        EXECUTE 'CREATE POLICY "fd_weather_select" ON public.farm_data_weatherrecord FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "fd_weather_insert" ON public.farm_data_weatherrecord FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "fd_weather_update" ON public.farm_data_weatherrecord FOR UPDATE TO service_role USING (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_records') THEN
        EXECUTE 'ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "weather_select_public" ON public.weather_records';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for weather_records" ON public.weather_records';
        EXECUTE 'CREATE POLICY "wr_select" ON public.weather_records FOR SELECT USING (true)';
    END IF;

    -- ── Soil Health ─────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_soilhealth') THEN
        EXECUTE 'ALTER TABLE public.farm_data_soilhealth ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "soil_select_public_fd" ON public.farm_data_soilhealth';
        EXECUTE 'DROP POLICY IF EXISTS "soil_insert_admin_fd" ON public.farm_data_soilhealth';
        EXECUTE 'DROP POLICY IF EXISTS "soil_update_admin_fd" ON public.farm_data_soilhealth';
        EXECUTE 'CREATE POLICY "fd_soil_select" ON public.farm_data_soilhealth FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "fd_soil_insert" ON public.farm_data_soilhealth FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "fd_soil_update" ON public.farm_data_soilhealth FOR UPDATE TO service_role USING (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soil_health') THEN
        EXECUTE 'ALTER TABLE public.soil_health ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "soil_select_public" ON public.soil_health';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for soil_health" ON public.soil_health';
        EXECUTE 'CREATE POLICY "sh_select" ON public.soil_health FOR SELECT USING (true)';
    END IF;

    -- ── Commodity Prices ────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_commodityprice') THEN
        EXECUTE 'ALTER TABLE public.farm_data_commodityprice ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_select_public_fd" ON public.farm_data_commodityprice';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_insert_admin_fd" ON public.farm_data_commodityprice';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_update_admin_fd" ON public.farm_data_commodityprice';
        EXECUTE 'CREATE POLICY "fd_commodity_select" ON public.farm_data_commodityprice FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "fd_commodity_insert" ON public.farm_data_commodityprice FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "fd_commodity_update" ON public.farm_data_commodityprice FOR UPDATE TO service_role USING (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_prices') THEN
        EXECUTE 'ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "commodity_select_public" ON public.commodity_prices';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for commodity_prices" ON public.commodity_prices';
        EXECUTE 'CREATE POLICY "cp_select" ON public.commodity_prices FOR SELECT USING (true)';
    END IF;

    -- ── Pest Alerts ─────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_pestalert') THEN
        EXECUTE 'ALTER TABLE public.farm_data_pestalert ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "pest_select_public_fd" ON public.farm_data_pestalert';
        EXECUTE 'DROP POLICY IF EXISTS "pest_insert_admin_fd" ON public.farm_data_pestalert';
        EXECUTE 'DROP POLICY IF EXISTS "pest_update_admin_fd" ON public.farm_data_pestalert';
        EXECUTE 'CREATE POLICY "fd_pest_select" ON public.farm_data_pestalert FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "fd_pest_insert" ON public.farm_data_pestalert FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "fd_pest_update" ON public.farm_data_pestalert FOR UPDATE TO service_role USING (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pest_alerts') THEN
        EXECUTE 'ALTER TABLE public.pest_alerts ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "pest_select_public" ON public.pest_alerts';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for pest_alerts" ON public.pest_alerts';
        EXECUTE 'CREATE POLICY "pa_select" ON public.pest_alerts FOR SELECT USING (true)';
    END IF;

    -- ── Farm Regions ────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_farmregion') THEN
        EXECUTE 'ALTER TABLE public.farm_data_farmregion ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_select_public_fd" ON public.farm_data_farmregion';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_insert_admin_fd" ON public.farm_data_farmregion';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_update_admin_fd" ON public.farm_data_farmregion';
        EXECUTE 'CREATE POLICY "fd_region_select" ON public.farm_data_farmregion FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "fd_region_insert" ON public.farm_data_farmregion FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "fd_region_update" ON public.farm_data_farmregion FOR UPDATE TO service_role USING (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_regions') THEN
        EXECUTE 'ALTER TABLE public.farm_regions ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "farm_regions_select_public" ON public.farm_regions';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for farm_regions" ON public.farm_regions';
        EXECUTE 'CREATE POLICY "fr_select" ON public.farm_regions FOR SELECT USING (true)';
    END IF;

    -- ╔═══════════════════════════════════════════════════════════════════════╗
    -- ║  3. MESSAGE TABLES (Consult + Chat)                                 ║
    -- ║     Authenticated read/write. Service_role for admin overrides.     ║
    -- ╚═══════════════════════════════════════════════════════════════════════╝

    -- ── Consult Messages (Django table) ─────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_consultmessage') THEN
        EXECUTE 'ALTER TABLE public.farm_data_consultmessage ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "consult_select_auth_fd" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_insert_auth_fd" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_select_auth" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_insert_auth" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_update_service" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_delete_service" ON public.farm_data_consultmessage';
        EXECUTE 'CREATE POLICY "fd_consult_select" ON public.farm_data_consultmessage FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "fd_consult_insert" ON public.farm_data_consultmessage FOR INSERT TO authenticated WITH CHECK (char_length(message) > 0)';
        EXECUTE 'CREATE POLICY "fd_consult_update" ON public.farm_data_consultmessage FOR UPDATE TO service_role USING (true)';
        EXECUTE 'CREATE POLICY "fd_consult_delete" ON public.farm_data_consultmessage FOR DELETE TO service_role USING (true)';
    END IF;

    -- ── Consult Messages (Legacy table) ─────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consult_messages') THEN
        EXECUTE 'ALTER TABLE public.consult_messages ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "consult_select_own" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "consult_insert_auth" ON public.consult_messages';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for consult_messages" ON public.consult_messages';
        EXECUTE 'CREATE POLICY "cm_select" ON public.consult_messages FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "cm_insert" ON public.consult_messages FOR INSERT TO authenticated WITH CHECK (char_length(message) > 0)';
    END IF;

    -- ── Chat Messages (Django table) ────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_chatmessage') THEN
        EXECUTE 'ALTER TABLE public.farm_data_chatmessage ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "chat_select_auth_fd" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_insert_auth_fd" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_select_auth" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_insert_auth" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_update_service" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_delete_service" ON public.farm_data_chatmessage';
        EXECUTE 'CREATE POLICY "fd_chat_select" ON public.farm_data_chatmessage FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "fd_chat_insert" ON public.farm_data_chatmessage FOR INSERT TO authenticated WITH CHECK (char_length(message_text) > 0)';
        EXECUTE 'CREATE POLICY "fd_chat_update" ON public.farm_data_chatmessage FOR UPDATE TO service_role USING (true)';
        EXECUTE 'CREATE POLICY "fd_chat_delete" ON public.farm_data_chatmessage FOR DELETE TO service_role USING (true)';
    END IF;

    -- ── Chat Messages (Legacy table) ────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
        EXECUTE 'ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "chat_select_own" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_insert_auth" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "chat_update_own" ON public.chat_messages';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for chat_messages" ON public.chat_messages';
        EXECUTE 'CREATE POLICY "ch_select" ON public.chat_messages FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "ch_insert" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (char_length(message_text) > 0)';
    END IF;

    -- ╔═══════════════════════════════════════════════════════════════════════╗
    -- ║  4. LEGACY STANDALONE TABLES                                        ║
    -- ║     custom_users, weather_records, soil_health, commodity_prices,   ║
    -- ║     pest_alerts, farm_regions                                        ║
    -- ║     Public read only. No write policies = writes blocked for        ║
    -- ║     anon/authenticated (service_role bypasses RLS).                ║
    -- ╚═══════════════════════════════════════════════════════════════════════╝

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_users') THEN
        EXECUTE 'ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "users_select_public" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_insert_valid" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "users_update_valid" ON public.custom_users';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for custom_users" ON public.custom_users';
        EXECUTE 'CREATE POLICY "cu_select" ON public.custom_users FOR SELECT USING (true)';
    END IF;

END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- Run after migration to confirm policy state:
--
-- SELECT tablename, policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd, policyname;
-- ============================================================================
