import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Placeholder for a future weekly view.
 * Renders a simple 7-day header strip.
 */
export function CalendarWeekView() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });

  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => {
        const day = addDays(weekStart, i);
        return (
          <div key={i} className="border rounded-md p-2 text-center text-sm min-h-50">
            <p className="font-semibold capitalize">
              {format(day, 'EEE', { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(day, 'd', { locale: es })}
            </p>
          </div>
        );
      })}
    </div>
  );
}