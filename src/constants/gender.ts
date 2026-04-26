export const GENDERS = ['Masculino', 'Femenino'] as const;

export type Gender = (typeof GENDERS)[number];