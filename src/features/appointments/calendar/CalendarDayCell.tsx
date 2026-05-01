import { cn } from '@/lib/utils';
import { AppointmentMiniCard } from '../components/AppointmentMiniCard';
import type { Appointment } from '../types/appointment.types';

interface Props {
  day: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
}

export function CalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  appointments,
}: Props) {
  if (day === null) return <div className="h-24 border bg-muted/20" />;

  return (
    <div
      className={cn(
        'h-24 border p-1 overflow-hidden',
        !isCurrentMonth && 'bg-muted/30',
        isToday && 'ring-2 ring-primary',
      )}
    >
      <span
        className={cn('text-xs font-medium', isToday && 'text-primary font-bold')}
      >
        {day}
      </span>
      <div className="space-y-0.5 mt-0.5">
        {appointments.slice(0, 3).map((a) => (
          <AppointmentMiniCard key={a._id} appointment={a} />
        ))}
        {appointments.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{appointments.length - 3} más
          </span>
        )}
      </div>
    </div>
  );
}