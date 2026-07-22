import axios from 'axios';
import { supabase } from '../lib/supabase';

// Mock Initial Data Fallbacks
const MOCK_DATA = {
  weather: [
    { id: 1, day_name: 'Today', temp_high: 24, temp_low: 15, condition: 'Sunny', precip_chance: 10, wind_speed: 12, humidity: 65, pressure: 1012, visibility: 10, date: '2026-06-15', is_today: true },
    { id: 2, day_name: 'Mon', temp_high: 25, temp_low: 16, condition: 'Partly Cloudy', precip_chance: 20, wind_speed: 15, humidity: 68, pressure: 1011, visibility: 10, date: '2026-06-16', is_today: false },
    { id: 3, day_name: 'Tue', temp_high: 22, temp_low: 14, condition: 'Cloudy', precip_chance: 40, wind_speed: 18, humidity: 72, pressure: 1010, visibility: 9, date: '2026-06-17', is_today: false },
    { id: 4, day_name: 'Wed', temp_high: 20, temp_low: 12, condition: 'Heavy Rain', precip_chance: 80, wind_speed: 22, humidity: 85, pressure: 1008, visibility: 6, date: '2026-06-18', is_today: false },
    { id: 5, day_name: 'Thu', temp_high: 21, temp_low: 13, condition: 'Cloudy', precip_chance: 30, wind_speed: 16, humidity: 70, pressure: 1011, visibility: 9, date: '2026-06-19', is_today: false },
    { id: 6, day_name: 'Fri', temp_high: 23, temp_low: 14, condition: 'Partly Cloudy', precip_chance: 15, wind_speed: 14, humidity: 66, pressure: 1012, visibility: 10, date: '2026-06-20', is_today: false },
    { id: 7, day_name: 'Sat', temp_high: 26, temp_low: 16, condition: 'Sunny', precip_chance: 5, wind_speed: 10, humidity: 60, pressure: 1013, visibility: 10, date: '2026-06-21', is_today: false }
  ],
  soil: {
    id: 1,
    sector: 'Nakuru County - Njoro Subcounty (Wheat)',
    moisture: 75,
    ph: 6.5,
    nitrogen: 45,
    phosphorus: 18,
    potassium: 240,
    status: 'Optimal',
    last_tested: new Date().toISOString(),
    tips: 'Soil moisture readiness is Optimal (75%). The NPK balance is well-suited for wheat development. Maintain cover crop residue to conserve moisture ahead of predicted mid-week rainfall.'
  },
  commodities: [
    { id: 1, crop: 'Wheat (90kg Bag)', price_kes: 4200, change_pct: 1.2, is_up: true, demand_level: 'High', volume_tonnes: 1250 },
    { id: 2, crop: 'Maize (90kg Bag)', price_kes: 3150, change_pct: -0.8, is_up: false, demand_level: 'Moderate', volume_tonnes: 3400 },
    { id: 3, crop: 'Soybeans (90kg Bag)', price_kes: 6800, change_pct: 2.5, is_up: true, demand_level: 'High', volume_tonnes: 600 }
  ],
  pestAlerts: [
    { id: 1, title: 'Fall Armyworm Alert', risk_level: 'High', sector: 'Nakuru County - Njoro Subcounty (Wheat)', description: 'Scouts report initial sightings of fall armyworm egg masses in neighboring fields. Warm temperatures are accelerating hatching cycles.', mitigation: 'Examine maize/wheat leaf whorls for small pin-holes. Spray organic Neem oil extract immediately for early-stage larvae.' },
    { id: 2, title: 'Stem Borer Risk Warning', risk_level: 'Medium', sector: 'Trans Nzoia County - Kwanza Subcounty (Maize)', description: 'Late-planted maize is highly susceptible to stem borer larvae attacks in damp field depressions.', mitigation: 'Apply intercropping techniques with push-pull legumes to naturally deter borer moths.' }
  ],
  regions: [
    { id: 1, name: 'North Field - Nakuru (Njoro)', owner: 'GreenAcres Co-op', crop: 'Wheat', area_acres: 45.2, soil_quality: 'Excellent (pH 6.5)', status: 'Prospering', lat_center: -0.303, lng_center: 36.08, coordinates_json: '[[-0.300, 36.075], [-0.300, 36.085], [-0.306, 36.085], [-0.306, 36.075]]' },
    { id: 2, name: 'East Field - Trans Nzoia (Kwanza)', owner: 'Kamau Agro Holdings', crop: 'Maize', area_acres: 32.5, soil_quality: 'Moderate (pH 5.9)', status: 'Normal', lat_center: -0.312, lng_center: 36.095, coordinates_json: '[[-0.308, 36.090], [-0.308, 36.100], [-0.316, 36.100], [-0.316, 36.090]]' },
    { id: 3, name: 'South Zone - Uasin Gishu (Moiben)', owner: 'Wanjiku Farm Trust', crop: 'Soybeans', area_acres: 22.1, soil_quality: 'Deficient in Nitrogen', status: 'Needs Attention', lat_center: -0.320, lng_center: 36.076, coordinates_json: '[[-0.317, 36.070], [-0.317, 36.082], [-0.323, 36.082], [-0.323, 36.070]]' }
  ],
  chat: [],
  messages: []
};

// Helper: Try fetching from Supabase tables directly
async function fetchFromSupabase(endpoint, urlParams) {
  try {
    if (endpoint.includes('/api/weather/')) {
      let { data, error } = await supabase.from('farm_data_weatherrecord').select('*').order('id');
      if (error || !data || data.length === 0) {
        let res2 = await supabase.from('weather_records').select('*').order('id');
        data = res2.data;
      }
      return data && data.length > 0 ? data : MOCK_DATA.weather;
    }

    if (endpoint.includes('/api/soil/')) {
      const sector = urlParams.get('sector');
      let query = supabase.from('farm_data_soilhealth').select('*');
      if (sector) query = query.eq('sector', sector);
      let { data, error } = await query.single();
      if (error || !data) {
        let res2 = await supabase.from('soil_health').select('*');
        if (sector) res2 = res2.eq('sector', sector);
        data = (res2.data && res2.data[0]) || null;
      }
      return data || MOCK_DATA.soil;
    }

    if (endpoint.includes('/api/commodities/')) {
      let { data, error } = await supabase.from('farm_data_commodityprice').select('*').order('id');
      if (error || !data || data.length === 0) {
        let res2 = await supabase.from('commodity_prices').select('*').order('id');
        data = res2.data;
      }
      return data && data.length > 0 ? data : MOCK_DATA.commodities;
    }

    if (endpoint.includes('/api/pest-alerts/')) {
      let { data, error } = await supabase.from('farm_data_pestalert').select('*').order('id');
      if (error || !data || data.length === 0) {
        let res2 = await supabase.from('pest_alerts').select('*').order('id');
        data = res2.data;
      }
      return data && data.length > 0 ? data : MOCK_DATA.pestAlerts;
    }

    if (endpoint.includes('/api/regions/')) {
      let { data, error } = await supabase.from('farm_data_farmregion').select('*').order('id');
      if (error || !data || data.length === 0) {
        let res2 = await supabase.from('farm_regions').select('*').order('id');
        data = res2.data;
      }
      return data && data.length > 0 ? data : MOCK_DATA.regions;
    }

    if (endpoint.includes('/api/chat/')) {
      let { data } = await supabase.from('farm_data_chatmessage').select('*').order('timestamp');
      return data || MOCK_DATA.chat;
    }

    if (endpoint.includes('/api/messages/')) {
      let { data } = await supabase.from('farm_data_consultmessage').select('*').order('created_at', { ascending: false });
      return data || MOCK_DATA.messages;
    }
  } catch (err) {
    console.warn('Supabase fetch fallback warning:', err);
  }
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('agrismart_access') || sessionStorage.getItem('agrismart_access');
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';

    // If HTTP call fails (e.g. backend server not deployed or network error), try Supabase / Mock fallback!
    if (error.response?.status === 404 || !error.response || error.code === 'ERR_NETWORK') {
      const urlObj = new URL(url, 'http://localhost');
      const fallbackData = await fetchFromSupabase(urlObj.pathname, urlObj.searchParams);
      if (fallbackData !== null) {
        return {
          data: fallbackData,
          status: 200,
          statusText: 'OK (Supabase/Fallback)',
          headers: {},
          config: originalRequest
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;
