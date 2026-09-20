'use client';

import React, { useState } from 'react';
import { getComparisonRows, getMetricOutcome, describeMetric } from '@/lib/comparisonEvidence';
import {
  Scale as ScaleIcon,
  Cpu,
  Smartphone,
  Camera,
  BatteryCharging,
  Wifi,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Tv,
  Monitor,
  Gamepad2,
  Laptop,
  Zap,
  ShieldCheck,
  Speaker
} from 'lucide-react';
import {
  calculatePpiComparison,
  calculateWattComparison,
  getWirelessChargingText,
  getWirelessWinner
} from '@/lib/compareMetrics';

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  basePrice: number;
  rating?: number;
  specs?: {
    screen?: {
      size?: string;
      resolution?: string;
      refreshRate?: number;
      type?: string;
      brightness?: number;
      ppi?: number;
    };
    processor?: {
      chip?: string;
      cores?: string;
      antutuScore?: number;
      geekbenchSingle?: number;
      geekbenchMulti?: number;
      process?: string;
    };
    battery?: {
      capacitymAh?: number;
      chargingWatts?: number;
      wirelessCharging?: boolean;
    };
    camera?: {
      mainMp?: string;
      ultrawideMp?: string;
      telephotoMp?: string;
      frontMp?: string;
      ois?: boolean;
    };
  };
}

interface DeepCompareSectionsProps {
  product1: any;
  product2: any;
}

interface MetricItem {
  label: string;
  p1Val: string | number;
  p2Val: string | number;
  winner?: 1 | 2 | 'tie';
  p1BarPercent?: number;
  p2BarPercent?: number;
  advantageText?: string;
}

interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  winner: 1 | 2 | 'tie' | 'not_comparable';
  winnerSummary: string;
  metrics: MetricItem[];
}

export function DeepCompareSections({ product1, product2 }: DeepCompareSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    soc: true,
    display: true,
    camera: true,
    battery: true,
    connectivity: false
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (open: boolean) => {
    setExpandedSections(Object.fromEntries(sections.map(section => [section.id, open])));
  };

  const products = [product1, product2];
  const rows = getComparisonRows(products);
  const groups = Array.from(new Set(rows.map(row => row.category)));
  const sectionIcons = [ScaleIcon, Cpu, Monitor, BatteryCharging, Wifi];
  const sections: SectionData[] = groups.map((category, index) => ({
    id: category, title: category, subtitle: 'Katalogda kayıtlı değerler; eksik bilgi tamamlanmaz.',
    icon: sectionIcons[index % sectionIcons.length], winner: 'not_comparable',
    winnerSummary: 'Sayısal farklar yalnız bu özelliği gösterir; genel kalite veya kullanım süresi sonucu değildir.',
    metrics: rows.filter(row => row.category === category).map(row => {
      const outcome = getMetricOutcome(row, products);
      return { label: row.label, p1Val: row.getValue(product1), p2Val: row.getValue(product2),
        winner: outcome === 1 || outcome === 2 || outcome === 'tie' ? outcome : undefined,
        advantageText: row.direction ? describeMetric(row, products) : undefined };
    }),
  }));

  return (
    <div className="w-full space-y-5 pt-2">
      
      {/* Deep Section Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>AYRINTILI ÖZELLİK KARŞILAŞTIRMASI</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <span>Mühendislik & Donanım Detayları</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Kayıtlı özellikleri yan yana inceleyin. Bilinmeyen değerler kazanan hesabına katılmaz.
          </p>
        </div>

        {/* Expand / Collapse All Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAll(true)}
            className="min-h-11 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Tümünü Aç
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="min-h-11 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Tümünü Daralt
          </button>
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const isOpen = expandedSections[sec.id] ?? true;
          const IconComp = sec.icon;

          return (
            <div
              key={sec.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Category Header Row (Clickable Accordion Trigger) */}
              <button
                aria-expanded={isOpen}
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/30 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-100"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {sec.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Winner Pill Badge */}
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      sec.winner === 1
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : sec.winner === 2
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {sec.winner === 1
                        ? `${product1.brand} Lider`
                        : sec.winner === 2
                        ? `${product2.brand} Lider`
                        : 'Katalog bilgisi'}
                    </span>
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-4 sm:p-6 space-y-4 bg-white divide-y divide-slate-100">
                  
                  {/* Category Summary Box */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{sec.winnerSummary}</span>
                    </div>
                  </div>

                  {/* Metrics Table / Rows */}
                  <div className="pt-3 space-y-3">
                    {sec.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-200/50 transition-colors"
                      >
                        {/* Metric Label & Optional Advantage Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                            {metric.label}
                          </span>
                          {metric.advantageText && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                metric.winner === 1
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : metric.winner === 2
                                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              ★ {metric.advantageText}
                            </span>
                          )}
                        </div>

                        {/* Two Device Values */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs font-bold text-slate-900">
                          {/* Product 1 Value */}
                          <div
                            className={`min-w-0 break-words p-2.5 rounded-xl border transition-all ${
                              metric.winner === 1
                                ? 'bg-emerald-500/10 border-emerald-400 text-emerald-950 font-black ring-1 ring-emerald-300/60'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                              {product1.brand}
                            </div>
                            <div>{metric.p1Val}</div>
                            {metric.p1BarPercent !== undefined && (
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${metric.p1BarPercent}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Product 2 Value */}
                          <div
                            className={`min-w-0 break-words p-2.5 rounded-xl border transition-all ${
                              metric.winner === 2
                                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-950 font-black ring-1 ring-cyan-300/60'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                              {product2.brand}
                            </div>
                            <div>{metric.p2Val}</div>
                            {metric.p2BarPercent !== undefined && (
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${metric.p2BarPercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default DeepCompareSections;
