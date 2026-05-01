import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { showToast } from '@/lib/toast';
import type { UpdateAppointmentPayload } from '../types/appointment.types';

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAppointmentPayload;
    }) => appointmentService.update(id, data),
    onSuccess: () => {
      showToast.success('Cita actualizada');
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}