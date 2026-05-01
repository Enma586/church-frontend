import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../types/appointment.types';

interface Props {
  appointment: Appointment;
  onClick?: () => void;
}

export function AppointmentCard({ appointment, onClick }: Props) {
  // Búsqueda inteligente: Intenta leer 'member', si no existe, intenta leer 'memberId' (si es un objeto poblado)
  const memberData = appointment.member || 
    (typeof appointment.memberId === 'object' ? appointment.memberId : null);
    
  const memberName = memberData?.fullName ?? '—';

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
          <CalendarDays className="h-5 w-5 text-violet-600 dark:text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{appointment.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {memberName}
          </p>
          <p className="text-xs text-muted-foreground">
            {appointment.startDateTime
              ? format(new Date(appointment.startDateTime), 'dd/MM HH:mm', {
                  locale: es,
                })
              : '—'}
          </p>
        </div>
        <Badge
          variant={
            appointment.status === 'Programada'
              ? 'default'
              : appointment.status === 'Completada'
                ? 'secondary'
                : 'destructive'
          }
        >
          {appointment.status}
        </Badge>
      </CardContent>
    </Card>
  );
}