import axios from 'axios';

const BASE = 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username, password) => axios.post(`${BASE}/auth/login/`, { username, password }),
  register: (data) => axios.post(`${BASE}/auth/register/`, data),
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
