import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://smart-city-governance-system-with-real.onrender.com/api');

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Attach Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartcity_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };