import { useQuery } from '@tanstack/react-query';
import { journalEntryService } from '../services/journal-entry.service';
import type { JournalEntryQueryParams } from '@/types';

export function useJournalEntries(params: JournalEntryQueryParams = {}) {
  return useQuery({
    queryKey: ['journal-entries', params],
    queryFn: () => journalEntryService.getAll(params),
  });
}