import type { Appointment } from '../types/appointment.types';

export function AppointmentMiniCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  return (
    <div
      className={`text-xs px-1.5 py-0.5 rounded truncate border-l-2 ${
        appointment.status === 'Completada'
          ? 'border-green-500 bg-green-50 dark:bg-green-950'
          : appointment.status === 'Cancelada'
            ? 'border-red-500 bg-red-50 dark:bg-red-950'
            : 'border-violet-500 bg-violet-50 dark:bg-violet-950'
      }`}
    >
      {appointment.title}
    </div>
  );
}