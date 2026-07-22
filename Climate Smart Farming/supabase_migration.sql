-- Supabase SQL Migration for Climate-Smart Farming System
-- Compatible with PostgreSQL / Supabase CLI & SQL Editor

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. CUSTOM USERS / PROFILES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(150),
    role VARCHAR(10) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    phone_number VARCHAR(20),
    sector VARCHAR(100) DEFAULT 'Sector 74 - Premium Wheat Estate',
    profile_picture TEXT,
    sms_weather BOOLEAN DEFAULT TRUE,
    sms_soil BOOLEAN DEFAULT TRUE,
    sms_market BOOLEAN DEFAULT TRUE,
    sms_app BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 2. WEATHER RECORDS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weather_records (
    id BIGSERIAL PRIMARY KEY,
    day_name VARCHAR(20) NOT NULL,
    temp_high INT NOT NULL,
    temp_low INT NOT NULL,
    condition VARCHAR(50) NOT NULL,
    precip_chance INT NOT NULL,
    wind_speed INT DEFAULT 12,
    humidity INT DEFAULT 65,
    pressure INT DEFAULT 1012,
    visibility INT DEFAULT 10,
    date DATE NOT NULL,
    is_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 3. SOIL HEALTH TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soil_health (
    id BIGSERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    moisture INT NOT NULL,
    ph NUMERIC(4, 2) NOT NULL,
    nitrogen INT NOT NULL,
    phosphorus INT NOT NULL,
    potassium INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Optimal',
    last_tested TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tips TEXT NOT NULL
);

--------------------------------------------------------------------------------
-- 4. COMMODITY PRICES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commodity_prices (
    id BIGSERIAL PRIMARY KEY,
    crop VARCHAR(100) NOT NULL,
    price_kes INT NOT NULL,
    change_pct NUMERIC(5, 2) NOT NULL,
    is_up BOOLEAN DEFAULT TRUE,
    demand_level VARCHAR(20) DEFAULT 'High' CHECK (demand_level IN ('High', 'Moderate', 'Low')),
    volume_tonnes INT DEFAULT 100,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 5. PEST ALERTS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pest_alerts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('High', 'Medium', 'Low')),
    sector VARCHAR(100) DEFAULT 'All Sectors',
    description TEXT NOT NULL,
    mitigation TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 6. CONSULT MESSAGES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consult_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES public.custom_users(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    replied_by_id BIGINT REFERENCES public.custom_users(id) ON DELETE SET NULL,
    read_by_farmer BOOLEAN DEFAULT FALSE
);

--------------------------------------------------------------------------------
-- 7. FARM REGIONS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_regions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner VARCHAR(150) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    area_acres NUMERIC(8, 2) NOT NULL,
    soil_quality VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Normal' CHECK (status IN ('Prospering', 'Normal', 'Needs Attention')),
    lat_center DOUBLE PRECISION NOT NULL,
    lng_center DOUBLE PRECISION NOT NULL,
    coordinates_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

--------------------------------------------------------------------------------
-- 8. CHAT MESSAGES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES public.custom_users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) DEFAULT 'FARMER' CHECK (sender_type IN ('FARMER', 'AGRO', 'AI')),
    message_text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

--------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_weather_date ON public.weather_records(date);
CREATE INDEX IF NOT EXISTS idx_soil_sector ON public.soil_health(sector);
CREATE INDEX IF NOT EXISTS idx_pest_risk ON public.pest_alerts(risk_level);
CREATE INDEX IF NOT EXISTS idx_consult_sender ON public.consult_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_farmer ON public.chat_messages(farmer_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON public.chat_messages(timestamp);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consult_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read access for weather" ON public.weather_records FOR SELECT USING (true);
CREATE POLICY "Public read access for soil health" ON public.soil_health FOR SELECT USING (true);
CREATE POLICY "Public read access for commodity prices" ON public.commodity_prices FOR SELECT USING (true);
CREATE POLICY "Public read access for pest alerts" ON public.pest_alerts FOR SELECT USING (true);
CREATE POLICY "Public read access for farm regions" ON public.farm_regions FOR SELECT USING (true);

-- Authenticated Full Access Policies
CREATE POLICY "Allow all operations for custom_users" ON public.custom_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for weather_records" ON public.weather_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for soil_health" ON public.soil_health FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for commodity_prices" ON public.commodity_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for pest_alerts" ON public.pest_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for consult_messages" ON public.consult_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for farm_regions" ON public.farm_regions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

--------------------------------------------------------------------------------
-- SEED DATA INSERTS
--------------------------------------------------------------------------------
INSERT INTO public.weather_records (id, day_name, temp_high, temp_low, condition, precip_chance, wind_speed, humidity, pressure, visibility, date, is_today)
VALUES 
    (1, 'Today', 24, 15, 'Sunny', 10, 12, 65, 1012, 10, '2026-06-15', true),
    (2, 'Mon', 25, 16, 'Partly Cloudy', 20, 15, 68, 1011, 10, '2026-06-16', false),
    (3, 'Tue', 22, 14, 'Cloudy', 40, 18, 72, 1010, 9, '2026-06-17', false),
    (4, 'Wed', 20, 12, 'Heavy Rain', 80, 22, 85, 1008, 6, '2026-06-18', false),
    (5, 'Thu', 21, 13, 'Cloudy', 30, 16, 70, 1011, 9, '2026-06-19', false),
    (6, 'Fri', 23, 14, 'Partly Cloudy', 15, 14, 66, 1012, 10, '2026-06-20', false),
    (7, 'Sat', 26, 16, 'Sunny', 5, 10, 60, 1013, 10, '2026-06-21', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.soil_health (id, sector, moisture, ph, nitrogen, phosphorus, potassium, status, tips)
VALUES 
    (1, 'Nakuru County - Njoro Subcounty (Wheat)', 75, 6.5, 45, 18, 240, 'Optimal', 'Soil moisture readiness is Optimal (75%). The NPK balance is well-suited for wheat development. Maintain cover crop residue to conserve moisture ahead of predicted mid-week rainfall.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.commodity_prices (id, crop, price_kes, change_pct, is_up, demand_level, volume_tonnes)
VALUES 
    (1, 'Wheat (90kg Bag)', 4200, 1.2, true, 'High', 1250),
    (2, 'Maize (90kg Bag)', 3150, -0.8, false, 'Moderate', 3400),
    (3, 'Soybeans (90kg Bag)', 6800, 2.5, true, 'High', 600)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pest_alerts (id, title, risk_level, sector, description, mitigation)
VALUES 
    (1, 'Fall Armyworm Alert', 'High', 'Nakuru County - Njoro Subcounty (Wheat)', 'Scouts report initial sightings of fall armyworm egg masses in neighboring fields. Warm temperatures are accelerating hatching cycles.', 'Examine maize/wheat leaf whorls for small pin-holes. Spray organic Neem oil extract immediately for early-stage larvae. Report high infestation counts to agricultural officers.'),
    (2, 'Stem Borer Risk Warning', 'Medium', 'Trans Nzoia County - Kwanza Subcounty (Maize)', 'Late-planted maize is highly susceptible to stem borer larvae attacks in damp field depressions.', 'Apply intercropping techniques with push-pull legumes to naturally deter borer moths, or spray certified biopesticides if threshold limits are exceeded.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.farm_regions (id, name, owner, crop, area_acres, soil_quality, status, lat_center, lng_center, coordinates_json)
VALUES 
    (1, 'North Field - Nakuru (Njoro)', 'GreenAcres Co-op', 'Wheat', 45.2, 'Excellent (pH 6.5)', 'Prospering', -0.303, 36.08, '[[-0.300, 36.075], [-0.300, 36.085], [-0.306, 36.085], [-0.306, 36.075]]'::jsonb),
    (2, 'East Field - Trans Nzoia (Kwanza)', 'Kamau Agro Holdings', 'Maize', 32.5, 'Moderate (pH 5.9)', 'Normal', -0.308, 36.095, '[[-0.308, 36.090], [-0.308, 36.100], [-0.316, 36.100], [-0.316, 36.090]]'::jsonb),
    (3, 'South Zone - Uasin Gishu (Moiben)', 'Wanjiku Farm Trust', 'Soybeans', 22.1, 'Deficient in Nitrogen', 'Needs Attention', -0.320, 36.076, '[[-0.317, 36.070], [-0.317, 36.082], [-0.323, 36.082], [-0.323, 36.070]]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Reset serial sequence IDs to avoid key collisions on future INSERTS
SELECT setval(pg_get_serial_sequence('public.weather_records', 'id'), COALESCE(MAX(id), 1)) FROM public.weather_records;
SELECT setval(pg_get_serial_sequence('public.soil_health', 'id'), COALESCE(MAX(id), 1)) FROM public.soil_health;
SELECT setval(pg_get_serial_sequence('public.commodity_prices', 'id'), COALESCE(MAX(id), 1)) FROM public.commodity_prices;
SELECT setval(pg_get_serial_sequence('public.pest_alerts', 'id'), COALESCE(MAX(id), 1)) FROM public.pest_alerts;
SELECT setval(pg_get_serial_sequence('public.farm_regions', 'id'), COALESCE(MAX(id), 1)) FROM public.farm_regions;
