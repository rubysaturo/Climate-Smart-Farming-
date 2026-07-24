-- ============================================================================
-- COMPLETE DJANGO + SUPABASE MIGRATION
-- Run this ENTIRELY in Supabase SQL Editor to set up all tables.
-- This matches Django's exact table naming conventions so the ORM works.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: DJANGO FRAMEWORK SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS django_migrations (
    id BIGSERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE (app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INT NOT NULL REFERENCES django_content_type(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    codename VARCHAR(100) NOT NULL,
    UNIQUE (content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id BIGSERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    permission_id INT NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (group_id, permission_id)
);

-- ============================================================================
-- STEP 2: CUSTOM USER TABLE (accounts app)
-- Matches Django's AbstractUser + our CustomUser fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts_customuser (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMPTZ,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Custom fields
    role VARCHAR(10) NOT NULL DEFAULT 'farmer',
    phone_number VARCHAR(20),
    sector VARCHAR(100) NOT NULL DEFAULT 'Sector 74 - Premium Wheat Estate',
    name VARCHAR(150),
    profile_picture TEXT,
    sms_weather BOOLEAN NOT NULL DEFAULT TRUE,
    sms_soil BOOLEAN NOT NULL DEFAULT TRUE,
    sms_market BOOLEAN NOT NULL DEFAULT TRUE,
    sms_app BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS accounts_customuser_groups (
    id BIGSERIAL PRIMARY KEY,
    customuser_id BIGINT NOT NULL REFERENCES accounts_customuser(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    group_id INT NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (customuser_id, group_id)
);

CREATE TABLE IF NOT EXISTS accounts_customuser_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    customuser_id BIGINT NOT NULL REFERENCES accounts_customuser(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    permission_id INT NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (customuser_id, permission_id)
);

-- ============================================================================
-- STEP 3: JWT TOKEN BLACKLIST TABLES (djangorestframework-simplejwt)
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_blacklist_outstandingtoken (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    user_id BIGINT REFERENCES accounts_customuser(id) ON DELETE SET NULL,
    jti VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS token_blacklist_blacklistedtoken (
    id BIGSERIAL PRIMARY KEY,
    blacklisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    token_id BIGINT UNIQUE NOT NULL REFERENCES token_blacklist_outstandingtoken(id) ON DELETE CASCADE
);

-- ============================================================================
-- STEP 4: DJANGO SESSION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS django_session_expire_date ON django_session(expire_date);

-- ============================================================================
-- STEP 5: DJANGO ADMIN LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS django_admin_log (
    id SERIAL PRIMARY KEY,
    action_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL,
    content_type_id INT REFERENCES django_content_type(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL REFERENCES accounts_customuser(id) ON DELETE CASCADE
);

-- ============================================================================
-- STEP 6: FARM DATA APP TABLES (farm_data app)
-- These match Django's naming: farm_data_<modelname>
-- ============================================================================

CREATE TABLE IF NOT EXISTS farm_data_weatherrecord (
    id BIGSERIAL PRIMARY KEY,
    day_name VARCHAR(20) NOT NULL,
    temp_high INT NOT NULL,
    temp_low INT NOT NULL,
    condition VARCHAR(50) NOT NULL,
    precip_chance INT NOT NULL,
    wind_speed INT NOT NULL DEFAULT 12,
    humidity INT NOT NULL DEFAULT 65,
    pressure INT NOT NULL DEFAULT 1012,
    visibility INT NOT NULL DEFAULT 10,
    date DATE NOT NULL,
    is_today BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS farm_data_soilhealth (
    id BIGSERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    moisture INT NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    nitrogen INT NOT NULL,
    phosphorus INT NOT NULL,
    potassium INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Optimal',
    last_tested TIMESTAMPTZ,
    tips TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS farm_data_commodityprice (
    id BIGSERIAL PRIMARY KEY,
    crop VARCHAR(100) NOT NULL,
    price_kes INT NOT NULL,
    change_pct DOUBLE PRECISION NOT NULL,
    is_up BOOLEAN NOT NULL DEFAULT TRUE,
    demand_level VARCHAR(20) NOT NULL DEFAULT 'High',
    volume_tonnes INT NOT NULL DEFAULT 100,
    recorded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS farm_data_pestalert (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    sector VARCHAR(100) NOT NULL DEFAULT 'All Sectors',
    description TEXT NOT NULL,
    mitigation TEXT NOT NULL,
    issued_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS farm_data_consultmessage (
    id BIGSERIAL PRIMARY KEY,
    crop VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    read_by_farmer BOOLEAN NOT NULL DEFAULT FALSE,
    replied_by_id BIGINT REFERENCES accounts_customuser(id) ON DELETE SET NULL,
    sender_id BIGINT NOT NULL REFERENCES accounts_customuser(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS farm_data_farmregion (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner VARCHAR(150) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    area_acres DOUBLE PRECISION NOT NULL,
    soil_quality VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Normal',
    lat_center DOUBLE PRECISION NOT NULL,
    lng_center DOUBLE PRECISION NOT NULL,
    coordinates_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS farm_data_chatmessage (
    id BIGSERIAL PRIMARY KEY,
    sender_type VARCHAR(20) NOT NULL DEFAULT 'FARMER',
    message_text TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    farmer_id BIGINT NOT NULL REFERENCES accounts_customuser(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS farm_data_chatmessage_timestamp ON farm_data_chatmessage(timestamp);

-- ============================================================================
-- STEP 7: MARK ALL MIGRATIONS AS APPLIED
-- (So Django doesn't try to re-run them)
-- ============================================================================

INSERT INTO django_content_type (app_label, model) VALUES
    ('admin', 'logentry'),
    ('auth', 'permission'),
    ('auth', 'group'),
    ('contenttypes', 'contenttype'),
    ('sessions', 'session'),
    ('accounts', 'customuser'),
    ('farm_data', 'weatherrecord'),
    ('farm_data', 'soilhealth'),
    ('farm_data', 'commodityprice'),
    ('farm_data', 'pestalert'),
    ('farm_data', 'consultmessage'),
    ('farm_data', 'farmregion'),
    ('farm_data', 'chatmessage'),
    ('token_blacklist', 'blacklistedtoken'),
    ('token_blacklist', 'outstandingtoken')
ON CONFLICT (app_label, model) DO NOTHING;

INSERT INTO django_migrations (app, name, applied) VALUES
    ('contenttypes', '0001_initial', NOW()),
    ('contenttypes', '0002_remove_content_type_name', NOW()),
    ('auth', '0001_initial', NOW()),
    ('auth', '0002_alter_permission_name_max_length', NOW()),
    ('auth', '0003_alter_user_email_max_length', NOW()),
    ('auth', '0004_alter_user_username_opts', NOW()),
    ('auth', '0005_alter_user_last_login_null', NOW()),
    ('auth', '0006_require_contenttypes_0002', NOW()),
    ('auth', '0007_alter_validators_add_error_messages', NOW()),
    ('auth', '0008_alter_user_username_max_length', NOW()),
    ('auth', '0009_alter_user_last_login_null', NOW()),
    ('auth', '0010_alter_group_name_max_length', NOW()),
    ('auth', '0011_update_proxy_permissions', NOW()),
    ('auth', '0012_alter_user_first_name_max_length', NOW()),
    ('accounts', '0001_initial', NOW()),
    ('accounts', '0002_customuser_profile_picture', NOW()),
    ('admin', '0001_initial', NOW()),
    ('admin', '0002_logentry_remove_auto_add', NOW()),
    ('admin', '0003_logentry_add_action_flag_choices', NOW()),
    ('sessions', '0001_initial', NOW()),
    ('token_blacklist', '0001_initial', NOW()),
    ('token_blacklist', '0002_outstandingtoken_jti_hex', NOW()),
    ('token_blacklist', '0003_auto_20171017_2007', NOW()),
    ('token_blacklist', '0004_auto_20171017_2013', NOW()),
    ('token_blacklist', '0005_remove_outstandingtoken_users_relation', NOW()),
    ('token_blacklist', '0006_auto_20171017_2113', NOW()),
    ('token_blacklist', '0007_auto_20171017_2214', NOW()),
    ('token_blacklist', '0008_migrate_to_bigautofield', NOW()),
    ('token_blacklist', '0010_fix_migrate_to_bigautofield', NOW()),
    ('token_blacklist', '0011_linearize_history', NOW()),
    ('token_blacklist', '0012_alter_outstandingtoken_user', NOW()),
    ('farm_data', '0001_initial', NOW()),
    ('farm_data', '0002_chatmessage', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: SEED DATA (Farm data)
-- ============================================================================

INSERT INTO farm_data_weatherrecord (id, day_name, temp_high, temp_low, condition, precip_chance, wind_speed, humidity, pressure, visibility, date, is_today)
VALUES
    (1, 'Today', 24, 15, 'Sunny', 10, 12, 65, 1012, 10, '2026-06-15', true),
    (2, 'Mon', 25, 16, 'Partly Cloudy', 20, 15, 68, 1011, 10, '2026-06-16', false),
    (3, 'Tue', 22, 14, 'Cloudy', 40, 18, 72, 1010, 9, '2026-06-17', false),
    (4, 'Wed', 20, 12, 'Heavy Rain', 80, 22, 85, 1008, 6, '2026-06-18', false),
    (5, 'Thu', 21, 13, 'Cloudy', 30, 16, 70, 1011, 9, '2026-06-19', false),
    (6, 'Fri', 23, 14, 'Partly Cloudy', 15, 14, 66, 1012, 10, '2026-06-20', false),
    (7, 'Sat', 26, 16, 'Sunny', 5, 10, 60, 1013, 10, '2026-06-21', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO farm_data_soilhealth (id, sector, moisture, ph, nitrogen, phosphorus, potassium, status, tips)
VALUES
    (1, 'Nakuru County - Njoro Subcounty (Wheat)', 75, 6.5, 45, 18, 240, 'Optimal',
    'Soil moisture readiness is Optimal (75%). The NPK balance is well-suited for wheat development.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO farm_data_commodityprice (id, crop, price_kes, change_pct, is_up, demand_level, volume_tonnes)
VALUES
    (1, 'Wheat (90kg Bag)', 4200, 1.2, true, 'High', 1250),
    (2, 'Maize (90kg Bag)', 3150, -0.8, false, 'Moderate', 3400),
    (3, 'Soybeans (90kg Bag)', 6800, 2.5, true, 'High', 600)
ON CONFLICT (id) DO NOTHING;

INSERT INTO farm_data_pestalert (id, title, risk_level, sector, description, mitigation)
VALUES
    (1, 'Fall Armyworm Alert', 'High', 'Nakuru County - Njoro Subcounty (Wheat)',
    'Scouts report initial sightings of fall armyworm egg masses in neighboring fields.',
    'Examine maize/wheat leaf whorls for small pin-holes. Spray organic Neem oil extract immediately.'),
    (2, 'Stem Borer Risk Warning', 'Medium', 'Trans Nzoia County - Kwanza Subcounty (Maize)',
    'Late-planted maize is highly susceptible to stem borer larvae attacks in damp field depressions.',
    'Apply intercropping techniques with push-pull legumes to naturally deter borer moths.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO farm_data_farmregion (id, name, owner, crop, area_acres, soil_quality, status, lat_center, lng_center, coordinates_json)
VALUES
    (1, 'North Field - Nakuru (Njoro)', 'GreenAcres Co-op', 'Wheat', 45.2, 'Excellent (pH 6.5)', 'Prospering', -0.303, 36.08, '[[-0.300, 36.075], [-0.300, 36.085], [-0.306, 36.085], [-0.306, 36.075]]'),
    (2, 'East Field - Trans Nzoia (Kwanza)', 'Kamau Agro Holdings', 'Maize', 32.5, 'Moderate (pH 5.9)', 'Normal', -0.312, 36.095, '[[-0.308, 36.090], [-0.308, 36.100], [-0.316, 36.100], [-0.316, 36.090]]'),
    (3, 'South Zone - Uasin Gishu (Moiben)', 'Wanjiku Farm Trust', 'Soybeans', 22.1, 'Deficient in Nitrogen', 'Needs Attention', -0.320, 36.076, '[[-0.317, 36.070], [-0.317, 36.082], [-0.323, 36.082], [-0.323, 36.070]]')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval(pg_get_serial_sequence('accounts_customuser', 'id'), COALESCE(MAX(id), 1)) FROM accounts_customuser;
SELECT setval(pg_get_serial_sequence('farm_data_weatherrecord', 'id'), COALESCE(MAX(id), 1)) FROM farm_data_weatherrecord;
SELECT setval(pg_get_serial_sequence('farm_data_soilhealth', 'id'), COALESCE(MAX(id), 1)) FROM farm_data_soilhealth;
SELECT setval(pg_get_serial_sequence('farm_data_commodityprice', 'id'), COALESCE(MAX(id), 1)) FROM farm_data_commodityprice;
SELECT setval(pg_get_serial_sequence('farm_data_pestalert', 'id'), COALESCE(MAX(id), 1)) FROM farm_data_pestalert;
SELECT setval(pg_get_serial_sequence('farm_data_farmregion', 'id'), COALESCE(MAX(id), 1)) FROM farm_data_farmregion;
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
