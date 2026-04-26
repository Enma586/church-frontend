export const SACRAMENT_TYPES = [
  'Bautismo',
  'Primera Comunión',
  'Confirmación',
  'Matrimonio',
] as const;

export type SacramentType = (typeof SACRAMENT_TYPES)[number];