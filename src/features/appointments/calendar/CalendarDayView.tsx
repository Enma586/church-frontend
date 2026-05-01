import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Placeholder for a future single-day detailed view.
 * Shows the current date and a container for hourly slots.
 */
export function CalendarDayView() {
  const today = new Date();

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 capitalize">
        {format(today, 'EEEE, d MMMM yyyy', { locale: es })}
      </h2>
      <div className="space-y-1">
        {Array.from({ length: 12 }).map((_, i) => {
          const hour = 8 + i;
          return (
            <div
              key={hour}
              className="flex items-center gap-2 border-t py-2 text-sm text-muted-foreground"
            >
              <span className="w-12 text-right font-mono text-xs">
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className="flex-1 h-8 rounded hover:bg-muted/50 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
}