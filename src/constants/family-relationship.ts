export const FAMILY_RELATIONSHIPS = [
  'Padre',
  'Madre',
  'Cónyuge',
  'Hijo/a',
  'Hermano/a',
  'Tutor',
  'Otro',
] as const;

export type FamilyRelationship = (typeof FAMILY_RELATIONSHIPS)[number];