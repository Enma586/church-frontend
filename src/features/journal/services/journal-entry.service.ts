import api from '@/lib/axios';
import type {
  ApiResponse,
  JournalEntry,
  CreateJournalEntryPayload,
  UpdateJournalEntryPayload,
  JournalEntryQueryParams,
  PaginatedResponse,
} from '@/types';

const BASE = '/accounting/journal-entries';

export const journalEntryService = {
  getAll: async (params: JournalEntryQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<JournalEntry[]> & PaginatedResponse<JournalEntry>
    >(BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<JournalEntry>>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateJournalEntryPayload) => {
    const { data } = await api.post<ApiResponse<JournalEntry>>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateJournalEntryPayload) => {
    const { data } = await api.put<ApiResponse<JournalEntry>>(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`${BASE}/${id}`);
    return data;
  },
};