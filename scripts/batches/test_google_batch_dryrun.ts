import fs from 'fs';
import path from 'path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../../src/lib/trustLayer/enforce/mutationScopeGuard';

const CATALOG_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');
const beforeCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

// Scope Lock Declaration
const scope: MutationScopeDeclaration = {
  taskId: 'BATCH-GOOGLE-P1-COMPLETION',
  description: 'Mutate verified P1 core specs with HIGH confidence official Google manufacturer evidence',
  authorizedRootIds: [
    'google-google-pixel-10-pro-xl-28',
    'google-pixel-10-pro-xl-256gb-icecat',
    'google-google-pixel-9a-25',
    'google-pixel-9a-128gb-icecat'
  ],
  authorizedFieldPaths: [
    'specs.screen.size',
    'specs.screen.type',
    'specs.processor.chip',
    'specs.screen.resolution'
  ],
  maxRootMutations: 4,
  priceMutationAllowed: false,
  goldenDatasetMutationAllowed: false
};

console.log('1. Validating Scope Declaration...');
MutationScopeGuard.validateDeclaration(scope);
console.log('✅ Scope Declaration Validated.');

// Intended mutations
const intendedMutations: IntendedRootMutation[] = [
  {
    rootId: 'google-google-pixel-10-pro-xl-28',
    fieldMutations: [
      {
        fieldPath: 'specs.screen.size',
        beforeValue: '6.85"',
        afterValue: '6.8"'
      },
      {
        fieldPath: 'specs.screen.type',
        beforeValue: '6.85" 2K 144Hz LTPO OLED 3500 Nits',
        afterValue: '6.8" Super Actua LTPO OLED (120Hz)'
      },
      {
        fieldPath: 'specs.processor.chip',
        beforeValue: 'Google Tensor G5 (TSMC 3nm)',
        afterValue: 'Google Tensor G5'
      }
    ]
  },
  {
    rootId: 'google-google-pixel-9a-25',
    fieldMutations: [
      {
        fieldPath: 'specs.processor.chip',
        beforeValue: 'Google Tensor G4 (Düz Arka Gövde)',
        afterValue: 'Google Tensor G4'
      },
      {
        fieldPath: 'specs.screen.resolution',
        beforeValue: '2400 x 1080 px',
        afterValue: '2424 x 1080 px'
      }
    ]
  }
];

console.log('\n2. Validating Intended Mutations (Pre-flight)...');
const preCheckResult = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
console.log('✅ Pre-Flight Validation Passed:', preCheckResult);

console.log('\n3. Simulating Guarded Mutation (in-memory clone)...');
const afterCatalog = JSON.parse(JSON.stringify(beforeCatalog));

// Mutate pixel 10 pro xl
const p10 = afterCatalog.find((x: any) => x.id === 'google-google-pixel-10-pro-xl-28');
p10.specs.screen.size = '6.8"';
p10.specs.screen.type = '6.8" Super Actua LTPO OLED (120Hz)';
p10.specs.processor.chip = 'Google Tensor G5';

// Mutate pixel 9a
const p9a = afterCatalog.find((x: any) => x.id === 'google-google-pixel-9a-25');
p9a.specs.processor.chip = 'Google Tensor G4';
p9a.specs.screen.resolution = '2424 x 1080 px';

console.log('\n4. Running Post-Operation Assertions...');
const postResult = MutationScopeGuard.assertPostOperation(scope, beforeCatalog, afterCatalog);
console.log('✅ Post-Operation Assertions Passed:');
console.log('   Actual Mutated Roots:', postResult.actualMutatedRoots);
console.log('   Actual Mutated Fields:', postResult.actualMutatedFields);
console.log('   Actual Root Mutation Count:', postResult.actualRootMutationCount);
console.log('   Price Mutation Count:', postResult.priceMutationCount);
console.log('   Golden Mutation Count:', postResult.goldenMutationCount);
