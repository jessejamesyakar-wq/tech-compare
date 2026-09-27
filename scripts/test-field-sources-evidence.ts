import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FieldSourcesEvidence } from '../src/components/detail/FieldSourcesEvidence';
import { ProductSpecSources } from '../src/components/detail/ProductSpecSources';
import { LEGACY_PHONE_SPEC_NOTICE } from '../src/lib/smartphoneSpecFields';
import type { Product } from '../src/lib/types';

console.log('Running Comprehensive FieldSourcesEvidence & ProductSpecSources Tests...');

function renderFieldSources(product: Partial<Product>): string {
  return renderToStaticMarkup(React.createElement(FieldSourcesEvidence, { product: product as Product }));
}

function renderProductSpecSources(product: Partial<Product>): string {
  return renderToStaticMarkup(React.createElement(ProductSpecSources, { product: product as Product }));
}

function countFieldSourcesPanels(html: string): number {
  const matches = html.match(/data-testid="field-sources-evidence"/g);
  return matches ? matches.length : 0;
}

// 1. Valid ISO Timestamp & Field Translations
const validIsoProduct: Partial<Product> = {
  id: 'test-phone-1',
  category: 'smartphones',
  fieldSources: [
    {
      sourceUrl: 'https://example.com/specs',
      checkedAt: '2026-09-27T14:30:00Z',
      fields: ['screen.size', 'processor', 'category'],
      scopeNote: 'Official manufacturer spec sheet',
    },
  ],
};
const html1 = renderFieldSources(validIsoProduct);
assert.strictEqual(html1.includes('27 Eylül 2026'), true, 'ISO timestamp should be formatted as 27 Eylül 2026');
assert.strictEqual(html1.includes('Ekran Boyutu'), true, 'screen.size should map to Ekran Boyutu');
assert.strictEqual(html1.includes('İşlemci / Yonga Seti'), true, 'processor should map to İşlemci / Yonga Seti');
assert.strictEqual(html1.includes('Ürün Kategorisi'), true, 'category should map to Ürün Kategorisi');
assert.strictEqual(html1.includes('Özgün Kaynak Notunu Göster'), true, 'Collapsible summary for scopeNote should be rendered');
console.log('PASS 1: ISO timestamp and field translations render correctly');

// 2. Leap Year Validation: 2024-02-29 (valid) vs 2026-02-29 (invalid)
const leapYearValidProduct: Partial<Product> = {
  id: 'leap-valid',
  fieldSources: [{ checkedAt: '2024-02-29', fields: ['screen'] }] as any,
};
const leapYearInvalidProduct: Partial<Product> = {
  id: 'leap-invalid',
  fieldSources: [{ checkedAt: '2026-02-29', fields: ['screen'] }] as any,
};
const htmlLeapValid = renderFieldSources(leapYearValidProduct);
assert.strictEqual(htmlLeapValid.includes('29 Şubat 2024'), true, '2024-02-29 should be recognized as valid leap date');

const htmlLeapInvalid = renderFieldSources(leapYearInvalidProduct);
assert.strictEqual(htmlLeapInvalid.includes('Doğrulama tarihi belirtilmedi'), true, '2026-02-29 should be rejected as invalid date');
assert.strictEqual(htmlLeapInvalid.includes('2026-02-29'), false, 'Raw invalid date 2026-02-29 should not be printed');
console.log('PASS 2: Leap year date validation (2024-02-29 valid, 2026-02-29 invalid)');

// 3. Real Calendar Date & Invalid Time Signature (2026-02-31, 2026-09-27GARBAGE, T99:99:99Z)
const invalidCalProduct: Partial<Product> = {
  id: 'invalid-cal',
  fieldSources: [{ checkedAt: '2026-02-31', fields: ['screen'] }] as any,
};
const htmlInvalidCal = renderFieldSources(invalidCalProduct);
assert.strictEqual(htmlInvalidCal.includes('Doğrulama tarihi belirtilmedi'), true, '2026-02-31 should be rejected');
assert.strictEqual(htmlInvalidCal.includes('2026-02-31'), false, '2026-02-31 raw string should not be displayed');

const garbageDateProduct: Partial<Product> = {
  id: 'garbage-date',
  fieldSources: [{ checkedAt: '2026-09-27GARBAGE', fields: ['screen'] }] as any,
};
const htmlGarbage = renderFieldSources(garbageDateProduct);
assert.strictEqual(htmlGarbage.includes('Doğrulama tarihi belirtilmedi'), true, '2026-09-27GARBAGE should be rejected');
assert.strictEqual(htmlGarbage.includes('GARBAGE'), false, 'Garbage text should not be rendered');

const invalidTimeProduct: Partial<Product> = {
  id: 'invalid-time',
  fieldSources: [{ checkedAt: '2026-09-27T99:99:99Z', fields: ['screen'] }] as any,
};
const htmlInvalidTime = renderFieldSources(invalidTimeProduct);
assert.strictEqual(htmlInvalidTime.includes('Doğrulama tarihi belirtilmedi'), true, 'T99:99:99Z should be rejected');
assert.strictEqual(htmlInvalidTime.includes('99:99'), false, 'Invalid time string should not be displayed');
console.log('PASS 3: Calendar 2026-02-31, 2026-09-27GARBAGE, and T99:99:99Z rejected safely');

// 4. Credential & Javascript URLs Negative Test
const unsafeUrlProduct: Partial<Product> = {
  id: 'unsafe-urls',
  category: 'smartphones',
  fieldSources: [
    {
      sourceUrl: 'https://admin:secret@example.com/specs',
      checkedAt: '2026-09-27',
      fields: ['camera'],
    },
    {
      sourceUrl: 'javascript:alert(1)',
      checkedAt: '2026-09-27',
      fields: ['audio'],
    },
  ],
};
const htmlUnsafe = renderFieldSources(unsafeUrlProduct);
assert.strictEqual(htmlUnsafe.includes('href="https://admin:secret'), false, 'Credential URL should not be rendered as link');
assert.strictEqual(htmlUnsafe.includes('href="javascript:'), false, 'Javascript URL should not be rendered as link');
console.log('PASS 4: Credential and javascript URLs are rejected safely');

// 5. Missing / Null / Object Fields (Root level and array elements)
const nullFieldsProduct: Partial<Product> = {
  id: 'null-fields',
  fieldSources: [
    {
      sourceUrl: 'https://example.com/specs',
      checkedAt: '2026-09-27',
      fields: null as any,
    },
  ],
};
assert.doesNotThrow(() => {
  const htmlNullF = renderFieldSources(nullFieldsProduct);
  assert.strictEqual(htmlNullF.includes('Kapsanan Alanlar:'), true);
}, 'Null fields should not crash rendering');

const objectFieldsProduct: Partial<Product> = {
  id: 'object-fields',
  fieldSources: [
    {
      sourceUrl: 'https://example.com/specs',
      checkedAt: '2026-09-27',
      fields: { bad: 'object' } as any,
    },
  ],
};
assert.doesNotThrow(() => {
  const htmlObjF = renderFieldSources(objectFieldsProduct);
  assert.strictEqual(htmlObjF.includes('Belirtilmedi'), true);
}, 'Object fields should not crash rendering');
console.log('PASS 5: Missing, null, and object fields handled safely without crashing');

// 6. Array / Object / Null scopeNote Safety
const arrayScopeNoteProduct: Partial<Product> = {
  id: 'array-scopenote',
  fieldSources: [
    {
      sourceUrl: 'https://example.com/specs',
      checkedAt: '2026-09-27',
      fields: ['battery'],
      scopeNote: ['array', 'note'] as any,
    },
  ],
};
assert.doesNotThrow(() => {
  const htmlArray = renderFieldSources(arrayScopeNoteProduct);
  assert.strictEqual(htmlArray.includes('[object Object]'), false, 'Array scopeNote should not print [object Object]');
}, 'Array scopeNote should not crash rendering');
console.log('PASS 6: Array and object scopeNotes do not crash React rendering');

// 7. Non-array fieldSources & Empty `{}` Source Objects
const nonArraySourcesProduct: Partial<Product> = {
  id: 'non-array-sources',
  fieldSources: 'not-an-array' as any,
};
const htmlNonArray = renderFieldSources(nonArraySourcesProduct);
assert.strictEqual(htmlNonArray.includes('Katalog kaynak doğrulaması bekliyor.'), true, 'Non-array fieldSources should fall back cleanly');

const emptyObjectSourceProduct: Partial<Product> = {
  id: 'empty-object-source',
  fieldSources: [{} as any],
};
const htmlEmptyObj = renderFieldSources(emptyObjectSourceProduct);
assert.strictEqual(htmlEmptyObj.includes('Katalog kaynak doğrulaması bekliyor.'), true, 'Empty source object {} should fall back cleanly');
console.log('PASS 7: Non-array fieldSources and empty {} source objects fall back cleanly');

// 8. ProductSpecSources Wrapper, Single Panel Assertion & Spec Notices
const legacySpecProduct: Partial<Product> = {
  id: 'legacy-phone',
  category: 'smartphones',
  specs: {
    ram: 4,
    batteryCapacity: 3000,
  } as any,
  fieldSources: [],
};
const htmlProductSpecSources = renderProductSpecSources(legacySpecProduct);
assert.strictEqual(countFieldSourcesPanels(htmlProductSpecSources), 1, 'ProductSpecSources must render EXACTLY ONE field-sources-evidence panel');
assert.strictEqual(htmlProductSpecSources.includes(LEGACY_PHONE_SPEC_NOTICE), true, 'ProductSpecSources must preserve LEGACY_PHONE_SPEC_NOTICE notice');
console.log('PASS 8: ProductSpecSources delegates cleanly, preserves LEGACY_PHONE_SPEC_NOTICE, and renders exactly 1 panel');

// 9. Custom specVerification.note Assertion
const customNoteProduct: Partial<Product> = {
  id: 'custom-note-prod',
  category: 'monitors',
  specVerification: {
    note: 'Özel laboratuvar doğrulaması yapılmıştır.',
    unresolvedFields: [],
  },
  fieldSources: [],
};
const htmlCustomNote = renderFieldSources(customNoteProduct);
assert.strictEqual(countFieldSourcesPanels(htmlCustomNote), 1, 'Custom note product must render exactly 1 panel');
assert.strictEqual(htmlCustomNote.includes('Özel laboratuvar doğrulaması yapılmıştır.'), true, 'Custom specVerification.note text must be rendered');
console.log('PASS 9: Custom specVerification.note text is preserved and rendered');

console.log('\nAll 9 Comprehensive FieldSourcesEvidence Tests PASSED Successfully!');
