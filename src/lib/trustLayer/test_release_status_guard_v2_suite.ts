/**
 * RELEASE STATUS GUARD V2 — REGRESSION TEST SUITE
 *
 * Verifies:
 * 1. official 2026 product + catalog year 2027 -> RELEASE_YEAR_CONFLICT detected, closure blocked
 * 2. official 2025 product + catalog year 2027 -> RELEASE_YEAR_CONFLICT detected, closure blocked
 * 3. correct year -> pass (closureAllowed = true)
 * 4. unreleased product -> remains blocked (UNRELEASED, mutationAllowed = false)
 * 5. root ID contains wrong historical year but canonical releaseYear corrected
 *    -> pass with IDENTIFIER_YEAR_MISMATCH warning (closureAllowed = true)
 */

import { ReleaseStatusGuardV2 } from './enforce/releaseStatusGuardV2';

console.log('=== RUNNING RELEASE STATUS GUARD V2 REGRESSION TEST SUITE ===');

let passedTests = 0;

// Test 1: official 2026 product + catalog year 2027 -> conflict detected
{
  const result = ReleaseStatusGuardV2.evaluate({
    rootId: 'poco-x8-pro-256gb-2027',
    modelName: 'Poco X8 Pro',
    rawStatus: 'RELEASED_OFFICIAL',
    catalogReleaseYear: 2027,
    officialReleaseYear: 2026,
    officialReleaseDate: '2026-03-17',
    officialSourceUrl: 'https://www.po.co'
  });

  if (result.classification === 'RELEASE_YEAR_CONFLICT' && result.closureAllowed === false) {
    console.log('✅ Regression Test 1: Official 2026 product + catalog year 2027 -> conflict detected, closure blocked');
    passedTests++;
  } else {
    throw new Error(`Test 1 Failed: Expected RELEASE_YEAR_CONFLICT and closureAllowed: false, got ${JSON.stringify(result)}`);
  }
}

// Test 2: official 2025 product + catalog year 2027 -> conflict detected
{
  const result = ReleaseStatusGuardV2.evaluate({
    rootId: 'poco-f8-ultra-512gb-2027',
    modelName: 'Poco F8 Ultra',
    rawStatus: 'RELEASED_OFFICIAL',
    catalogReleaseYear: 2027,
    officialReleaseYear: 2025,
    officialReleaseDate: '2025-11-26',
    officialSourceUrl: 'https://www.mi.com'
  });

  if (result.classification === 'RELEASE_YEAR_CONFLICT' && result.closureAllowed === false) {
    console.log('✅ Regression Test 2: Official 2025 product + catalog year 2027 -> conflict detected, closure blocked');
    passedTests++;
  } else {
    throw new Error(`Test 2 Failed: Expected RELEASE_YEAR_CONFLICT and closureAllowed: false, got ${JSON.stringify(result)}`);
  }
}

// Test 3: correct year -> pass
{
  const result = ReleaseStatusGuardV2.evaluate({
    rootId: 'poco-x6-pro-512gb-2024',
    modelName: 'Poco X6 Pro',
    rawStatus: 'RELEASED_OFFICIAL',
    catalogReleaseYear: 2024,
    officialReleaseYear: 2024,
    officialReleaseDate: '2024-01-11',
    officialSourceUrl: 'https://www.po.co'
  });

  if (result.classification === 'RELEASED_OFFICIAL' && result.closureAllowed === true && result.identifierYearMismatch === false) {
    console.log('✅ Regression Test 3: Correct year -> pass (closureAllowed = true, mismatch = false)');
    passedTests++;
  } else {
    throw new Error(`Test 3 Failed: Expected clean PASS, got ${JSON.stringify(result)}`);
  }
}

// Test 4: unreleased product -> remains blocked
{
  const result = ReleaseStatusGuardV2.evaluate({
    rootId: 'vivo-v50-pro-512gb-2025',
    modelName: 'Vivo V50 Pro 5G',
    rawStatus: 'UNRELEASED'
  });

  if (result.classification === 'UNRELEASED' && result.closureAllowed === false && result.specMutationAllowed === false) {
    console.log('✅ Regression Test 4: Unreleased product -> remains blocked (UNRELEASED, mutationAllowed = false)');
    passedTests++;
  } else {
    throw new Error(`Test 4 Failed: Expected UNRELEASED with zero mutation, got ${JSON.stringify(result)}`);
  }
}

// Test 5: root ID contains wrong historical year but canonical releaseYear corrected
// -> catalog may pass with IDENTIFIER_YEAR_MISMATCH governance warning
{
  const result = ReleaseStatusGuardV2.evaluate({
    rootId: 'poco-m8-pro-5g-256gb-2027',
    modelName: 'Poco M8 Pro 5G',
    rawStatus: 'RELEASED_OFFICIAL',
    catalogReleaseYear: 2026, // corrected!
    officialReleaseYear: 2026,
    officialReleaseDate: '2026-01-08',
    officialSourceUrl: 'https://www.po.co'
  });

  if (result.classification === 'RELEASED_OFFICIAL' && 
      result.closureAllowed === true && 
      result.identifierYearMismatch === true &&
      result.identifierYear === 2027) {
    console.log('✅ Regression Test 5: Root ID contains wrong historical year but canonical releaseYear corrected -> PASS with IDENTIFIER_YEAR_MISMATCH warning');
    passedTests++;
  } else {
    throw new Error(`Test 5 Failed: Expected clean PASS with IDENTIFIER_YEAR_MISMATCH, got ${JSON.stringify(result)}`);
  }
}

console.log(`\nSummary: ${passedTests}/5 tests passed.`);
