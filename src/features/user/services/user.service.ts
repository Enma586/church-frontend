import api from '@/lib/axios';
import type { ApiResponse, User } from '@/types';
import type { LoginPayload, RegisterPayload } from '../types/user.types';

export const userService = {
  login: async (credentials: LoginPayload) => {
    const { data } = await api.post<ApiResponse<User>>('/users/login', credentials);
    return data;
  },

  logout: async () => {
    await api.post('/users/logout');
  },

  me: async () => {
    const { data } = await api.get<ApiResponse<User>>('/users/me');
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<User>>('/users/register', payload);
    return data;
  },
};