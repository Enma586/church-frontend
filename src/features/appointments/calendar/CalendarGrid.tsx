import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDayCell } from './CalendarDayCell';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment } from '../types/appointment.types';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// 1. Definimos la interfaz con la prop necesaria
interface CalendarGridProps {
  onDayClick: (date: Date, appointments: Appointment[]) => void;
}

export function CalendarGrid({ onDayClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ... (tu lógica de fechas sigue igual)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { data } = useAppointments({limit: 200 });
  const allAppointments = data?.data ?? [];

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const a of allAppointments) {
      // Cita pastoral: usa startDateTime
      const key1 = a.startDateTime
        ? format(new Date(a.startDateTime), 'yyyy-MM-dd')
        : null;
      // Evento cronograma: usa allDayDate
      const key2 = a.allDayDate
        ? format(new Date(a.allDayDate), 'yyyy-MM-dd')
        : null;

      const key = key1 || key2;
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    }
    return map;
  }, [allAppointments]);

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  return (
    <div>
      {/* ... header igual ... */}
      <CalendarHeader
        date={currentDate}
        onPrev={() => setCurrentDate((d) => subMonths(d, 1))}
        onNext={() => setCurrentDate((d) => addMonths(d, 1))}
        onToday={() => setCurrentDate(new Date())}
      />

      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold py-1 text-muted-foreground">{d}</div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const appointments = appointmentsByDay[key] ?? [];
            
            return (
              <CalendarDayCell
                key={key}
                day={day.getDate()}
                isToday={isToday(day)}
                isCurrentMonth={isSameMonth(day, currentDate)}
                appointments={appointments}
                // 2. Pasamos la función al componente celda
                onClick={() => onDayClick(day, appointments)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}