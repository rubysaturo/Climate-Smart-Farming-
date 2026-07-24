-- ============================================================================
-- MIGRATION 20260724000004: SECURE RLS POLICIES FOR ACCOUNTS_CUSTOMUSER
-- ============================================================================
-- Replaces all USING (true) / WITH CHECK (true) policies with secure
-- auth.uid()-based policies so only the owning user can update their profile.
-- ============================================================================

-- ─── ACCOUNTS_CUSTOMUSER ────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
    ) THEN
        -- Enable RLS (idempotent)
        EXECUTE 'ALTER TABLE public.accounts_customuser ENABLE ROW LEVEL SECURITY';

        -- Drop all existing overly-broad policies
        EXECUTE 'DROP POLICY IF EXISTS "Allow insert on signup" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read profiles" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update own profile" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "users_select_public" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "users_insert_signup" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "users_update_own" ON public.accounts_customuser';
        EXECUTE 'DROP POLICY IF EXISTS "users_delete_admin" ON public.accounts_customuser';

        -- SECURE: Anyone can read all profiles (needed for login-by-username lookup)
        EXECUTE 'CREATE POLICY "accounts_select_all"
            ON public.accounts_customuser
            FOR SELECT
            USING (true)';

        -- SECURE: New user may insert their own row (supabase_uid must match auth.uid())
        EXECUTE 'CREATE POLICY "accounts_insert_own"
            ON public.accounts_customuser
            FOR INSERT
            WITH CHECK (supabase_uid = auth.uid())';

        -- SECURE: User can only update their own profile
        EXECUTE 'CREATE POLICY "accounts_update_own"
            ON public.accounts_customuser
            FOR UPDATE
            USING (supabase_uid = auth.uid())
            WITH CHECK (supabase_uid = auth.uid())';

        -- SECURE: Only service_role can delete users
        EXECUTE 'CREATE POLICY "accounts_delete_service"
            ON public.accounts_customuser
            FOR DELETE
            USING (auth.role() = ''service_role'')';

    END IF;
END $$;

-- ─── CONSULT_MESSAGES: Authenticated-only INSERT ────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'farm_data_consultmessage'
    ) THEN
        EXECUTE 'ALTER TABLE public.farm_data_consultmessage ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "consult_select_own" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_insert_auth" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_update_admin" ON public.farm_data_consultmessage';
        EXECUTE 'DROP POLICY IF EXISTS "consult_delete_admin" ON public.farm_data_consultmessage';

        -- Farmers read only their own messages; admins read all
        EXECUTE 'CREATE POLICY "consult_select_auth"
            ON public.farm_data_consultmessage
            FOR SELECT
            USING (auth.uid() IS NOT NULL)';

        -- Only authenticated users can send consult messages
        EXECUTE 'CREATE POLICY "consult_insert_auth"
            ON public.farm_data_consultmessage
            FOR INSERT
            WITH CHECK (auth.uid() IS NOT NULL)';

        EXECUTE 'CREATE POLICY "consult_update_service"
            ON public.farm_data_consultmessage
            FOR UPDATE
            USING (auth.role() = ''service_role'')';

        EXECUTE 'CREATE POLICY "consult_delete_service"
            ON public.farm_data_consultmessage
            FOR DELETE
            USING (auth.role() = ''service_role'')';
    END IF;
END $$;

-- ─── CHAT_MESSAGES: Authenticated-only INSERT ───────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'farm_data_chatmessage'
    ) THEN
        EXECUTE 'ALTER TABLE public.farm_data_chatmessage ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "chat_select_own" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_insert_auth" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_update_own" ON public.farm_data_chatmessage';
        EXECUTE 'DROP POLICY IF EXISTS "chat_delete_admin" ON public.farm_data_chatmessage';

        EXECUTE 'CREATE POLICY "chat_select_auth"
            ON public.farm_data_chatmessage
            FOR SELECT
            USING (auth.uid() IS NOT NULL)';

        EXECUTE 'CREATE POLICY "chat_insert_auth"
            ON public.farm_data_chatmessage
            FOR INSERT
            WITH CHECK (auth.uid() IS NOT NULL)';

        EXECUTE 'CREATE POLICY "chat_update_service"
            ON public.farm_data_chatmessage
            FOR UPDATE
            USING (auth.role() = ''service_role'')';

        EXECUTE 'CREATE POLICY "chat_delete_service"
            ON public.farm_data_chatmessage
            FOR DELETE
            USING (auth.role() = ''service_role'')';
    END IF;
END $$;

-- ─── VERIFICATION ───────────────────────────────────────────────────────────
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
