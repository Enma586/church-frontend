import api from '@/lib/axios';
import type {
  ApiResponse,
  PastoralNote,
  CreatePastoralNotePayload,
  UpdatePastoralNotePayload,
  PastoralNoteQueryParams,
  PaginatedResponse,
} from '@/types';

export const pastoralNoteService = {
  getAll: async (params: PastoralNoteQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<PastoralNote[]> & PaginatedResponse<PastoralNote>>(
      '/pastoral-notes',
      { params },
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<PastoralNote>>(`/pastoral-notes/${id}`);
    return data;
  },

  create: async (payload: CreatePastoralNotePayload) => {
    const { data } = await api.post<ApiResponse<PastoralNote>>('/pastoral-notes', payload);
    return data;
  },

  update: async (id: string, payload: UpdatePastoralNotePayload) => {
    const { data } = await api.put<ApiResponse<PastoralNote>>(`/pastoral-notes/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/pastoral-notes/${id}`);
    return data;
  },
};