export const MEMBER_STATUSES = ['Activo', 'Inactivo'] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];