import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://tradingclone-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF Token automatically
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Create authAPI object that Auth.jsx expects
export const authAPI = {
  login: (username, password) => 
    api.post('/api/auth/login/', { username, password }),

  register: (data) => 
    api.post('/api/auth/register/', data),
};

export default api;