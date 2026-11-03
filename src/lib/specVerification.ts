import type { Product } from './types';
import { hasLegacyPhoneSpecs, LEGACY_PHONE_SPEC_NOTICE } from './smartphoneSpecFields';

const FLAT_TO_NESTED_ALIASES: Record<string, string[]> = {
  ram: ['memory.ramGb', 'ramGb', 'ram'],
  ramGb: ['memory.ramGb', 'ramGb', 'ram'],
  'memory.ramGb': ['memory.ramGb', 'ramGb', 'ram'],
  storage: ['memory.storageGb', 'storageGb', 'storage'],
  storageGb: ['memory.storageGb', 'storageGb', 'storage'],
  'memory.storageGb': ['memory.storageGb', 'storageGb', 'storage'],
  processor: ['processor.chip', 'processor'],
  'processor.chip': ['processor.chip', 'processor'],
  screenSize: ['screen.size', 'screenSize'],
  'screen.size': ['screen.size', 'screenSize'],
  resolution: ['screen.resolution', 'resolution'],
  'screen.resolution': ['screen.resolution', 'resolution'],
  refreshRate: ['screen.refreshRate', 'refreshRate', 'refreshRateHz'],
  'screen.refreshRate': ['screen.refreshRate', 'refreshRate', 'refreshRateHz'],
  ultrawideMp: ['camera.ultrawideMp', 'ultrawideMp'],
  'camera.ultrawideMp': ['camera.ultrawideMp', 'ultrawideMp'],
  telephotoMp: ['camera.telephotoMp', 'telephotoMp'],
  'camera.telephotoMp': ['camera.telephotoMp', 'telephotoMp'],
  mainCamera: ['camera.mainMp', 'mainCamera', 'rearCameraMp'],
  'camera.mainMp': ['camera.mainMp', 'mainCamera', 'rearCameraMp'],
  frontCamera: ['camera.selfieMp', 'frontCamera', 'selfieMp'],
  'camera.selfieMp': ['camera.selfieMp', 'frontCamera', 'selfieMp'],
  battery: ['battery.capacitymAh', 'batteryCapacityMah', 'batteryMah', 'battery'],
  'battery.capacitymAh': ['battery.capacitymAh', 'batteryCapacityMah', 'batteryMah', 'battery'],
  has5G: ['connectivity.has5G', 'has5G'],
  'connectivity.has5G': ['connectivity.has5G', 'has5G'],
};

export function getSpecVerificationNotice(product: Product): string | null {
  if (!product) return null;
  if (product.specVerification?.note) return product.specVerification.note;
  if (product.id === 'samsung-samsung-galaxy-s25-fe-110') {
    return 'Bu ürünün RAM kapasitesi doğrulama bekliyor; tartışmalı katalog değeri karşılaştırma ve önerilerde kullanılmaz.';
  }
  return product.category === 'smartphones' && hasLegacyPhoneSpecs(product.specs)
    ? LEGACY_PHONE_SPEC_NOTICE : null;
}

/** An unresolved parent also blocks its children; sibling fields remain usable. */
export function hasUnresolvedSpecField(product: Product | null | undefined, paths: string | string[]): boolean {
  if (!product) return false;
  const rawTokens = (Array.isArray(paths) ? paths : [paths])
    .flatMap(p => String(p).split('|'))
    .map(p => p.trim())
    .filter(Boolean);

  if (product.id === 'samsung-samsung-galaxy-s25-fe-110' && rawTokens.some(path => /^(?:specs\.)?(?:memory\.ramGb|ramGb|ram)$/.test(path))) {
    return true;
  }

  const unresolvedList = product.specVerification?.unresolvedFields;
  if (!Array.isArray(unresolvedList) || unresolvedList.length === 0) return false;

  const normalize = (path: string) => path.replace(/^specs\./, '');
  const primaryQueried = new Set<string>();
  const expandedQueried = new Set<string>();
  for (const token of rawTokens) {
    const norm = normalize(token);
    primaryQueried.add(norm);
    expandedQueried.add(norm);
    const aliases = FLAT_TO_NESTED_ALIASES[norm];
    if (aliases) aliases.forEach(a => expandedQueried.add(a));
  }

  return Array.from(expandedQueried).some(queried =>
    unresolvedList.some(field => {
      const unresolved = normalize(field);
      return (
        queried === unresolved ||
        queried.startsWith(`${unresolved}.`) ||
        (primaryQueried.has(queried) && unresolved.startsWith(`${queried}.`))
      );
    })
  );
}

