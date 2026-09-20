import React from 'react';

// Catalog rating/reviewCount fields have no review records or attributable
// review source. They cannot establish a verified buyer rating.
export function ReviewAvailability() {
  return <p className="text-xs font-medium text-slate-500">Doğrulanmış kullanıcı değerlendirmesi henüz yok.</p>;
}
