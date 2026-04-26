export const APPOINTMENT_STATUSES = ['Programada', 'Completada', 'Cancelada'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];