import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
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