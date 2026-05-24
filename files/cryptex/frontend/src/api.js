import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://tradingclone-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-add CSRF token
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

// Auth APIs
export const authAPI = {
  login: (username, password) => 
    api.post('/api/auth/login/', { username, password }),
  
  register: (data) => 
    api.post('/api/auth/register/', data),
};

// Market & Trading APIs (added for Trade.jsx)
export const marketAPI = {
  getMarketData: () => api.get('/api/market/'),
  getPrice: (symbol) => api.get(`/api/market/price/${symbol}/`),
};

export const tradingAPI = {
  getPositions: () => api.get('/api/trading/positions/'),
  placeOrder: (orderData) => api.post('/api/trading/orders/', orderData),
  getOrders: () => api.get('/api/trading/orders/'),
};

export default api;