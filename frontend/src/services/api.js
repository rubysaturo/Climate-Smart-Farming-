import axios from "axios";
import env from "@/lib/env";

// ── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = env.API_URL;
if (!BASE_URL && import.meta.env.PROD) {
  throw new Error("[api] VITE_API_URL is empty in production. Set it in the Vercel dashboard.");
}
const EFFECTIVE_BASE = BASE_URL || "/api";
const TIMEOUT_MS = 15_000;
const REFRESH_ENDPOINT = `${EFFECTIVE_BASE}/auth/login/refresh/`;

const STORAGE_KEYS = Object.freeze({
  ACCESS: "csf_access",
  REFRESH: "csf_refresh",
  USER: "csf_user",
});

// ── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: EFFECTIVE_BASE,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// ── Token helpers ────────────────────────────────────────────────────────────

const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS);
const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH);
const setTokens = (access, refresh) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS, access);
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH, refresh);
};
const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS);
  localStorage.removeItem(STORAGE_KEYS.REFRESH);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// ── Request interceptor — attach Bearer token ────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token refresh queue ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ── Response interceptor — error handling + auto-refresh ─────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject(createApiError("REQUEST_TIMEOUT", "Request timed out. Please try again."));
    }

    // Network error (server unreachable)
    if (!error.response) {
      return Promise.reject(createApiError("NETWORK_ERROR", "Network error. Check your connection."));
    }

    const { status } = error.response;

    // 401 — Unauthorized: attempt token refresh
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(wrapError("UNAUTHENTICATED", "Session expired.", error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(REFRESH_ENDPOINT, { refresh: refreshToken });
        setTokens(data.access, data.refresh);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(wrapError("REFRESH_FAILED", "Session expired. Please log in again.", refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // 403 — Forbidden
    if (status === 403) {
      return Promise.reject(
        wrapError("FORBIDDEN", "You do not have permission to perform this action.", error),
      );
    }

    // 404 — Not Found
    if (status === 404) {
      return Promise.reject(wrapError("NOT_FOUND", "The requested resource was not found.", error));
    }

    // 400 — Bad Request (validation errors)
    if (status === 400) {
      const detail = extractValidationErrors(error.response.data);
      return Promise.reject(wrapError("VALIDATION_ERROR", detail, error));
    }

    // 500+ — Server errors
    if (status >= 500) {
      return Promise.reject(
        wrapError("SERVER_ERROR", "Something went wrong on our end. Please try again later.", error),
      );
    }

    // Default: re-wrap with readable code
    return Promise.reject(wrapError("REQUEST_FAILED", error.response?.data?.detail || error.message, error));
  },
);

// ── Error helpers ────────────────────────────────────────────────────────────

function createApiError(code, message) {
  const err = new Error(message);
  err.code = code;
  err.response = null;
  return err;
}

function wrapError(code, message, original) {
  const err = new Error(message);
  err.code = code;
  err.response = original?.response;
  err.original = original;
  return err;
}

function extractValidationErrors(data) {
  if (!data) return "Invalid request.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors)
    return Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
  const first = Object.entries(data)[0];
  if (first) {
    const val = Array.isArray(first[1]) ? first[1][0] : first[1];
    return `${first[0]}: ${val}`;
  }
  return "Validation failed.";
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const auth = {
  /** POST /api/auth/login/ → { access, refresh, user } */
  login: (identifier, password) => api.post("/auth/login/", { username: identifier, password }),

  /** POST /api/auth/login/refresh/ → { access, refresh? } */
  refreshToken: (refresh) => api.post("/auth/login/refresh/", { refresh }),

  /** POST /api/auth/register/ → { message, user } */
  register: (payload) =>
    api.post("/auth/register/", {
      username: payload.username,
      password: payload.password,
      email: payload.email,
      name: payload.name || "",
      phone_number: payload.phone_number || "",
      sector: payload.sector || "",
      supabase_uid: payload.supabase_uid || null,
    }),

  /** POST /api/auth/sync-supabase-uid/ → { message } */
  syncSupabaseUid: (supabaseUid) => api.post("/auth/sync-supabase-uid/", { supabase_uid: supabaseUid }),

  /** POST /api/auth/logout/ → 204 */
  logout: (refresh) => api.post("/auth/logout/", { refresh }),

  /** GET /api/auth/me/ → User object */
  getProfile: () => api.get("/auth/me/"),

  /** PUT|PATCH /api/auth/me/ → User object */
  updateProfile: (data) => api.patch("/auth/me/", data),
};

// ─────────────────────────────────────────────────────────────────────────────
//  WEATHER
// ─────────────────────────────────────────────────────────────────────────────

export const weather = {
  /** GET /api/weather/ → WeatherRecord[] */
  list: () => api.get("/weather/"),

  /** GET /api/weather/{id}/ → WeatherRecord */
  get: (id) => api.get(`/weather/${id}/`),

  /** POST /api/weather/ → WeatherRecord (admin only) */
  create: (data) =>
    api.post("/weather/", {
      day_name: data.day_name,
      temp_high: data.temp_high,
      temp_low: data.temp_low,
      condition: data.condition,
      precip_chance: data.precip_chance,
      wind_speed: data.wind_speed,
      humidity: data.humidity,
      pressure: data.pressure,
      visibility: data.visibility,
      date: data.date,
      is_today: data.is_today ?? false,
    }),

  /** PUT /api/weather/{id}/ → WeatherRecord (admin only) */
  update: (id, data) => api.put(`/weather/${id}/`, data),

  /** PATCH /api/weather/{id}/ → WeatherRecord (admin only) */
  patch: (id, data) => api.patch(`/weather/${id}/`, data),

  /** DELETE /api/weather/{id}/ → 204 (admin only) */
  remove: (id) => api.delete(`/weather/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  SOIL HEALTH
// ─────────────────────────────────────────────────────────────────────────────

export const soil = {
  /** GET /api/soil/ → SoilHealth[] */
  list: () => api.get("/soil/"),

  /** GET /api/soil/{id}/ → SoilHealth */
  get: (id) => api.get(`/soil/${id}/`),

  /** GET /api/soil/by_sector/?sector=X → SoilHealth (single object) */
  getBySector: (sector) => {
    const params = sector ? { sector } : {};
    return api.get("/soil/by_sector/", { params });
  },

  /** POST /api/soil/ → SoilHealth (admin only) */
  create: (data) =>
    api.post("/soil/", {
      sector: data.sector,
      moisture: data.moisture,
      ph: data.ph,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      status: data.status ?? "Optimal",
      tips: data.tips,
    }),

  /** PUT /api/soil/{id}/ → SoilHealth (admin only) */
  update: (id, data) => api.put(`/soil/${id}/`, data),

  /** PATCH /api/soil/{id}/ → SoilHealth (admin only) */
  patch: (id, data) => api.patch(`/soil/${id}/`, data),

  /** DELETE /api/soil/{id}/ → 204 (admin only) */
  remove: (id) => api.delete(`/soil/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMMODITIES
// ─────────────────────────────────────────────────────────────────────────────

export const commodities = {
  /** GET /api/commodities/ → CommodityPrice[] */
  list: () => api.get("/commodities/"),

  /** GET /api/commodities/{id}/ → CommodityPrice */
  get: (id) => api.get(`/commodities/${id}/`),

  /** POST /api/commodities/ → CommodityPrice (admin only) */
  create: (data) =>
    api.post("/commodities/", {
      crop: data.crop,
      price_kes: data.price_kes,
      change_pct: data.change_pct,
      is_up: data.is_up ?? true,
      demand_level: data.demand_level ?? "High",
      volume_tonnes: data.volume_tonnes ?? 100,
    }),

  /** PUT /api/commodities/{id}/ → CommodityPrice (admin only) */
  update: (id, data) => api.put(`/commodities/${id}/`, data),

  /** PATCH /api/commodities/{id}/ → CommodityPrice (admin only) */
  patch: (id, data) => api.patch(`/commodities/${id}/`, data),

  /** DELETE /api/commodities/{id}/ → 204 (admin only) */
  remove: (id) => api.delete(`/commodities/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  PEST ALERTS
// ─────────────────────────────────────────────────────────────────────────────

export const pestAlerts = {
  /** GET /api/pest-alerts/ → PestAlert[] (ordered by -issued_at) */
  list: () => api.get("/pest-alerts/"),

  /** GET /api/pest-alerts/{id}/ → PestAlert */
  get: (id) => api.get(`/pest-alerts/${id}/`),

  /** POST /api/pest-alerts/ → PestAlert (admin only) */
  create: (data) =>
    api.post("/pest-alerts/", {
      title: data.title,
      risk_level: data.risk_level,
      sector: data.sector ?? "All Sectors",
      description: data.description,
      mitigation: data.mitigation,
    }),

  /** PUT /api/pest-alerts/{id}/ → PestAlert (admin only) */
  update: (id, data) => api.put(`/pest-alerts/${id}/`, data),

  /** PATCH /api/pest-alerts/{id}/ → PestAlert (admin only) */
  patch: (id, data) => api.patch(`/pest-alerts/${id}/`, data),

  /** DELETE /api/pest-alerts/{id}/ → 204 (admin only) */
  remove: (id) => api.delete(`/pest-alerts/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONSULT MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

export const messages = {
  /** GET /api/messages/ → ConsultMessage[] (admin=all, farmer=own) */
  list: () => api.get("/messages/"),

  /** GET /api/messages/{id}/ → ConsultMessage */
  get: (id) => api.get(`/messages/${id}/`),

  /** POST /api/messages/ → ConsultMessage (sender auto-set) */
  create: (data) =>
    api.post("/messages/", {
      crop: data.crop,
      subject: data.subject,
      message: data.message,
    }),

  /** PUT /api/messages/{id}/ → ConsultMessage */
  update: (id, data) => api.put(`/messages/${id}/`, data),

  /** PATCH /api/messages/{id}/ → ConsultMessage */
  patch: (id, data) => api.patch(`/messages/${id}/`, data),

  /** DELETE /api/messages/{id}/ → 204 */
  remove: (id) => api.delete(`/messages/${id}/`),

  /** POST /api/messages/{id}/reply/ → ConsultMessage (admin only) */
  reply: (id, replyText) => api.post(`/messages/${id}/reply/`, { reply: replyText }),

  /** POST /api/messages/{id}/mark_read/ → { status } */
  markRead: (id) => api.post(`/messages/${id}/mark_read/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  FARM REGIONS
// ─────────────────────────────────────────────────────────────────────────────

export const regions = {
  /** GET /api/regions/ → FarmRegion[] */
  list: () => api.get("/regions/"),

  /** GET /api/regions/{id}/ → FarmRegion */
  get: (id) => api.get(`/regions/${id}/`),

  /** POST /api/regions/ → FarmRegion (admin only) */
  create: (data) =>
    api.post("/regions/", {
      name: data.name,
      owner: data.owner,
      crop: data.crop,
      area_acres: data.area_acres,
      soil_quality: data.soil_quality,
      status: data.status ?? "Normal",
      lat_center: data.lat_center,
      lng_center: data.lng_center,
      coordinates_json: data.coordinates_json,
    }),

  /** PUT /api/regions/{id}/ → FarmRegion (admin only) */
  update: (id, data) => api.put(`/regions/${id}/`, data),

  /** PATCH /api/regions/{id}/ → FarmRegion (admin only) */
  patch: (id, data) => api.patch(`/regions/${id}/`, data),

  /** DELETE /api/regions/{id}/ → 204 (admin only) */
  remove: (id) => api.delete(`/regions/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  CHAT
// ─────────────────────────────────────────────────────────────────────────────

export const chat = {
  /** GET /api/chat/ → ChatMessage[] (admin=all, farmer=own) */
  list: () => api.get("/chat/"),

  /** GET /api/chat/{id}/ → ChatMessage */
  get: (id) => api.get(`/chat/${id}/`),

  /** POST /api/chat/ → ChatMessage (farmer auto-set, optionally triggers AI reply) */
  send: (messageText, mode = "AI") =>
    api.post("/chat/", { message_text: messageText, mode }),

  /** PUT /api/chat/{id}/ → ChatMessage */
  update: (id, data) => api.put(`/chat/${id}/`, data),

  /** PATCH /api/chat/{id}/ → ChatMessage */
  patch: (id, data) => api.patch(`/chat/${id}/`, data),

  /** DELETE /api/chat/{id}/ → 204 */
  remove: (id) => api.delete(`/chat/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export const search = {
  /** GET /api/search/?q=X → { results: SearchResult[] } */
  query: (q) => api.get("/search/", { params: { q } }),
};

// ─────────────────────────────────────────────────────────────────────────────
//  Default export (raw axios instance) for backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

export default api;
