export function formatSpecValue(value: unknown, unit = ''): string {
  if (value === true) return 'Var';
  if (value === false) return 'Yok';
  if (typeof value === 'number') return Number.isFinite(value) ? `${value.toLocaleString('tr-TR')}${unit ? ` ${unit}` : ''}` : 'Bilinmiyor';
  if (typeof value === 'string') return value.trim() || 'Bilinmiyor';
  if (Array.isArray(value)) return value.length ? value.map(v=>formatSpecValue(v)).join(' • ') : 'Bilinmiyor';
  if (value && typeof value === 'object') return Object.entries(value).map(([key,item])=>`${key}: ${formatSpecValue(item)}`).join(' • ') || 'Bilinmiyor';
  return 'Bilinmiyor';
}
