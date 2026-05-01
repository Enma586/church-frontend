import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import type { AppointmentQueryParams } from '../types/appointment.types';

export function useAppointments(params: AppointmentQueryParams = {}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentService.getAll(params),
    retry: false,
  });
}