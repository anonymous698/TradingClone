import axios from 'axios';

const BASE = 'https://tradingclone-production.up.railway.app/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/auth/register/', data),
};

export const marketAPI = {
  getMarkets: () => api.get('/market/'),
  getCoin: (symbol) => api.get(`/market/${symbol}/`),
};

export const tradingAPI = {
  getPortfolio: () => api.get('/portfolio/'),
  placeOrder: (data) => api.post('/orders/', data),
  getOrders: () => api.get('/orders/history/'),
  getTransactions: () => api.get('/transactions/'),
  getAccount: () => api.get('/account/'),
  deposit: (amount) => api.post('/deposit/', { amount }),
  getWatchlist: () => api.get('/watchlist/'),
  addWatchlist: (symbol) => api.post('/watchlist/', { symbol }),
  removeWatchlist: (symbol) => api.delete(`/watchlist/${symbol}/`),
};

export default api;