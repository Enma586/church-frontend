import api from '@/lib/axios';
import type {
  ApiResponse,
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
  AccountQueryParams,
  PaginatedResponse,
} from '@/types';

const BASE = '/accounting/accounts';

export const accountService = {
  getAll: async (params: AccountQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<Account[]> & PaginatedResponse<Account>
    >(BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Account>>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateAccountPayload) => {
    const { data } = await api.post<ApiResponse<Account>>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateAccountPayload) => {
    const { data } = await api.put<ApiResponse<Account>>(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`${BASE}/${id}`);
    return data;
  },
};