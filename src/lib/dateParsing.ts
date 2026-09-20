const MONTHS: Record<string, number> = {
  ocak: 1, subat: 2, şubat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5,
  haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9,
  ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
};

function calendarDate(year: number, month: number, day: number): number {
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return 0;
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? timestamp : 0;
}

function parseDate(value: string | undefined, allowMonthObservation: boolean): number {
  if (typeof value !== 'string' || !value.trim()) return 0;
  const text = value.trim();
  // Clock timestamps require a time zone so server and browser agree.
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2}))?$/.exec(text);
  if (iso) {
    const day = calendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    if (!day) return 0;
    if (!iso[4]) return day;
    if (Number(iso[4]) > 23 || Number(iso[5]) > 59 || Number(iso[6] || 0) > 59) return 0;
    if (iso[8] !== 'Z') {
      const [hours, minutes] = iso[8].slice(1).split(':').map(Number);
      if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) return 0;
    }
    const timestamp = Date.parse(text);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }
  const numeric = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text);
  if (numeric) return calendarDate(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  const turkish = /^(?:(\d{1,2})\s+)?([a-zçğıöşü]+)\s+(\d{4})$/u.exec(text.toLocaleLowerCase('tr-TR'));
  if (turkish && MONTHS[turkish[2]] && (turkish[1] || allowMonthObservation)) {
    return calendarDate(Number(turkish[3]), MONTHS[turkish[2]], Number(turkish[1] || 1));
  }
  return 0;
}

/** Historical month observations are supported; never infer a missing year. */
export function parseDateToMs(value: string): number {
  return parseDate(value, true);
}

/** A store check must at least identify a complete calendar date. */
export function parseOfferDateToMs(value?: string): number {
  return parseDate(value, false);
}

/** Stable labels across server and device time zones. */
export function formatObservedDate(value: string | number): string {
  const timestamp = typeof value === 'number' ? value : parseDateToMs(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 'Tarih doğrulanmadı';
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(timestamp);
}

