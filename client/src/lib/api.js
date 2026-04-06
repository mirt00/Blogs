import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
          useAuthStore.getState().setAccessToken(data.accessToken);
          isRefreshing = false;
        } catch {
          useAuthStore.getState().logout();
          isRefreshing = false;
          return Promise.reject(err);
        }
      }
      return api(original);
    }
    return Promise.reject(err);
  }
);

export default api;
