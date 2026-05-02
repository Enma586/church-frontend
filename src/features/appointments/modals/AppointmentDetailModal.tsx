import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentDetails } from '../components/AppointmentDetails';
import type { Appointment } from '../types/appointment.types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  appointment: Appointment | null;
}

export function AppointmentDetailModal({
  open,
  onOpenChange,
  appointment,
}: Props) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-w-2xl da un ancho perfecto para detalles, max-h-[85vh] evita que desborde */}
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Detalle del Evento</DialogTitle>
          {/* Usamos sr-only para ocultar la descripción pero mantenerla accesible */}
          <DialogDescription className="sr-only">
            Información detallada de la cita o evento programado.
          </DialogDescription>
        </DialogHeader>

        {/* ScrollArea permite que el contenido sea scrollable sin mover el título */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="pt-2">
            <AppointmentDetails appointment={appointment} />
          </div>
        </ScrollArea>
        
      </DialogContent>
    </Dialog>
  );
}