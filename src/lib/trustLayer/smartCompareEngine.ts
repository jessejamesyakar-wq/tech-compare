import { SmartCompareAnalysis, SmartCompareItem, DirectionalCompareStatus } from './types';
import { getSpecEvidenceRecord } from './specProvenanceResolver';

export function analyzeSmartCompare(productA: any, productB: any): SmartCompareAnalysis {
  const fieldsToCheck = [
    { path: 'screen.sizeInches', label: 'Ekran Boyutu' },
    { path: 'screen.type', label: 'Ekran Teknolojisi' },
    { path: 'screen.refreshRate', label: 'Yenileme Hızı' },
    { path: 'processor.chip', label: 'İşlemci Modeli' },
    { path: 'build.weightGrams', label: 'Ağırlık' },
    { path: 'build.thicknessMm', label: 'Kalınlık' },
    { path: 'charging.wiredMaxW', label: 'Kablolu Şarj Gücü' },
    { path: 'camera.mainMp', label: 'Ana Kamera' }
  ];

  const items: SmartCompareItem[] = [];
  let sameCount = 0;
  let differentCount = 0;
  let missingCount = 0;
  let conflictingCount = 0;

  for (const field of fieldsToCheck) {
    const evA = getSpecEvidenceRecord(productA, field.path);
    const evB = getSpecEvidenceRecord(productB, field.path);

    const valA = evA.value;
    const valB = evB.value;

    let directionalStatus: DirectionalCompareStatus;
    let comparisonStatus: 'same' | 'different' | 'missing' | 'conflicting';

    const isMissingA = valA === 'Belirtilmedi' || valA === undefined || valA === null;
    const isMissingB = valB === 'Belirtilmedi' || valB === undefined || valB === null;

    if (isMissingA && isMissingB) {
      directionalStatus = 'MISSING_BOTH';
      comparisonStatus = 'missing';
      missingCount++;
    } else if (isMissingA) {
      directionalStatus = 'MISSING_LEFT';
      comparisonStatus = 'missing';
      missingCount++;
    } else if (isMissingB) {
      directionalStatus = 'MISSING_RIGHT';
      comparisonStatus = 'missing';
      missingCount++;
    } else if (valA === valB) {
      directionalStatus = 'SAME';
      comparisonStatus = 'same';
      sameCount++;
    } else if (typeof valA === 'number' && typeof valB === 'number' && Math.abs(valA - valB) > 50) {
      directionalStatus = 'CONFLICT_LEFT';
      comparisonStatus = 'conflicting';
      conflictingCount++;
    } else {
      directionalStatus = 'DIFFERENT';
      comparisonStatus = 'different';
      differentCount++;
    }

    items.push({
      fieldPath: field.path,
      fieldLabel: field.label,
      valueA: valA,
      valueB: valB,
      provenanceA: evA.provenanceClass,
      provenanceB: evB.provenanceClass,
      comparisonStatus,
      directionalStatus
    });
  }

  return {
    productIdA: productA ? productA.id : 'left',
    productIdB: productB ? productB.id : 'right',
    nameA: productA ? productA.name : 'Left',
    nameB: productB ? productB.name : 'Right',
    sameCount,
    differentCount,
    missingCount,
    conflictingCount,
    items
  };
}
