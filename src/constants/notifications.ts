/**
 * Tipos y configuraciones de notificaciones.
 * Se poblarán en la Fase 2 (Redux notificationSlice) y Fase 4 (Navbar).
 * Por ahora es un placeholder.
 */

export const NOTIFICATION_TYPES = {
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_DELETED: 'appointment:deleted',
  MEMBER_CREATED: 'member:created',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_DELETED: 'member:deleted',
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
} as const;