export const SACRAMENT_TYPES = [
  'Bautismo',
  'Primera Comunión',
  'Confirmación',
  'Ninguno',
] as const;

export type SacramentType = (typeof SACRAMENT_TYPES)[number];

/**
 * Hierarchy: higher levels IMPLY lower ones.
 *
 *   Confirmación       → implica Bautismo + Primera Comunión
 *   Primera Comunión   → implica Bautismo
 *   Bautismo           → solo Bautismo
 *   Ninguno            → sin sacramentos
 */

/**
 * Given the types the member already has registered,
 * returns the set of types they "effectively" possess.
 *
 * @example ['Primera Comunión'] → ['Bautismo', 'Primera Comunión']
 * @example ['Confirmación']    → ['Bautismo', 'Primera Comunión', 'Confirmación']
 * @example ['Bautismo']        → ['Bautismo']
 * @example ['Ninguno']         → []
 */
function getEffectiveTypes(existing: SacramentType[]): SacramentType[] {
  if (existing.includes('Confirmación')) {
    return ['Bautismo', 'Primera Comunión', 'Confirmación'];
  }
  if (existing.includes('Primera Comunión')) {
    return ['Bautismo', 'Primera Comunión'];
  }
  if (existing.includes('Bautismo')) {
    return ['Bautismo'];
  }
  return []; // 'Ninguno' or empty → nothing
}

/**
 * Returns sacrament types the member can still register.
 * "Ninguno" is excluded when the member has a real sacrament.
 */
export function getAvailableSacramentTypes(existing: SacramentType[]): SacramentType[] {
  const effective = getEffectiveTypes(existing);
  const effectiveSet = new Set(effective);

  return SACRAMENT_TYPES.filter((type) => {
    if (type === 'Ninguno') {
      // Only offer "Ninguno" if they have no real sacraments yet
      return effective.length === 0 && !existing.includes('Ninguno');
    }
    // Show types NOT already covered by the chain or already registered
    return !effectiveSet.has(type) && !existing.includes(type);
  });
}