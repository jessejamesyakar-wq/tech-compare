import type { Product } from './types';
import { hasLegacyPhoneSpecs, LEGACY_PHONE_SPEC_NOTICE } from './smartphoneSpecFields';

export function getSpecVerificationNotice(product: Product): string | null {
  if (product.specVerification?.note) return product.specVerification.note;
  if (product.id === 'samsung-samsung-galaxy-s25-fe-110') {
    return 'Bu ürünün RAM kapasitesi doğrulama bekliyor; tartışmalı katalog değeri karşılaştırma ve önerilerde kullanılmaz.';
  }
  return product.category === 'smartphones' && hasLegacyPhoneSpecs(product.specs)
    ? LEGACY_PHONE_SPEC_NOTICE : null;
}

/** An unresolved parent also blocks its children; sibling fields remain usable. */
export function hasUnresolvedSpecField(product: Product, paths: string): boolean {
  if (product.id === 'samsung-samsung-galaxy-s25-fe-110' && paths.split('|').some(path => /^(?:specs\.)?(?:memory\.ramGb|ramGb|ram)$/.test(path))) {
    return true;
  }
  const normalize = (path: string) => path.replace(/^specs\./, '');
  return paths.split('|').some(path => product.specVerification?.unresolvedFields.some(field => {
    const queried = normalize(path), unresolved = normalize(field);
    return queried === unresolved || queried.startsWith(`${unresolved}.`) || unresolved.startsWith(`${queried}.`);
  }) ?? false);
}
