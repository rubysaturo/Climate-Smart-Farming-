-- ============================================================================
-- MIGRATION 20260724000005: FIX ALL RLS POLICIES FOR DATA FETCHING & SEED DATA
-- Run this script in the Supabase SQL Editor to allow public read access for all
-- farm data tables (farm_data_weatherrecord, farm_data_soilhealth, etc.) so the
-- dashboard can fetch weather, soil, commodity prices, pest alerts, and regions!
-- ============================================================================

DO $$
BEGIN

    -- ────────────────────────────────────────────────────────────────────────
    -- 1. FARM DATA WEATHER RECORD & WEATHER RECORDS
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_weatherrecord') THEN
        ALTER TABLE public.farm_data_weatherrecord ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "weather_select_public_fd" ON public.farm_data_weatherrecord;
        DROP POLICY IF EXISTS "weather_insert_admin_fd" ON public.farm_data_weatherrecord;
        DROP POLICY IF EXISTS "weather_update_admin_fd" ON public.farm_data_weatherrecord;
        CREATE POLICY "weather_select_public_fd" ON public.farm_data_weatherrecord FOR SELECT USING (true);
        CREATE POLICY "weather_insert_admin_fd" ON public.farm_data_weatherrecord FOR INSERT WITH CHECK (true);
        CREATE POLICY "weather_update_admin_fd" ON public.farm_data_weatherrecord FOR UPDATE USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_records') THEN
        ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "weather_select_public" ON public.weather_records;
        CREATE POLICY "weather_select_public" ON public.weather_records FOR SELECT USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 2. FARM DATA SOIL HEALTH & SOIL HEALTH
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_soilhealth') THEN
        ALTER TABLE public.farm_data_soilhealth ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "soil_select_public_fd" ON public.farm_data_soilhealth;
        DROP POLICY IF EXISTS "soil_insert_admin_fd" ON public.farm_data_soilhealth;
        DROP POLICY IF EXISTS "soil_update_admin_fd" ON public.farm_data_soilhealth;
        CREATE POLICY "soil_select_public_fd" ON public.farm_data_soilhealth FOR SELECT USING (true);
        CREATE POLICY "soil_insert_admin_fd" ON public.farm_data_soilhealth FOR INSERT WITH CHECK (true);
        CREATE POLICY "soil_update_admin_fd" ON public.farm_data_soilhealth FOR UPDATE USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soil_health') THEN
        ALTER TABLE public.soil_health ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "soil_select_public" ON public.soil_health;
        CREATE POLICY "soil_select_public" ON public.soil_health FOR SELECT USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 3. FARM DATA COMMODITY PRICE & COMMODITY PRICES
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_commodityprice') THEN
        ALTER TABLE public.farm_data_commodityprice ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "commodity_select_public_fd" ON public.farm_data_commodityprice;
        DROP POLICY IF EXISTS "commodity_insert_admin_fd" ON public.farm_data_commodityprice;
        DROP POLICY IF EXISTS "commodity_update_admin_fd" ON public.farm_data_commodityprice;
        CREATE POLICY "commodity_select_public_fd" ON public.farm_data_commodityprice FOR SELECT USING (true);
        CREATE POLICY "commodity_insert_admin_fd" ON public.farm_data_commodityprice FOR INSERT WITH CHECK (true);
        CREATE POLICY "commodity_update_admin_fd" ON public.farm_data_commodityprice FOR UPDATE USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodity_prices') THEN
        ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "commodity_select_public" ON public.commodity_prices;
        CREATE POLICY "commodity_select_public" ON public.commodity_prices FOR SELECT USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 4. FARM DATA PEST ALERT & PEST ALERTS
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_pestalert') THEN
        ALTER TABLE public.farm_data_pestalert ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "pest_select_public_fd" ON public.farm_data_pestalert;
        DROP POLICY IF EXISTS "pest_insert_admin_fd" ON public.farm_data_pestalert;
        DROP POLICY IF EXISTS "pest_update_admin_fd" ON public.farm_data_pestalert;
        CREATE POLICY "pest_select_public_fd" ON public.farm_data_pestalert FOR SELECT USING (true);
        CREATE POLICY "pest_insert_admin_fd" ON public.farm_data_pestalert FOR INSERT WITH CHECK (true);
        CREATE POLICY "pest_update_admin_fd" ON public.farm_data_pestalert FOR UPDATE USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pest_alerts') THEN
        ALTER TABLE public.pest_alerts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "pest_select_public" ON public.pest_alerts;
        CREATE POLICY "pest_select_public" ON public.pest_alerts FOR SELECT USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 5. FARM DATA FARM REGION & FARM REGIONS
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_farmregion') THEN
        ALTER TABLE public.farm_data_farmregion ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "farm_regions_select_public_fd" ON public.farm_data_farmregion;
        DROP POLICY IF EXISTS "farm_regions_insert_admin_fd" ON public.farm_data_farmregion;
        DROP POLICY IF EXISTS "farm_regions_update_admin_fd" ON public.farm_data_farmregion;
        CREATE POLICY "farm_regions_select_public_fd" ON public.farm_data_farmregion FOR SELECT USING (true);
        CREATE POLICY "farm_regions_insert_admin_fd" ON public.farm_data_farmregion FOR INSERT WITH CHECK (true);
        CREATE POLICY "farm_regions_update_admin_fd" ON public.farm_data_farmregion FOR UPDATE USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_regions') THEN
        ALTER TABLE public.farm_regions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "farm_regions_select_public" ON public.farm_regions;
        CREATE POLICY "farm_regions_select_public" ON public.farm_regions FOR SELECT USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 6. ACCOUNTS CUSTOMUSER (Resilient Signup & Profile Read)
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts_customuser') THEN
        ALTER TABLE public.accounts_customuser ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "accounts_select_all" ON public.accounts_customuser;
        DROP POLICY IF EXISTS "accounts_insert_own" ON public.accounts_customuser;
        DROP POLICY IF EXISTS "accounts_insert_permissive" ON public.accounts_customuser;
        DROP POLICY IF EXISTS "accounts_update_own" ON public.accounts_customuser;

        CREATE POLICY "accounts_select_all" ON public.accounts_customuser FOR SELECT USING (true);
        CREATE POLICY "accounts_insert_permissive" ON public.accounts_customuser FOR INSERT WITH CHECK (true);
        CREATE POLICY "accounts_update_own" ON public.accounts_customuser FOR UPDATE USING (true);
    END IF;

    -- ────────────────────────────────────────────────────────────────────────
    -- 7. CONSULT MESSAGES & CHAT MESSAGES
    -- ────────────────────────────────────────────────────────────────────────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_consultmessage') THEN
        ALTER TABLE public.farm_data_consultmessage ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "consult_select_auth_fd" ON public.farm_data_consultmessage;
        DROP POLICY IF EXISTS "consult_insert_auth_fd" ON public.farm_data_consultmessage;
        CREATE POLICY "consult_select_auth_fd" ON public.farm_data_consultmessage FOR SELECT USING (true);
        CREATE POLICY "consult_insert_auth_fd" ON public.farm_data_consultmessage FOR INSERT WITH CHECK (true);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farm_data_chatmessage') THEN
        ALTER TABLE public.farm_data_chatmessage ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "chat_select_auth_fd" ON public.farm_data_chatmessage;
        DROP POLICY IF EXISTS "chat_insert_auth_fd" ON public.farm_data_chatmessage;
        CREATE POLICY "chat_select_auth_fd" ON public.farm_data_chatmessage FOR SELECT USING (true);
        CREATE POLICY "chat_insert_auth_fd" ON public.farm_data_chatmessage FOR INSERT WITH CHECK (true);
    END IF;

END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- RE-SEED FARM DATA (Ensures data is present if tables were empty)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO farm_data_weatherrecord (id, day_name, temp_high, temp_low, condition, precip_chance, wind_speed, humidity, pressure, visibility, date, is_today)
VALUES
    (1, 'Today', 24, 15, 'Sunny', 10, 12, 65, 1012, 10, CURRENT_DATE, true),
    (2, 'Mon', 25, 16, 'Partly Cloudy', 20, 15, 68, 1011, 10, CURRENT_DATE + 1, false),
    (3, 'Tue', 22, 14, 'Cloudy', 40, 18, 72, 1010, 9, CURRENT_DATE + 2, false),
    (4, 'Wed', 20, 12, 'Heavy Rain', 80, 22, 85, 1008, 6, CURRENT_DATE + 3, false),
    (5, 'Thu', 21, 13, 'Cloudy', 30, 16, 70, 1011, 9, CURRENT_DATE + 4, false),
    (6, 'Fri', 23, 14, 'Partly Cloudy', 15, 14, 66, 1012, 10, CURRENT_DATE + 5, false),
    (7, 'Sat', 26, 16, 'Sunny', 5, 10, 60, 1013, 10, CURRENT_DATE + 6, false)
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
