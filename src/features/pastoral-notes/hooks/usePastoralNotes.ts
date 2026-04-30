import { useQuery } from '@tanstack/react-query';
import { pastoralNoteService } from '../services/pastoral-note.service';
import type { PastoralNoteQueryParams } from '@/types';

export function usePastoralNotes(params: PastoralNoteQueryParams = {}) {
  return useQuery({
    queryKey: ['pastoral-notes', params],
    queryFn: () => pastoralNoteService.getAll(params),
    retry: false,
  });
}