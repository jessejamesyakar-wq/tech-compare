import React from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getSpecVerificationNotice } from '@/lib/specVerification';

interface FieldSourcesEvidenceProps {
  product: Product;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function formatTurkishDate(dateStr?: any): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Doğrulama tarihi belirtilmedi';
  const trimmed = dateStr.trim();
  if (!trimmed) return 'Doğrulama tarihi belirtilmedi';

  // Strict regex: YYYY-MM-DD or full ISO 8601 timestamp only
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
  const match = trimmed.match(isoPattern);
  if (!match) return 'Doğrulama tarihi belirtilmedi';

  const year = parseInt(match[1], 10);
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  if (isNaN(year) || isNaN(monthIndex) || isNaN(day)) return 'Doğrulama tarihi belirtilmedi';
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return 'Doğrulama tarihi belirtilmedi';

  const timeMs = Date.parse(trimmed);
  if (isNaN(timeMs)) return 'Doğrulama tarihi belirtilmedi';

  // Real calendar date verification (e.g. 2026-02-31 fails)
  const d = new Date(year, monthIndex, day);
  if (d.getFullYear() !== year || d.getMonth() !== monthIndex || d.getDate() !== day) {
    return 'Doğrulama tarihi belirtilmedi';
  }

  return `${day} ${TURKISH_MONTHS[monthIndex]} ${year}`;
}

const FIELD_LABEL_TURKISH: Record<string, string> = {
  category: 'Ürün Kategorisi',
  brand: 'Marka',
  name: 'Ürün Adı',
  id: 'Ürün Kimliği',
  model: 'Model Bilgisi',
  price: 'Referans Fiyat',
  screen: 'Ekran Özellikleri',
  'screen.size': 'Ekran Boyutu',
  'screen.resolution': 'Çözünürlük',
  'screen.type': 'Ekran Tipi',
  'screen.refreshRate': 'Yenileme Hızı',
  display: 'Ekran Özellikleri',
  processor: 'İşlemci / Yonga Seti',
  cpu: 'İşlemci (CPU)',
  gpu: 'Grafik İşlemci (GPU)',
  ram: 'Bellek (RAM)',
  memory: 'Bellek ve Depolama',
  storage: 'Depolama Alanı',
  battery: 'Batarya ve Şarj',
  camera: 'Kamera Sistemleri',
  mainCamera: 'Ana Kamera',
  frontCamera: 'Ön Kamera',
  audio: 'Ses Özellikleri',
  connectivity: 'Bağlantı Teknolojileri',
  wireless: 'Kablosuz Bağlantı',
  dimensions: 'Boyutlar ve Ağırlık',
  weight: 'Ağırlık',
  os: 'İşletim Sistemi',
  operatingSystem: 'İşletim Sistemi',
  general: 'Genel Özellikler',
  specs: 'Teknik Özellikler',
  panelType: 'Panel Tipi',
  refreshRate: 'Yenileme Hızı',
  hdr: 'HDR Desteği',
  hdrSupport: 'HDR Formatları',
  smartOs: 'Akıllı TV Sistemi',
  ports: 'Bağlantı Portları',
  speakers: 'Hoparlör Gücü',
  noiseControl: 'Gürültü Engelleme (ANC)',
  waterResistance: 'Suya Dayanıklılık',
  sensors: 'Sensörler',
  health: 'Sağlık Sensörleri',
};

function formatFieldLabel(field: string): string {
  if (!field || typeof field !== 'string') return '';
  const trimmed = field.trim();
  if (FIELD_LABEL_TURKISH[trimmed]) return FIELD_LABEL_TURKISH[trimmed];

  const clean = trimmed.replace(/^specs\./, '');
  if (FIELD_LABEL_TURKISH[clean]) return FIELD_LABEL_TURKISH[clean];

  return clean
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatFieldsList(fields?: any[]): string {
  if (!Array.isArray(fields) || fields.length === 0) return 'Belirtilmedi';
  const labels = fields
    .map(f => (typeof f === 'string' ? formatFieldLabel(f) : ''))
    .filter(Boolean);
  return labels.length > 0 ? labels.join(', ') : 'Belirtilmedi';
}

function formatScopeNote(scopeNote?: any): string | null {
  if (!scopeNote) return null;
  if (typeof scopeNote === 'string') {
    const trimmed = scopeNote.trim();
    return trimmed || null;
  }
  if (typeof scopeNote === 'number') return String(scopeNote);
  return null;
}

export function FieldSourcesEvidence({ product }: FieldSourcesEvidenceProps) {
  if (!product || typeof product !== 'object') return null;

  const notice = getSpecVerificationNotice(product);
  const rawSources = Array.isArray(product.fieldSources) ? product.fieldSources : [];

  const isValidHttpUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const u = new URL(url.trim());
      return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password;
    } catch {
      return false;
    }
  };

  const validSources = rawSources.filter(src => {
    if (!src || typeof src !== 'object') return false;
    const hasValidUrl = isValidHttpUrl(src.sourceUrl);
    const validFields = Array.isArray(src.fields)
      ? src.fields.filter((f: any) => typeof f === 'string' && f.trim().length > 0)
      : [];
    const hasFields = validFields.length > 0;
    return hasValidUrl || hasFields;
  });

  const hasSources = validSources.length > 0;

  return (
    <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2.5" data-testid="field-sources-evidence">
      <div className="flex items-center gap-1.5 font-bold text-slate-900">
        <FileText className="w-4 h-4 text-slate-600 shrink-0" />
        <span>Kaynak ve Doğrulama Bilgisi</span>
      </div>

      {notice && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>{notice}</div>
        </div>
      )}

      {hasSources ? (
        <div className="space-y-2">
          {validSources.map((src, idx) => {
            const scopeNoteText = formatScopeNote(src.scopeNote);
            return (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold text-slate-500">
                  <span>Kontrol Tarihi: {formatTurkishDate(src.checkedAt)}</span>
                  {isValidHttpUrl(src.sourceUrl) && (
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 min-h-11 break-all inline-flex items-center gap-1 text-emerald-600 hover:underline font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                    >
                      <span>Kaynağı Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-slate-800 font-bold break-words min-w-0">
                  Kapsanan Alanlar: <span className="font-normal text-slate-700">{formatFieldsList(src.fields)}</span>
                </div>
                <div className="text-[11px] text-slate-500 italic break-words min-w-0">
                  Kapsam Açıklaması: Bu kaynak kaydı yalnız listedeki teknik alanlar içindir; tüm özelliklerin, canlı fiyatın veya stoğun doğrulandığı anlamına gelmez.
                </div>
                {scopeNoteText && (
                  <details className="mt-1">
                    <summary className="cursor-pointer font-semibold py-1 min-h-11 inline-flex items-center text-[11px] text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                      Özgün Kaynak Notunu Göster
                    </summary>
                    <div className="text-[11px] text-slate-600 break-words pt-1 pl-2 border-l-2 border-slate-200">
                      {scopeNoteText}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 font-medium">
          Katalog kaynak doğrulaması bekliyor.
        </div>
      )}

      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-400">
          Mağaza teklif kontrol tarihleri ürün teknik özellik doğrulaması yerine geçmez.
        </span>
        <Link
          href={`/iletisim?subject=hatali-bilgi&productId=${encodeURIComponent(product.id || '')}`}
          className="text-emerald-600 hover:text-emerald-700 font-bold underline py-1 min-h-11 inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Hatalı Bilgi Bildir
        </Link>
      </div>
    </div>
  );
}
