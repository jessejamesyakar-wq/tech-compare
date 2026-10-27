/** Phase 3.4 staging-only source gate. Not imported by production UI or schedulers. */
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { computeEvidenceHashV2, deepCanonicalStringify, type FieldEvidenceRecord } from './fieldEvidence';

export const SOURCE_URLS = {
  asus2026: 'https://rog.asus.com/tr/laptops/rog-strix/rog-strix-scar-18-2026/spec/',
  tclP8L: 'https://www.tcl.com/tr/tr/tvs/p8l',
  tcl98P8L: 'https://www.tcl.com/tr/tr/tvs/98p8l',
} as const;
export type SourceId = keyof typeof SOURCE_URLS;
export const PILOT_SOURCE_IDENTITIES: Record<string, { model: string; sourceId: SourceId }> = {
  'asus-rog-strix-scar-18-g835lxg-tq378w': { model: 'G835LXG-TQ378W', sourceId: 'asus2026' },
  'tv-tcl-55-55p8l-55-inc': { model: '55P8L', sourceId: 'tclP8L' },
  'tv-tcl-65-65p8l-65-inc': { model: '65P8L', sourceId: 'tclP8L' },
  'tv-tcl-85-85p8l-85-inc': { model: '85P8L', sourceId: 'tclP8L' },
  'tv-tcl-98-98p8l-98-inc': { model: '98P8L', sourceId: 'tcl98P8L' },
};
type Value = string | number | boolean | null;
export interface SourceFact { model: string; region: 'TR'; field: string; value: Value; locator: string; excerpt: string }
export interface ExtractedSource { parserVersion: string; url: string; models: string[]; facts: SourceFact[]; technicalContext: string[]; visibleTextSha256: string; complete: boolean }
export interface Capture {
  id: SourceId; url: string; finalUrl?: string; status: number; robotsAllowed: boolean;
  rawSha256?: string; retrievedAt?: string;
}
export const digest = (body: string | Buffer) => createHash('sha256').update(body).digest('hex');
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Values come from the document, never a field-value whitelist. Ambiguous extraction fails closed. */
export function extractSource(id: SourceId, body: Buffer): ExtractedSource {
  const $ = load(body.toString('utf8'));
  const visible = load(body.toString('utf8'));
  visible('script,style,header,footer,nav').remove();
  const visibleTextSha256 = digest(visible('body').text().normalize('NFKC').replace(/\s+/g, ''));
  const result: ExtractedSource = { parserVersion: 'phase34.2', url: SOURCE_URLS[id], models: [], facts: [], technicalContext: [], visibleTextSha256, complete: false };
  const fact = (model: string, field: string, value: Value, locator: string, excerpt: string) => {
    if (value !== null) result.facts.push({ model, region: 'TR', field, value, locator, excerpt: clean(excerpt) });
  };
  if (id === 'asus2026') {
    const names = $('p[class="ProductSpec__specProductName__ZWUgn"]').map((_, e) => clean($(e).text())).get();
    const name = 'G835LXG-TQ378W-Gaming';
    if (names.filter(n => n === name).length !== 1 || !$('title').text().includes('(2026) G835')) return result;
    const column = names.indexOf(name) + 1;
    result.models = ['G835LXG-TQ378W'];
    const fields: Array<[string, string, RegExp]> = [
      ['Ekran', 'specs.screenSizeInches', /\b(\d+(?:\.\d+)?)-inch\b/],
      ['Pil', 'specs.batteryCapacityWh', /\b(\d+(?:\.\d+)?)\s*WHrs\b/],
      ['Güç Kaynağı', 'specs.chargerWatts', /\b(\d+)W AC Adapter\b/],
      ['Ağırlık', 'specs.weightKg', /\b(\d+(?:\.\d+)?)\s*Kg\b/],
    ];
    for (const [title, field, re] of fields) {
      const heading = $('h2').filter((_, e) => clean($(e).text()) === title);
      if (heading.length !== 1) continue;
      const groups = heading.next().find('[role="group"]');
      const row = groups.filter((_, e) => $(e).attr('aria-label') === `${column} of ${names.length}`);
      if (groups.length !== names.length || row.length !== 1) continue;
      const value = clean(row.text()); const matches = [...value.matchAll(new RegExp(re.source, 'g'))];
      if (matches.length !== 1) continue;
      fact(result.models[0], field, Number(matches[0][1]), `${title}: SKU column ${column}/${names.length}`, value);
      result.technicalContext.push(`${field}: ${value}`);
    }
    result.complete = result.facts.length === 4;
  } else {
    // Only the active page's product selector, never recommendation cards or a raw string occurrence.
    const selectors: Array<{ allproducts: Array<{ productInfo: { customerModel: string; productPage: string; productTitle: string } }> }> = [];
    $('input').each((_, e) => {
      try { const v = JSON.parse($(e).attr('value') || ''); if (Array.isArray(v.allproducts)) selectors.push(v); } catch { /* not a product selector */ }
    });
    if (selectors.length !== 1) return result;
    const page = new URL(SOURCE_URLS[id]).pathname;
    const models = selectors[0].allproducts.filter(p => p.productInfo?.productPage === page).map(p => p.productInfo.customerModel);
    result.models = [...new Set(models)].sort();
    if (!result.models.length || result.models.length !== models.length) return result;
    const title = clean($('title').text()); const heading = clean($('h1').first().text());
    if (!title.includes('P8L') || !heading.includes('P8L')) return result;
    $('script,style,header,footer,nav').remove();
    const text = clean($('body').text());
    // Numeric refresh evidence must be a native-rate phrase; do not use the game-accelerator rate.
    const refresh = [...text.matchAll(/(\d+)\s*Hz Doğal Yenileme Hızı/g)].map(m => Number(m[1]));
    const hz = [...new Set(refresh)];
    const os = text.match(/Google TV, bu cihazın yazılım deneyiminin adı/);
    const resolution = title.includes('4K') && /tüm sinyal yolu 4K 144Hz/.test(text);
    const audio = text.match(/ONKYO ([0-9]\.[0-9]) Hi-Fi Ses Sistemi 85", 75" ve 65" modellerinde mevcuttur; 55" modelinde ise ([0-9]\.[0-9]) hoparlör kullanılmaktadır\./);
    const audio98 = text.match(/ONKYO ([0-9]\.[0-9]) Kanal Hi-Fi sisteminin/);
    const context = [heading, hz.length === 1 ? `${hz[0]}Hz native` : 'NATIVE_RATE_MISSING_OR_CONFLICTED', os?.[0] || 'OS_MISSING', resolution ? '4K UHD signal path' : 'RESOLUTION_MISSING'];
    context.push(id === 'tcl98P8L' ? audio98?.[0] || 'AUDIO_MISSING' : audio?.[0] || 'SIZE_FOOTNOTE_MISSING');
    result.technicalContext = context;
    for (const model of result.models) {
      const anchor = `input[value].allproducts.productInfo customerModel=${model}, productPage=${page}`;
      if (hz.length === 1) fact(model, 'specs.refreshRateHz', hz[0], anchor + '; native refresh heading', `${hz[0]}Hz Doğal Yenileme Hızı`);
      if (os) fact(model, 'specs.smartOs', 'Google TV', anchor + '; OS footnote', os[0]);
      if (resolution) fact(model, 'specs.resolution', '4K Ultra HD', anchor + '; page title and 4K signal path', title);
      if (id === 'tcl98P8L' && model === '98P8L') {
        if (heading.includes('QD-Mini LED')) fact(model, 'specs.displayTech', 'QD-Mini LED', anchor + '; H1', heading);
        if (audio98) fact(model, 'specs.audioChannels', audio98[1] + ' Kanal', anchor + '; dedicated98 audio section', audio98[0]);
      } else if (audio && ['55P8L', '65P8L', '75P8L', '85P8L'].includes(model)) {
        fact(model, 'specs.audioChannels', (model === '55P8L' ? audio[2] : audio[1]) + ' Kanal', anchor + '; exact size exception', audio[0]);
      }
    }
    // The pages do not prove RMS wattage or a single compound display label for55–85.
    result.complete = hz.length === 1 && !!os && resolution && (id === 'tcl98P8L' ? !!audio98 : !!audio);
  }
  result.facts.sort((a, b) => `${a.model}:${a.field}`.localeCompare(`${b.model}:${b.field}`, 'en'));
  return result;
}

export function semanticHash(source: ExtractedSource): string {
  return digest(deepCanonicalStringify({ parserVersion: source.parserVersion, url: source.url, models: source.models, facts: source.facts.map(({ model, region, field, value }) => ({ model, region, field, value })), technicalContext: source.technicalContext.map(s => s.normalize('NFKC').replace(/\s+/g, '')), complete: source.complete }));
}
export function compareSources(previous: ExtractedSource | undefined, current: ExtractedSource, oldBytes?: Buffer, newBytes?: Buffer) {
  if (!current.complete) return 'EXTRACTION_INCOMPLETE' as const;
  if (!previous) return 'FIRST_CAPTURE_REVIEW_REQUIRED' as const;
  if (previous.parserVersion !== current.parserVersion || !previous.complete) return 'BASELINE_NOT_COMPARABLE' as const;
  if (semanticHash(previous) !== semanticHash(current)) return 'TECHNICAL_CHANGE_REVIEW_REQUIRED' as const;
  // A text change outside the supported fields is not safely classifiable as mere layout.
  if (previous.visibleTextSha256 !== current.visibleTextSha256) return 'UNCLASSIFIED_CONTENT_CHANGE_REVIEW_REQUIRED' as const;
  return oldBytes && newBytes && digest(oldBytes) === digest(newBytes) ? 'UNCHANGED' as const : 'HTML_OR_NONTECHNICAL_CHANGE' as const;
}

export function evaluateSourceClaim(args: {
  record: FieldEvidenceRecord; expectedModel: string; expectedRegion: string;
  capture: Capture; rawBody?: Buffer; previousBody?: Buffer; quarantinedKeys: ReadonlySet<string>; now: number;
}) {
  const { record: r, capture: c } = args;
  const pending = (reason: string, extra: object = {}) => ({ trustClassification: 'PENDING_SOURCE_REVIEW' as const, reason, ...extra });
  if (args.quarantinedKeys.has(`${r.productId}|${r.fieldPath}`) || r.trustClassification.startsWith('QUARANTINE')) return { trustClassification: 'QUARANTINE_CONTRADICTED' as const, reason: 'QUARANTINE_PRESERVED' };
  if (r.verificationStatus === 'CONFLICTED') return pending('EXISTING_CONFLICT_REQUIRES_REVIEW');
  if (r.evidenceHashVersion !== 'v2' || computeEvidenceHashV2(r) !== r.evidenceHash) return pending('INVALID_V2_INTEGRITY');
  const binding = Object.prototype.hasOwnProperty.call(PILOT_SOURCE_IDENTITIES, r.productId) ? PILOT_SOURCE_IDENTITIES[r.productId] : undefined;
  if (!binding || binding.model !== args.expectedModel || binding.sourceId !== c.id) return pending('PILOT_PRODUCT_SOURCE_BINDING_MISMATCH');
  if (!Object.prototype.hasOwnProperty.call(SOURCE_URLS, c.id) || c.url !== SOURCE_URLS[c.id] || c.finalUrl !== c.url) return pending('SOURCE_URL_OR_REDIRECT_MISMATCH');
  if (c.status !== 200 || !c.robotsAllowed || !args.rawBody) return pending('SOURCE_INACCESSIBLE_OR_POLICY_BLOCKED');
  if (digest(args.rawBody) !== c.rawSha256) return pending('CAPTURE_INTEGRITY_MISMATCH');
  const at = Date.parse(c.retrievedAt || '');
  if (!Number.isFinite(at) || at > args.now || args.now - at > 86400_000) return pending('INVALID_OR_STALE_CAPTURE_TIME');
  if (args.expectedRegion !== 'TR' || !args.expectedModel || args.expectedModel !== r.sourceProductId) return pending('REGIONAL_SKU_MISMATCH');
  if (r.observedValue === null || r.observedValue === undefined || /price/i.test(r.fieldPath)) return pending('MISSING_VALUE_OR_PRICE_OUT_OF_SCOPE');
  const current = extractSource(c.id, args.rawBody);
  const previous = args.previousBody ? extractSource(c.id, args.previousBody) : undefined;
  const drift = compareSources(previous, current, args.previousBody, args.rawBody);
  if (!current.models.includes(args.expectedModel)) return pending('EXACT_MODEL_NOT_IN_SOURCE', { drift });
  const facts = current.facts.filter(f => f.model === args.expectedModel && f.region === args.expectedRegion && f.field === r.fieldPath);
  if (facts.length !== 1) return pending('NO_UNAMBIGUOUS_FIELD_PROOF', { drift });
  const proof = facts[0];
  if (deepCanonicalStringify(proof.value) !== deepCanonicalStringify(r.observedValue)) return pending('TECHNICAL_VALUE_CONTRADICTION', { drift, proof });
  if (!['UNCHANGED', 'HTML_OR_NONTECHNICAL_CHANGE'].includes(drift)) return pending(drift, { drift, proof });
  return { trustClassification: 'OFFICIAL_MANUFACTURER_VERIFIED' as const, reason: 'ALL_SOURCE_GATES_PASSED', drift, proof, semanticSha256: semanticHash(current), verifiedAt: c.retrievedAt };
}
