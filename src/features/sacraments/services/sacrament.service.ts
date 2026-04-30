import api from '@/lib/axios';
import type {
  ApiResponse,
  Sacrament,
  CreateSacramentPayload,
  UpdateSacramentPayload,
  SacramentQueryParams,
  PaginatedResponse,
} from '@/types';

export const sacramentService = {
  getAll: async (params: SacramentQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<Sacrament[]> & PaginatedResponse<Sacrament>>(
      '/sacraments',
      { params },
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Sacrament>>(`/sacraments/${id}`);
    return data;
  },

  create: async (payload: CreateSacramentPayload) => {
    const { data } = await api.post<ApiResponse<Sacrament>>('/sacraments', payload);
    return data;
  },

  update: async (id: string, payload: UpdateSacramentPayload) => {
    const { data } = await api.put<ApiResponse<Sacrament>>(`/sacraments/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/sacraments/${id}`);
    return data;
  },
};