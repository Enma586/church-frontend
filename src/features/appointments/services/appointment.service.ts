import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  Appointment,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  AppointmentQueryParams,
} from '../types/appointment.types';

export const appointmentService = {
  getAll: async (params: AppointmentQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<Appointment[]> & PaginatedResponse<Appointment>
    >('/appointments', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Appointment>>(
      `/appointments/${id}`,
    );
    return data;
  },

  create: async (payload: CreateAppointmentPayload) => {
    const { data } = await api.post<ApiResponse<Appointment>>(
      '/appointments',
      payload,
    );
    return data;
  },

  update: async (id: string, payload: UpdateAppointmentPayload) => {
    const { data } = await api.put<ApiResponse<Appointment>>(
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