import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  ScheduleEvent,
  CreateScheduleEventPayload,
  UpdateScheduleEventPayload,
  ScheduleEventQueryParams,
} from '../types/schedule.types';

export const scheduleService = {
  getAll: async (params: ScheduleEventQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<ScheduleEvent[]> & PaginatedResponse<ScheduleEvent>
    >('/appointments', {
      params: { ...params, type: 'evento_cronograma' },
    });
    return data;
  },

  create: async (payload: CreateScheduleEventPayload) => {
    const { data } = await api.post<ApiResponse<ScheduleEvent>>(
      '/appointments',
      payload,
    );
    return data;
  },

  update: async (id: string, payload: UpdateScheduleEventPayload) => {
    const { data } = await api.put<ApiResponse<ScheduleEvent>>(
      `/appointments/${id}`,
      payload,
    );
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(
      `/appointments/${id}`,
    );
    return data;
  },
};