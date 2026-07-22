import axios from 'axios';

const api = axios.create({
  baseURL: '',
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
    
    // Ignore 401 on auth paths to prevent redirection/refresh loops on authentication attempts
    const isAuthRequest = originalRequest.url?.includes('/api/auth/');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('agrismart_refresh') || sessionStorage.getItem('agrismart_refresh');
      if (refresh) {
        try {
          const response = await axios.post('/api/auth/login/refresh/', { refresh });
          const newAccess = response.data.access;
          if (localStorage.getItem('agrismart_save_info') === 'true') {
            localStorage.setItem('agrismart_access', newAccess);
          } else {
            sessionStorage.setItem('agrismart_access', newAccess);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('agrismart_access');
          localStorage.removeItem('agrismart_refresh');
          localStorage.removeItem('agrismart_user');
          sessionStorage.removeItem('agrismart_access');
          sessionStorage.removeItem('agrismart_refresh');
          sessionStorage.removeItem('agrismart_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('agrismart_access');
        localStorage.removeItem('agrismart_refresh');
        localStorage.removeItem('agrismart_user');
        sessionStorage.removeItem('agrismart_access');
        sessionStorage.removeItem('agrismart_refresh');
        sessionStorage.removeItem('agrismart_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
