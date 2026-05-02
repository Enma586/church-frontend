import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';

export function useDeleteScheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleService.remove(id),
    onSuccess: () => {
      showToast.success('Event deleted');
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}