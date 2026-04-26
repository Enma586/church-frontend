export const USER_ROLES = ['Coordinador', 'Subcoordinador'] as const;

export type UserRole = (typeof USER_ROLES)[number];