import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import type { ScheduleEventQueryParams } from '../types/schedule.types';

export function useScheduleEvents(params: ScheduleEventQueryParams = {}) {
  return useQuery({
    queryKey: ['schedule', params],
    queryFn: () => scheduleService.getAll(params),
    retry: false,
  });
}