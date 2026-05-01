import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { showToast } from '@/lib/toast';
import type { CreateAppointmentPayload } from '../types/appointment.types';

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) =>
      appointmentService.create(data),
    onSuccess: () => {
      showToast.success('Cita creada exitosamente');
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}