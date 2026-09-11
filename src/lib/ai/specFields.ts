// src/lib/ai/specFields.ts
/**
 * Defines which spec fields are meaningful to show in the comparison table,
 * PER CATEGORY with REAL paths matching mockData, mockTVs, mockLaptops, etc.
 */

import type { CatalogCategory } from "./categoryMatcher";

export interface SpecFieldDef {
  key: string;
  label: string;
  paths: string[][]; // Multiple candidate paths in order of preference
  format?: (value: any) => string;
}

const num = (v: any) => (typeof v === "number" ? v.toLocaleString("tr-TR") : String(v));

export const CATEGORY_SPEC_FIELDS: Record<CatalogCategory, SpecFieldDef[]> = {
  smartphones: [
    { key: "screen", label: "Ekran", paths: [["screen", "size"], ["screenSizeInches"]] },
    { key: "chip", label: "İşlemci", paths: [["processor", "chip"], ["processor"]] },
    { key: "ram", label: "RAM", paths: [["memory", "ramGb"], ["ramGb"]], format: (v) => `${v} GB` },
    { key: "storage", label: "Depolama", paths: [["memory", "storageGb"], ["storageGb"]], format: (v) => `${v} GB` },
    { key: "camera", label: "Ana Kamera", paths: [["camera", "mainMp"], ["rearCameraMp"]] },
    { key: "battery", label: "Batarya", paths: [["battery", "capacityMah"], ["batteryCapacityMah"], ["batteryMah"]], format: (v) => `${num(v)} mAh` },
  ],
  tvs: [
    { key: "size", label: "Ekran Boyutu", paths: [["screenSizeInches"], ["size"]], format: (v) => `${v} inç` },
    { key: "panel", label: "Panel Teknolojisi", paths: [["displayTech"], ["panelType"]] },
    { key: "resolution", label: "Çözünürlük", paths: [["resolution"]] },
    { key: "refreshRate", label: "Yenileme Hızı", paths: [["refreshRateHz"]], format: (v) => `${v} Hz` },
    { key: "smartOs", label: "İşletim Sistemi", paths: [["smartOs"], ["os"]] },
    { key: "audio", label: "Ses Gücü", paths: [["audioPowerWatts"]], format: (v) => `${v} W` },
    { key: "hdr", label: "HDR Desteği", paths: [["hdrFormats"], ["hdr"]], format: (v) => Array.isArray(v) ? v.join(", ") : String(v) },
  ],
  laptops: [
    { key: "cpu", label: "İşlemci", paths: [["processor"]] },
    { key: "gpu", label: "Ekran Kartı", paths: [["gpu"]] },
    { key: "ram", label: "RAM", paths: [["ramGb"]], format: (v) => `${v} GB` },
    { key: "storage", label: "Depolama", paths: [["storageGb"]], format: (v) => `${v} GB` },
    { key: "screen", label: "Ekran", paths: [["screenSizeInches"]], format: (v) => `${v} inç` },
    { key: "resolution", label: "Çözünürlük", paths: [["screenResolution"]] },
    { key: "battery", label: "Pil Ömrü", paths: [["batteryLifeHours"]], format: (v) => `${v} saat` },
    { key: "weight", label: "Ağırlık", paths: [["weightKg"]], format: (v) => `${v} kg` },
  ],
  tablets: [
    { key: "screen", label: "Ekran Boyutu", paths: [["screenSizeInches"]], format: (v) => `${v} inç` },
    { key: "resolution", label: "Çözünürlük", paths: [["screenResolution"]] },
    { key: "panel", label: "Panel Tipi", paths: [["panelType"]] },
    { key: "cpu", label: "İşlemci", paths: [["processor"]] },
    { key: "ram", label: "RAM", paths: [["ramGb"]], format: (v) => `${v} GB` },
    { key: "storage", label: "Depolama", paths: [["storageGb"]], format: (v) => `${v} GB` },
    { key: "battery", label: "Batarya", paths: [["batteryMah"], ["batteryCapacityMah"]], format: (v) => `${num(v)} mAh` },
  ],
  smartwatches: [
    { key: "screen", label: "Ekran", paths: [["displaySizeInch"], ["screenSizeInches"]], format: (v) => `${v} inç` },
    { key: "panel", label: "Ekran Tipi", paths: [["displayType"]] },
    { key: "caseSize", label: "Kasa Boyutu", paths: [["caseSizeMm"]], format: (v) => `${v} mm` },
    { key: "battery", label: "Pil Ömrü", paths: [["batteryLifeDays"]], format: (v) => `${v} gün` },
    { key: "waterResistance", label: "Suya Dayanıklılık", paths: [["waterResistance"]] },
  ],
  headphones: [
    { key: "formFactor", label: "Tasarım / Form", paths: [["formFactor"]] },
    { key: "driverSize", label: "Sürücü Çapı", paths: [["driverSize"]] },
    { key: "batteryLife", label: "Pil Ömrü", paths: [["batteryLife"]] },
    { key: "connectivity", label: "Bağlantı Türü", paths: [["connectivityType"]] },
  ],
  appliances: [
    { key: "power", label: "Güç", paths: [["powerWatts"], ["btuCapacity"]], format: (v) => `${v} W` },
    { key: "capacity", label: "Kapasite", paths: [["capacityLiters"], ["capacity"]] },
    { key: "energyClass", label: "Enerji Sınıfı", paths: [["energyClassCooling"], ["energyClass"]] },
    { key: "warranty", label: "Garanti Süresi", paths: [["warrantyYears"]], format: (v) => `${v} yıl` },
  ],
  monitors: [
    { key: "size", label: "Ekran Boyutu", paths: [["screenSizeInches"]], format: (v) => `${v} inç` },
    { key: "resolution", label: "Çözünürlük", paths: [["resolution"]] },
    { key: "panel", label: "Panel Tipi", paths: [["panelType"]] },
    { key: "refreshRate", label: "Yenileme Hızı", paths: [["refreshRateHz"]], format: (v) => `${v} Hz` },
    { key: "responseTime", label: "Tepki Süresi", paths: [["responseTimeMs"]], format: (v) => `${v} ms` },
    { key: "sync", label: "Senkronizasyon", paths: [["syncTechnology"]] },
  ],
  consoles: [
    { key: "storage", label: "Depolama", paths: [["storageGb"]], format: (v) => `${v} GB` },
    { key: "resolution", label: "Çözünürlük", paths: [["resolution"]] },
    { key: "fps", label: "Hedef FPS", paths: [["fps"]] },
    { key: "cpu", label: "İşlemci", paths: [["processor"]] },
    { key: "gpu", label: "Grafik İşlemci", paths: [["gpu"]] },
    { key: "tflops", label: "İşlem Gücü", paths: [["tflops"]], format: (v) => `${v} TFLOPs` },
  ],
};

function getByPath(obj: any, path: string[]): any {
  if (!obj) return undefined;
  let curr = obj;
  for (const segment of path) {
    if (curr == null) return undefined;
    curr = curr[segment];
  }
  return curr;
}

export function buildComparisonRows(products: any[], category: CatalogCategory) {
  const fieldDefs = CATEGORY_SPEC_FIELDS[category] ?? [];

  return fieldDefs
    .map((field) => {
      const values = products.map((p) => {
        let raw: any = undefined;
        for (const candidatePath of field.paths) {
          raw = getByPath(p.specs, candidatePath);
          if (raw !== undefined && raw !== null && raw !== "") break;
          // Also try top-level product property as fallback
          if (candidatePath.length === 1 && p[candidatePath[0]] !== undefined) {
            raw = p[candidatePath[0]];
            break;
          }
        }

        if (raw === undefined || raw === null || raw === "") return null;
        return field.format ? field.format(raw) : String(raw);
      });

      const hasAnyRealValue = values.some((v) => v !== null);
      if (!hasAnyRealValue) return null;

      return {
        key: field.key,
        label: field.label,
        values: values.map((v) => v ?? "Bilgi yok"),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}
