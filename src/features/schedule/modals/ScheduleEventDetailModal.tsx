import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduleEventDetails } from '../components/ScheduleEventDetails';
import type { ScheduleEvent } from '../types/schedule.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
}

export function ScheduleEventDetailModal({ open, onOpenChange, event }: Props) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Detalle del Evento</DialogTitle>
          <DialogDescription className="sr-only">
            Información completa del evento seleccionado del cronograma.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="pt-2">
            <ScheduleEventDetails event={event} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}