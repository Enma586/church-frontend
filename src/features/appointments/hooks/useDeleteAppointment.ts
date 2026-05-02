import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { showToast } from '@/lib/toast';

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.remove(id),
    onSuccess: () => {
      showToast.success('Cita eliminada');
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}