import api from '@/lib/axios';
import type { ApiResponse, ClosePeriodPayload, PeriodResult } from '@/types';

const BASE = '/accounting/period';

export const periodService = {
  close: async (payload: ClosePeriodPayload) => {
    const { data } = await api.put<ApiResponse<PeriodResult>>(
      `${BASE}/close`,
      payload,
    );
    return data;
  },

  reopen: async () => {
    const { data } = await api.put<ApiResponse<PeriodResult>>(
      `${BASE}/reopen`,
    );
    return data;
  },
};