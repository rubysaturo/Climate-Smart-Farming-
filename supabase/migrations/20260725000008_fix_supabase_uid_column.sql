-- ============================================================================
-- MIGRATION 20260725000008: FIX SUPABASE_UID COLUMN
-- ============================================================================
-- The production Supabase DB may have one of three states:
--   1. Column `supabase_uid` exists and is correct (no-op)
--   2. Column `supabase_uuid` exists but NOT `supabase_uid` (rename it)
--   3. Neither column exists (add it)
--
-- After this migration, the column is guaranteed to be named `supabase_uid`.
-- ============================================================================

DO $$
BEGIN
    -- Case 2: supabase_uuid exists but supabase_uid does not → rename
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
        AND column_name = 'supabase_uuid'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
        AND column_name = 'supabase_uid'
    ) THEN
        ALTER TABLE public.accounts_customuser RENAME COLUMN supabase_uuid TO supabase_uid;
    END IF;

    -- Case 3: Neither column exists → add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
        AND column_name = 'supabase_uid'
    ) THEN
        ALTER TABLE public.accounts_customuser ADD COLUMN supabase_uid UUID UNIQUE;
    END IF;

    -- Ensure the column has a UNIQUE constraint (idempotent)
    -- This is safe because ADD CONSTRAINT IF NOT EXISTS isn't standard PG,
    -- but we can use a DO block with exception handling
    BEGIN
        ALTER TABLE public.accounts_customuser
            ADD CONSTRAINT accounts_customuser_supabase_uid_unique UNIQUE (supabase_uid);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN duplicate_object THEN NULL;
    END;

    -- Drop the old supabase_uuid column if it still exists alongside supabase_uid
    -- (shouldn't happen, but defensive)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
        AND column_name = 'supabase_uuid'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'accounts_customuser'
        AND column_name = 'supabase_uid'
    ) THEN
        ALTER TABLE public.accounts_customuser DROP COLUMN supabase_uuid;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'accounts_customuser' AND column_name LIKE '%supabase%'
-- ORDER BY column_name;
-- ============================================================================
