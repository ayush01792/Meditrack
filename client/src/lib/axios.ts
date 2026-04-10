import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Request interceptor: attach access token ─────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 + token refresh ────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 and only if we have a refresh token
    const refreshToken = useAuthStore.getState().refreshToken;
    if (error.response?.status !== 401 || !refreshToken || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Queue requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newAccessToken: string = data.data.accessToken;
      const newRefreshToken: string = data.data.refreshToken;

      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

      refreshQueue.forEach((cb) => cb(newAccessToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(original);
    } catch (refreshError) {
      // Only logout if refresh token is truly rejected (401/403), not network errors
      const refreshAxiosError = refreshError as AxiosError;
      if (
        refreshAxiosError.response?.status === 401 ||
        refreshAxiosError.response?.status === 403
      ) {
        refreshQueue.forEach((cb) => cb(''));
        refreshQueue = [];
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
