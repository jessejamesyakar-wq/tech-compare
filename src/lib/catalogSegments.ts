import { normalizeCatalogQuery } from './catalogListing';

type SegmentProduct = { name: string; specs?: unknown; subCategory?: string };

function fields(product: SegmentProduct) {
  const specs = (product.specs && typeof product.specs === 'object' ? product.specs : {}) as Record<string, unknown>;
  const text = (value: unknown) => typeof value === 'string' ? normalizeCatalogQuery(value) : '';
  return { specs, text, name: text(product.name) };
}

export function matchesConsoleSegment(product: SegmentProduct, segment: string): boolean {
  if (segment === 'all') return true;
  const { specs, text, name } = fields(product);
  const type = text(specs.deviceType);
  const vr = /\bvr\d*\b|quest|vision|sanal gerceklik/.test(`${name} ${type}`);
  const retro = /anbernic|retro|miyoo|arcade/.test(name);
  const portable = /tasinabilir|el konsolu|hibrit/.test(type) || /el konsolu|switch|steam deck|rog.*ally|legion go|claw|ayaneo/.test(name);
  if (segment === 'vr') return vr;
  if (segment === 'retro') return !vr && retro;
  if (segment === 'handheld') return !vr && portable;
  if (segment === 'home') {
    // A missing type is not evidence of a home console; handheld Xbox devices
    // and VR headsets must not be admitted by a brand name alone.
    return !vr && !portable && !retro && (
      /sabit|home console/.test(type) || /playstation\s*[345]|\bps[345]\b|xbox (series|one)|wii|steam machine/.test(name)
    );
  }
  return true;
}

export function matchesApplianceSegment(product: SegmentProduct, segment: string): boolean {
  if (segment === 'all') return true;
  const { specs, text, name } = fields(product);
  const subCategory = text(specs.subCategory || product.subCategory);
  const categories: Record<string, string[]> = {
    robot_vacuum: ['robot_vacuum'], stick_vacuum: ['stick_vacuum'],
    airfryer: ['airfryer', 'deep_fryer'], coffee: ['coffee_machine', 'espresso_machine'],
    climate: ['air_conditioner', 'air_purifier', 'humidifier', 'dehumidifier', 'fan'],
  };
  if (!categories[segment]) return true;
  // Prefer an explicit subtype to broad name/brand guesses (airfryer is not air conditioning).
  if (subCategory && subCategory !== 'kitchen') return categories[segment].includes(subCategory);
  const patterns: Record<string, RegExp> = {
    robot_vacuum: /robot.*supurge|robot vacuum/,
    stick_vacuum: /dikey.*supurge|sarjli supurge|stick vacuum/,
    airfryer: /airfryer|air fryer|fritoz/,
    coffee: /kahve|espresso|lattego/,
    climate: /hava temizleyici|air purifier|klima|vantilator|nem alici|hava nemlendirici|humidifier/,
  };
  return patterns[segment].test(name);
}

export function matchesMonitorSegment(product: SegmentProduct, segment: string): boolean {
  if (segment === 'all') return true;
  const { specs, text, name } = fields(product);
  const size = Number(specs.screenSizeInches);
  if (segment === 'gaming') return Number(specs.refreshRateHz) >= 144;
  if (segment === 'pro') return /4k|3840|4096/.test(text(specs.resolution)) || /proart|studio|ultrafine/.test(name);
  if (segment === '27inch') return size >= 26.5 && size <= 28.5;
  if (segment === '32inch') return size >= 31;
  if (segment === '24inch') return size >= 23 && size <= 25;
  return true;
}
