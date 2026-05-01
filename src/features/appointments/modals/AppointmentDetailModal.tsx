import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Evento</DialogTitle>
          <DialogDescription>{'\u00A0'}</DialogDescription>
        </DialogHeader>
        <AppointmentDetails appointment={appointment} />
      </DialogContent>
    </Dialog>
  );
}