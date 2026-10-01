/**
 * HISTORICAL SCOPE EXCEPTIONS REGISTRY
 *
 * Records catalog mutations that occurred outside explicit root-level user authorization
 * during previous repair operations (Batch 3 legacy clone cleanup).
 *
 * GOVERNANCE DIRECTIVE:
 * - Classified as: HISTORICAL_SCOPE_EXCEPTION
 * - Do NOT roll back in this task.
 * - Going forward, MutationScopeGuard enforces strict SCOPE LOCK.
 * - Family consistency, related products, or cleanups NEVER grant mutation authority.
 */

export interface HistoricalScopeExceptionRecord {
  exceptionId: string;
  classification: 'HISTORICAL_SCOPE_EXCEPTION';
  rootId: string;
  slug: string;
  modelName: string;
  batchIntroduced: string;
  timestamp: string;
  rationaleClaimedAtMutation: string;
  governanceResolution: string;
  mutatedFields: {
    fieldPath: string;
    beforeValue: string | number | boolean | null;
    afterValue: string | number | boolean | null;
  }[];
}

export const HISTORICAL_SCOPE_EXCEPTIONS: HistoricalScopeExceptionRecord[] = [
  {
    exceptionId: 'HSE-2026-09-APPLE-IP4-8GB',
    classification: 'HISTORICAL_SCOPE_EXCEPTION',
    rootId: 'apple-apple-iphone-4-8-gb-93',
    slug: 'apple-iphone-4-8-gb',
    modelName: 'Apple iPhone 4 (8 GB)',
    batchIntroduced: 'Batch 3 (Clean Legacy Clones)',
    timestamp: '2026-09-29T05:07:08Z',
    rationaleClaimedAtMutation: 'Family consistency with iPhone 4 16GB (cleaned dirty Wi-Fi 7 / BT 5.3 / 7.6mm strings)',
    governanceResolution: 'Scope lock prevents automated expansion. Retained as validated hardware fact under explicit governance exception.',
    mutatedFields: [
      { fieldPath: 'specs.connectivity.wifiStandard', beforeValue: 'Wi-Fi 7 / Wi-Fi 6 / Wi-Fi 4', afterValue: 'Wi-Fi 4 (802.11b/g/n)' },
      { fieldPath: 'specs.connectivity.bluetooth', beforeValue: '5.3 / 5.0 / 4.0 / 2.1', afterValue: '2.1 + EDR' },
      { fieldPath: 'specs.build.thicknessMm', beforeValue: 7.6, afterValue: 9.3 }
    ]
  },
  {
    exceptionId: 'HSE-2026-09-APPLE-IP4-32GB',
    classification: 'HISTORICAL_SCOPE_EXCEPTION',
    rootId: 'apple-apple-iphone-4-32-gb-139',
    slug: 'apple-iphone-4-32-gb',
    modelName: 'Apple iPhone 4 (32 GB)',
    batchIntroduced: 'Batch 3 (Clean Legacy Clones)',
    timestamp: '2026-09-29T05:07:08Z',
    rationaleClaimedAtMutation: 'Family consistency with iPhone 4 16GB (cleaned dirty Wi-Fi 7 / BT 5.3 / 7.6mm strings)',
    governanceResolution: 'Scope lock prevents automated expansion. Retained as validated hardware fact under explicit governance exception.',
    mutatedFields: [
      { fieldPath: 'specs.connectivity.wifiStandard', beforeValue: 'Wi-Fi 7 / Wi-Fi 6 / Wi-Fi 4', afterValue: 'Wi-Fi 4 (802.11b/g/n)' },
      { fieldPath: 'specs.connectivity.bluetooth', beforeValue: '5.3 / 5.0 / 4.0 / 2.1', afterValue: '2.1 + EDR' },
      { fieldPath: 'specs.build.thicknessMm', beforeValue: 7.6, afterValue: 9.3 }
    ]
  },
  {
    exceptionId: 'HSE-2026-09-APPLE-IP6SP-32GB',
    classification: 'HISTORICAL_SCOPE_EXCEPTION',
    rootId: 'apple-apple-iphone-6s-plus-32-gb-63222',
    slug: 'apple-iphone-6s-plus-32-gb',
    modelName: 'Apple iPhone 6s Plus (32 GB)',
    batchIntroduced: 'Batch 3 (Clean Legacy Clones)',
    timestamp: '2026-09-29T05:07:08Z',
    rationaleClaimedAtMutation: 'Family consistency with iPhone 6s Plus 16GB (cleaned dirty Wi-Fi 7 / BT 5.3 / weight / thickness)',
    governanceResolution: 'Scope lock prevents automated expansion. Retained as validated hardware fact under explicit governance exception.',
    mutatedFields: [
      { fieldPath: 'specs.connectivity.wifiStandard', beforeValue: 'Wi-Fi 7 / Wi-Fi 6 / Wi-Fi 4', afterValue: 'Wi-Fi 5 (802.11ac) MIMO' },
      { fieldPath: 'specs.connectivity.bluetooth', beforeValue: '5.3 / 5.0 / 4.0 / 2.1', afterValue: '4.2' },
      { fieldPath: 'specs.build.weightGrams', beforeValue: 188, afterValue: 192 },
      { fieldPath: 'specs.build.thicknessMm', beforeValue: 7.6, afterValue: 7.3 }
    ]
  },
  {
    exceptionId: 'HSE-2026-09-APPLE-IP6SP-64GB',
    classification: 'HISTORICAL_SCOPE_EXCEPTION',
    rootId: 'apple-apple-iphone-6s-plus-64-gb-31581',
    slug: 'apple-iphone-6s-plus-64-gb',
    modelName: 'Apple iPhone 6s Plus (64 GB)',
    batchIntroduced: 'Batch 3 (Clean Legacy Clones)',
    timestamp: '2026-09-29T05:07:08Z',
    rationaleClaimedAtMutation: 'Family consistency with iPhone 6s Plus 16GB (cleaned dirty Wi-Fi 7 / BT 5.3 / weight / thickness)',
    governanceResolution: 'Scope lock prevents automated expansion. Retained as validated hardware fact under explicit governance exception.',
    mutatedFields: [
      { fieldPath: 'specs.connectivity.wifiStandard', beforeValue: 'Wi-Fi 7 / Wi-Fi 6 / Wi-Fi 4', afterValue: 'Wi-Fi 5 (802.11ac) MIMO' },
      { fieldPath: 'specs.connectivity.bluetooth', beforeValue: '5.3 / 5.0 / 4.0 / 2.1', afterValue: '4.2' },
      { fieldPath: 'specs.build.weightGrams', beforeValue: 188, afterValue: 192 },
      { fieldPath: 'specs.build.thicknessMm', beforeValue: 7.6, afterValue: 7.3 }
    ]
  }
];
