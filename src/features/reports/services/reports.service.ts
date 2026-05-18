import api from '@/lib/axios';
import type {
  ApiResponse,
  LedgerQueryParams,
  LedgerResponse,
  TrialBalanceQueryParams,
  TrialBalanceResponse,
  BalanceSheetQueryParams,
  BalanceSheetResponse,
  IncomeStatementQueryParams,
  IncomeStatementResponse,
} from '@/types';

const BASE = '/accounting/reports';

export const reportsService = {
  getLedger: async (params: LedgerQueryParams) => {
    const { data } = await api.get<ApiResponse<LedgerResponse>>(
      `${BASE}/ledger`,
      { params },
    );
    return data;
  },

  getTrialBalance: async (params: TrialBalanceQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<TrialBalanceResponse>>(
      `${BASE}/trial-balance`,
      { params },
    );
    return data;
  },

  getBalanceSheet: async (params: BalanceSheetQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<BalanceSheetResponse>>(
      `${BASE}/balance-sheet`,
      { params },
    );
    return data;
  },

  getIncomeStatement: async (params: IncomeStatementQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<IncomeStatementResponse>>(
      `${BASE}/income-statement`,
      { params },
    );
    return data;
  },
};