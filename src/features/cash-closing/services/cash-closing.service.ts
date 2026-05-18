import api from '@/lib/axios';
import type {
  ApiResponse,
  CashClosing,
  CreateCashClosingPayload,
  CashClosingQueryParams,
  PaginatedResponse,
} from '@/types';

const BASE = '/accounting/cash-closings';

export const cashClosingService = {
  getAll: async (params: CashClosingQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<CashClosing[]> & PaginatedResponse<CashClosing>
    >(BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<CashClosing>>(`${BASE}/${id}`);
    return data;
  },

  getDenominations: async () => {
    const { data } = await api.get<ApiResponse<number[]>>(`${BASE}/denominations`);
    return data;
  },

  create: async (payload: CreateCashClosingPayload) => {
    const { data } = await api.post<ApiResponse<CashClosing>>(BASE, payload);
    return data;
  },
};