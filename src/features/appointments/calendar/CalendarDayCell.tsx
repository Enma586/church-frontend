import { cn } from '@/lib/utils';
import { AppointmentMiniCard } from '../components/AppointmentMiniCard';
import type { Appointment } from '../types/appointment.types';

interface Props {
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
  onClick: () => void;
}

export function CalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  appointments,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'h-24 border p-1 overflow-hidden cursor-pointer transition-colors hover:bg-accent/50',
        !isCurrentMonth && 'bg-muted/30',
        isToday && 'ring-2 ring-primary ring-inset',
      )}
    >
      <span
        className={cn(
          'text-xs font-medium',
          isToday && 'text-primary font-bold',
          !isCurrentMonth && 'text-muted-foreground',
        )}
      >
        {day}
      </span>
      <div className="space-y-0.5 mt-0.5">
        {appointments.slice(0, 3).map((a) => (
          <AppointmentMiniCard key={a._id} appointment={a} />
        ))}
        {appointments.length > 3 && (
          <span className="text-[10px] text-muted-foreground block truncate">
            +{appointments.length - 3} más
          </span>
        )}
      </div>
    </div>
  );
}