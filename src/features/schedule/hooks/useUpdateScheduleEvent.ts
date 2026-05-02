import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';
import type { UpdateScheduleEventPayload } from '../types/schedule.types';

export function useUpdateScheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleEventPayload;
    }) => scheduleService.update(id, data),
    onSuccess: () => {
      showToast.success('Evento actualizado');
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}