import { api } from '@/lib/axios';
import type { ApiResponse, AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export async function loginRequest(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  return data.data;
}

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  return data.data;
}

export async function refreshTokenRequest(refreshToken: string) {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
    refreshToken,
  });
  return data.data;
}
