import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
    retry: false,
  });
}