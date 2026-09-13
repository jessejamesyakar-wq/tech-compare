// src/lib/ai/specFields.ts
/**
 * Defines which spec fields are meaningful to show in the comparison table,
 * PER CATEGORY with REAL paths matching mockData, mockTVs, mockLaptops, etc.
 */

import type { CatalogCategory } from "./categoryMatcher";

export interface SpecFieldDef {
  key: string;
  label: string;
  group?: "processor" | "screen" | "camera" | "battery" | "build" | "general";
  paths: string[][]; // Multiple candidate paths in order of preference
  format?: (value: any, p?: any) => string;
  compare?: (vals: any[]) => number | null; // returns index of superior product or null
}

const num = (v: any) => {
  if (typeof v === "number") return v.toLocaleString("tr-TR");
  const parsed = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? String(v) : parsed.toLocaleString("tr-TR");
};

function parseNumber(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/\./g, "").replace(/,/g, ".");
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

// Chipset-based AnTuTu v10 benchmark estimations when not explicitly stored
function inferAntutuScore(p: any): number | null {
  const chipStr = String(
    p?.specs?.processor?.chip ||
    p?.specs?.chipset ||
    p?.specs?.processor ||
    p?.processor ||
    ""
  ).toLowerCase();

  if (chipStr.includes("gen 5") || chipStr.includes("8 gen 5")) return 3680000;
  if (chipStr.includes("gen 4") || chipStr.includes("8 elite") || chipStr.includes("elite")) return 3150000;
  if (chipStr.includes("a20 pro") || chipStr.includes("a20")) return 2350000;
  if (chipStr.includes("a19 pro") || chipStr.includes("a19")) return 2150000;
  if (chipStr.includes("a18 pro") || chipStr.includes("a18")) return 1850000;
  if (chipStr.includes("dimensity 9500") || chipStr.includes("9500")) return 3200000;
  if (chipStr.includes("dimensity 9400") || chipStr.includes("9400")) return 2950000;
  if (chipStr.includes("gen 3") || chipStr.includes("8 gen 3")) return 2100000;
  if (chipStr.includes("dimensity 8400") || chipStr.includes("8400")) return 1800000;
  return null;
}

// Peak brightness estimation when not explicitly stored
function inferBrightness(p: any): number | null {
  const typeStr = String(
    p?.specs?.screen?.type ||
    p?.specs?.displayType ||
    p?.specs?.panelType ||
    ""
  ).toLowerCase();

  if (typeStr.includes("ltpo") || typeStr.includes("retina xdr") || typeStr.includes("amoled (144")) return 3000;
  if (typeStr.includes("crystalres") || typeStr.includes("amoled")) return 2400;
  if (typeStr.includes("oled")) return 2000;
  if (typeStr.includes("ips") || typeStr.includes("lcd")) return 800;
  return null;
}

export const CATEGORY_SPEC_FIELDS: Record<CatalogCategory, SpecFieldDef[]> = {
  smartphones: [
    // 1. İŞLEMCİ & PERFORMANS
    {
      key: "chip",
      label: "İşlemci & Çip Mimarisi",
      group: "processor",
      paths: [
        ["processor", "chip"],
        ["chipset"],
        ["processor"],
        ["specs", "chipset"],
        ["specs", "chip"],
      ],
      format: (v) => String(v),
    },
    {
      key: "antutu",
      label: "AnTuTu v10 Skoru",
      group: "processor",
      paths: [
        ["processor", "antutuScore"],
        ["antutuScore"],
        ["antutu"],
        ["specs", "antutuScore"],
      ],
      format: (v, p) => {
        if (v) return `${num(v)} Puan`;
        const inferred = inferAntutuScore(p);
        return inferred ? `${num(inferred)} Puan (Tahmini)` : "Belirtilmemiş";
      },
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        let max = -1;
        let maxIdx = -1;
        nums.forEach((n, i) => {
          if (n > max) {
            max = n;
            maxIdx = i;
          }
        });
        return maxIdx >= 0 ? maxIdx : null;
      },
    },
    {
      key: "ram",
      label: "Bellek (RAM)",
      group: "processor",
      paths: [
        ["memory", "ramGb"],
        ["ramGb"],
        ["ram"],
        ["memory", "ramType"],
      ],
      format: (v) => (typeof v === "number" ? `${v} GB RAM` : String(v).includes("GB") ? String(v) : `${v} GB RAM`),
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        return nums[0] > nums[1] ? 0 : nums[1] > nums[0] ? 1 : null;
      },
    },
    {
      key: "storage",
      label: "Dahili Depolama",
      group: "processor",
      paths: [
        ["memory", "storageGb"],
        ["storageGb"],
        ["storage"],
      ],
      format: (v) => {
        const n = parseNumber(v);
        if (n >= 1024) return `${n / 1024} TB (${n} GB)`;
        return `${n || v} GB`;
      },
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        return nums[0] > nums[1] ? 0 : nums[1] > nums[0] ? 1 : null;
      },
    },

    // 2. EKRAN & GÖRSEL DENEYİM
    {
      key: "screen",
      label: "Ekran & Panel",
      group: "screen",
      paths: [
        ["screen", "type"],
        ["displayType"],
        ["display"],
        ["screen", "size"],
        ["screenSizeInches"],
        ["screenSize"],
      ],
      format: (v, p) => {
        const size = p?.specs?.screen?.size || p?.specs?.screenSizeInches || p?.specs?.screenSize || "";
        const sizePrefix = size ? `${size}" ` : "";
        return `${sizePrefix}${String(v)}`;
      },
    },
    {
      key: "brightness",
      label: "Tepe Parlaklık",
      group: "screen",
      paths: [
        ["screen", "brightnessNits"],
        ["brightnessNits"],
        ["peakBrightness"],
      ],
      format: (v, p) => {
        if (v) return `${num(v)} Nits`;
        const inferred = inferBrightness(p);
        return inferred ? `${num(inferred)} Nits` : "Belirtilmemiş";
      },
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        return nums[0] > nums[1] ? 0 : nums[1] > nums[0] ? 1 : null;
      },
    },
    {
      key: "resolution",
      label: "Çözünürlük & PPI",
      group: "screen",
      paths: [
        ["screen", "resolution"],
        ["screenResolution"],
        ["resolution"],
      ],
      format: (v) => String(v),
    },

    // 3. KAMERA & VİDEO YETENEKLERİ
    {
      key: "camera",
      label: "Ana Kamera Sensörü",
      group: "camera",
      paths: [
        ["camera", "mainMp"],
        ["mainCamera"],
        ["rearCameraMp"],
        ["rearCamera"],
      ],
      format: (v) => {
        const s = String(v);
        if (s.includes("+")) {
          return s.split("+")[0].trim();
        }
        return typeof v === "number" ? `${v} MP` : s;
      },
      compare: (vals) => {
        const has1Inch = vals.map((v) => String(v).toLowerCase().includes("1-inç") || String(v).toLowerCase().includes("1 inç") || String(v).toLowerCase().includes("1\""));
        if (has1Inch[0] && !has1Inch[1]) return 0;
        if (has1Inch[1] && !has1Inch[0]) return 1;
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length >= 2 && nums[0] !== nums[1]) {
          return nums[0] > nums[1] ? 0 : 1;
        }
        return null;
      },
    },
    {
      key: "telephoto",
      label: "Telefoto & Optik Zoom",
      group: "camera",
      paths: [
        ["camera", "telephotoMp"],
        ["telephotoCamera"],
        ["telephoto"],
        ["periscopeCamera"],
        ["mainCamera"],
      ],
      format: (v) => {
        const s = String(v);
        if (s.includes("+") && (s.includes("Periskop") || s.includes("Telefoto"))) {
          const parts = s.split("+").filter((x) => x.includes("Periskop") || x.includes("Telefoto"));
          if (parts.length > 0) return parts.map((x) => x.trim()).join(" + ");
        }
        return typeof v === "number" ? `${v} MP Telefoto` : s;
      },
      compare: (vals) => {
        const periscope0 = String(vals[0]).toLowerCase().includes("periskop") || String(vals[0]).toLowerCase().includes("10x") || String(vals[0]).toLowerCase().includes("5x");
        const periscope1 = String(vals[1]).toLowerCase().includes("periskop") || String(vals[1]).toLowerCase().includes("10x") || String(vals[1]).toLowerCase().includes("5x");
        if (periscope0 && !periscope1) return 0;
        if (periscope1 && !periscope0) return 1;
        return null;
      },
    },

    // 4. BATARYA & ŞARJ TEKNOLOJİSİ
    {
      key: "battery",
      label: "Batarya Kapasitesi",
      group: "battery",
      paths: [
        ["battery", "capacitymAh"],
        ["battery", "capacityMah"],
        ["batteryCapacityMah"],
        ["batteryMah"],
        ["batteryCapacity"],
      ],
      format: (v) => `${num(v)} mAh`,
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        return nums[0] > nums[1] ? 0 : nums[1] > nums[0] ? 1 : null;
      },
    },
    {
      key: "charging",
      label: "Hızlı Şarj Gücü",
      group: "battery",
      paths: [
        ["battery", "chargingWatts"],
        ["chargingWatts"],
        ["chargingSpeed"],
      ],
      format: (v) => `${parseNumber(v)}W Hızlı Şarj`,
      compare: (vals) => {
        const nums = vals.map((v) => parseNumber(v));
        if (nums.length < 2 || nums.every((n) => n === nums[0])) return null;
        return nums[0] > nums[1] ? 0 : nums[1] > nums[0] ? 1 : null;
      },
    },

    // 5. GÖVDE & DAYANIKLILIK
    {
      key: "durability",
      label: "Su & Toz Dayanıklılığı",
      group: "build",
      paths: [
        ["build", "waterResistance"],
        ["waterResistance"],
        ["ipRating"],
      ],
      format: (v) => String(v),
      compare: (vals) => {
        const s0 = String(vals[0]);
        const s1 = String(vals[1]);
        if (s0.includes("IP69") && !s1.includes("IP69")) return 0;
        if (s1.includes("IP69") && !s0.includes("IP69")) return 1;
        return null;
      },
    },
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
          raw = getByPath(p, candidatePath);
          if (raw !== undefined && raw !== null && raw !== "") break;
        }

        if (raw === undefined || raw === null || raw === "") {
          if (field.format) {
            const inferred = field.format(undefined, p);
            if (inferred && inferred !== "Belirtilmemiş") return inferred;
          }
          return null;
        }
        return field.format ? field.format(raw, p) : String(raw);
      });

      const hasAnyRealValue = values.some((v) => v !== null && v !== "Belirtilmemiş");
      if (!hasAnyRealValue) return null;

      const cleanValues = values.map((v) => v ?? "Bilgi yok");
      const isDifferent = cleanValues.length > 1 && cleanValues.some((v) => v !== cleanValues[0]);
      const superiorIdx = field.compare ? field.compare(cleanValues) : null;

      return {
        key: field.key,
        label: field.label,
        group: field.group || "general",
        values: cleanValues,
        isDifferent,
        superiorIdx,
        highlightIdx: superiorIdx,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}
