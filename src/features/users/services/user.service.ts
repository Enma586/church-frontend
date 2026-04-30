import api from '@/lib/axios';
import type {
  ApiResponse,
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserQueryParams,
  PaginatedResponse,
} from '@/types';

export const userService = {
  getAll: async (params: UserQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<User[]> & PaginatedResponse<User>>(
      '/users',
      { params },
    );
    return data;
  },

  create: async (payload: CreateUserPayload) => {
    const { data } = await api.post<ApiResponse<User>>('/users', payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },
};