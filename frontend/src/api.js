import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use(
  (config) => {
    // Don't send token for login requests
    if (config.url?.includes('login')) {
      return config;
    }

    // Check for admin token first, then regular token
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect for login endpoints - let them handle their own errors
    const isLoginRequest = error.config?.url?.includes('login');

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Check if on admin page
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

