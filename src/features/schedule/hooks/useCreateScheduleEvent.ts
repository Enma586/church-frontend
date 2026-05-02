import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';
import type { CreateScheduleEventPayload } from '../types/schedule.types';

export function useCreateScheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleEventPayload) =>
      scheduleService.create(data),
    onSuccess: () => {
      showToast.success('Event created successfully');
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (e: Error) => showToast.error(e.message),
  });
}