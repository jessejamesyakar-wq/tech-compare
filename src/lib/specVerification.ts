import type { Product } from './types';
import { hasLegacyPhoneSpecs, LEGACY_PHONE_SPEC_NOTICE } from './smartphoneSpecFields';

export function getSpecVerificationNotice(product: Product): string | null {
  if (product.specVerification?.note) return product.specVerification.note;
  return product.category === 'smartphones' && hasLegacyPhoneSpecs(product.specs)
    ? LEGACY_PHONE_SPEC_NOTICE : null;
}

/** An unresolved parent also blocks its children; sibling fields remain usable. */
export function hasUnresolvedSpecField(product: Product, paths: string): boolean {
  const normalize = (path: string) => path.replace(/^specs\./, '');
  return paths.split('|').some(path => product.specVerification?.unresolvedFields.some(field => {
    const queried = normalize(path), unresolved = normalize(field);
    return queried === unresolved || queried.startsWith(`${unresolved}.`) || unresolved.startsWith(`${queried}.`);
  }) ?? false);
}
