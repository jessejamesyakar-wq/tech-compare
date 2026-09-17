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
    {
      key: "panel",
      label: "Panel Teknolojisi",
      group: "screen",
      paths: [["displayTech"], ["panelType"], ["specs", "displayTech"], ["specs", "panelType"]],
      format: (v) => String(v),
      compare: (vals) => {
        const rank = (v: any) => {
          const s = String(v).toLowerCase();
          if (s.includes("qd-oled")) return 5;
          if (s.includes("oled")) return 4.5;
          if (s.includes("mini led") || s.includes("qned")) return 4;
          if (s.includes("qled") || s.includes("nanocell")) return 3;
          if (s.includes("ips")) return 2.5;
          if (s.includes("va")) return 2;
          return 1;
        };
        const r0 = rank(vals[0]);
        const r1 = rank(vals[1]);
        return r0 > r1 ? 0 : r1 > r0 ? 1 : null;
      },
    },
    {
      key: "size",
      label: "Ekran Boyutu",
      group: "screen",
      paths: [["screenSizeInches"], ["size"], ["specs", "screenSizeInches"]],
      format: (v) => `${v} inç (${Math.round(parseNumber(v) * 2.54)} cm)`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "resolution",
      label: "Çözünürlük Standartı",
      group: "screen",
      paths: [["resolution"], ["specs", "resolution"]],
      format: (v) => String(v),
      compare: (vals) => {
        const rank = (v: any) => {
          const s = String(v).toLowerCase();
          if (s.includes("8k") || s.includes("7680")) return 4;
          if (s.includes("4k") || s.includes("3840")) return 3;
          if (s.includes("1080") || s.includes("full hd") || s.includes("fhd")) return 1;
          return 0;
        };
        const r0 = rank(vals[0]);
        const r1 = rank(vals[1]);
        return r0 > r1 ? 0 : r1 > r0 ? 1 : null;
      },
    },
    {
      key: "refreshRate",
      label: "Panel Yenileme Hızı",
      group: "screen",
      paths: [["refreshRateHz"], ["specs", "refreshRateHz"]],
      format: (v) => `${parseNumber(v)} Hz`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "hdr",
      label: "HDR & Renk Formatları",
      group: "screen",
      paths: [["hdrFormats"], ["hdr"], ["specs", "hdrFormats"]],
      format: (v) => (Array.isArray(v) ? v.join(", ") : String(v)),
      compare: (vals) => {
        const s0 = String(vals[0]).toLowerCase();
        const s1 = String(vals[1]).toLowerCase();
        const score = (s: string) => {
          let pts = 0;
          if (s.includes("dolby vision")) pts += 3;
          if (s.includes("hdr10+")) pts += 2;
          if (s.includes("hdr10")) pts += 1;
          if (s.includes("hlg")) pts += 0.5;
          return pts;
        };
        return score(s0) > score(s1) ? 0 : score(s1) > score(s0) ? 1 : null;
      },
    },
    {
      key: "gaming",
      label: "Oyun & Gecikme Özellikleri",
      group: "processor",
      paths: [["gamingFeatures"], ["specs", "gamingFeatures"]],
      format: (v) => (Array.isArray(v) ? v.join(", ") : String(v)),
      compare: (vals) => {
        const countFeatures = (v: any) => (Array.isArray(v) ? v.length : String(v).split(",").length);
        const c0 = countFeatures(vals[0]);
        const c1 = countFeatures(vals[1]);
        return c0 > c1 ? 0 : c1 > c0 ? 1 : null;
      },
    },
    {
      key: "audio",
      label: "Ses Sistemi & Çıkış Gücü",
      group: "camera",
      paths: [["audioPowerWatts"], ["specs", "audioPowerWatts"]],
      format: (v) => `${parseNumber(v)}W Ses Çıkışı`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "smartOs",
      label: "Akıllı TV İşletim Sistemi",
      group: "processor",
      paths: [["smartOs"], ["os"], ["specs", "smartOs"]],
      format: (v) => String(v),
    },
    {
      key: "hdmiPorts",
      label: "HDMI & Yeni Nesil Portlar",
      group: "build",
      paths: [["hdmiPorts"], ["specs", "hdmiPorts"]],
      format: (v) => `${v} Adet HDMI (HDMI 2.1 Destekli)`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "energyClass",
      label: "Enerji Verimlilik Sınıfı",
      group: "battery",
      paths: [["energyClass"], ["specs", "energyClass"]],
      format: (v) => `${String(v).toUpperCase()} Sınıfı`,
    },
  ],

  laptops: [
    {
      key: "cpu",
      label: "İşlemci & Çip Mimarisi",
      group: "processor",
      paths: [["processor"], ["specs", "processor"]],
      format: (v) => String(v),
    },
    {
      key: "cores",
      label: "Çekirdek Yapısı",
      group: "processor",
      paths: [["processorCores"], ["specs", "processorCores"]],
      format: (v) => String(v),
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "npu",
      label: "Yapay Zeka NPU Gücü",
      group: "processor",
      paths: [["npuTops"], ["specs", "npuTops"]],
      format: (v) => `${parseNumber(v)} TOPS NPU`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "gpu",
      label: "Grafik İşlemci (GPU)",
      group: "processor",
      paths: [["gpu"], ["specs", "gpu"]],
      format: (v) => String(v),
    },
    {
      key: "tgp",
      label: "Grafik Güç Tüketimi (TGP)",
      group: "processor",
      paths: [["gpuTgpWatts"], ["specs", "gpuTgpWatts"]],
      format: (v) => `${parseNumber(v)}W TGP`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "ram",
      label: "Bellek (RAM)",
      group: "processor",
      paths: [["ramGb"], ["specs", "ramGb"]],
      format: (v, p) => {
        const type = p?.specs?.ramType || "";
        return `${parseNumber(v)} GB RAM ${type ? `(${type})` : ""}`.trim();
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "storage",
      label: "Dahili SSD Depolama",
      group: "processor",
      paths: [["storageGb"], ["specs", "storageGb"]],
      format: (v, p) => {
        const n = parseNumber(v);
        const type = p?.specs?.storageType || "NVMe SSD";
        return n >= 1024 ? `${n / 1024} TB ${type}` : `${n} GB ${type}`;
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "screen",
      label: "Ekran & Çözünürlük",
      group: "screen",
      paths: [["screenResolution"], ["screenSizeInches"], ["specs", "screenResolution"]],
      format: (v, p) => {
        const sz = p?.specs?.screenSizeInches || "";
        const res = p?.specs?.screenResolution || v;
        return `${sz ? `${sz}" ` : ""}${res}`;
      },
    },
    {
      key: "brightness",
      label: "Ekran Parlaklığı",
      group: "screen",
      paths: [["screenBrightnessNits"], ["specs", "screenBrightnessNits"]],
      format: (v) => `${parseNumber(v)} Nits`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "colorGamut",
      label: "Renk Doğruluğu & Gamut",
      group: "screen",
      paths: [["colorGamut"], ["specs", "colorGamut"]],
      format: (v) => String(v),
    },
    {
      key: "battery",
      label: "Batarya & Pil Ömrü",
      group: "battery",
      paths: [["batteryLifeHours"], ["batteryCapacityWh"], ["specs", "batteryLifeHours"]],
      format: (v, p) => {
        const wh = p?.specs?.batteryCapacityWh ? `${p.specs.batteryCapacityWh} Wh` : "";
        const hrs = p?.specs?.batteryLifeHours || v;
        return `${hrs} Saate Kadar Pil Ömrü ${wh ? `(${wh})` : ""}`.trim();
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "weight",
      label: "Ağırlık & Taşınabilirlik",
      group: "build",
      paths: [["weightKg"], ["specs", "weightKg"]],
      format: (v) => `${parseNumber(v)} kg`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        // Lighter laptop is superior in portability
        return n0 < n1 ? 0 : n1 < n0 ? 1 : null;
      },
    },
  ],

  tablets: [
    {
      key: "cpu",
      label: "İşlemci & Çip",
      group: "processor",
      paths: [["processor"], ["specs", "processor"]],
      format: (v) => String(v),
    },
    {
      key: "ram",
      label: "Bellek (RAM)",
      group: "processor",
      paths: [["ramGb"], ["specs", "ramGb"]],
      format: (v) => `${parseNumber(v)} GB RAM`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "storage",
      label: "Dahili Hafıza",
      group: "processor",
      paths: [["storageGb"], ["specs", "storageGb"]],
      format: (v) => {
        const n = parseNumber(v);
        return n >= 1024 ? `${n / 1024} TB` : `${n} GB`;
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "screen",
      label: "Ekran & Panel",
      group: "screen",
      paths: [["panelType"], ["screenSizeInches"], ["specs", "panelType"]],
      format: (v, p) => {
        const sz = p?.specs?.screenSizeInches || "";
        const panel = p?.specs?.panelType || v;
        return `${sz ? `${sz}" ` : ""}${panel}`;
      },
    },
    {
      key: "resolution",
      label: "Çözünürlük & Netlik",
      group: "screen",
      paths: [["screenResolution"], ["specs", "screenResolution"]],
      format: (v) => String(v),
    },
    {
      key: "refreshRate",
      label: "Yenileme Hızı",
      group: "screen",
      paths: [["refreshRateHz"], ["specs", "refreshRateHz"]],
      format: (v) => `${parseNumber(v)} Hz Akıcılık`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "battery",
      label: "Batarya Kapasitesi",
      group: "battery",
      paths: [["batteryMah"], ["batteryCapacityMah"], ["specs", "batteryMah"]],
      format: (v) => `${num(v)} mAh`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "camera",
      label: "Ön & Arka Kamera",
      group: "camera",
      paths: [["frontCameraMp"], ["rearCameraMp"], ["specs", "rearCameraMp"]],
      format: (v, p) => {
        const rear = p?.specs?.rearCameraMp || "";
        const front = p?.specs?.frontCameraMp || "";
        return `Arka: ${rear} | Ön: ${front}`;
      },
    },
    {
      key: "cellular",
      label: "Bağlantı & Hat Desteği",
      group: "build",
      paths: [["cellular"], ["specs", "cellular"]],
      format: (v) => String(v),
    },
    {
      key: "weight",
      label: "Ağırlık",
      group: "build",
      paths: [["weightGrams"], ["specs", "weightGrams"]],
      format: (v) => `${parseNumber(v)} gr`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 < n1 ? 0 : n1 < n0 ? 1 : null;
      },
    },
  ],

  smartwatches: [
    {
      key: "screen",
      label: "Ekran & Panel Teknolojisi",
      group: "screen",
      paths: [["displayType"], ["specs", "displayType"]],
      format: (v, p) => {
        const sz = p?.specs?.displaySizeInch ? `${p.specs.displaySizeInch}" ` : "";
        return `${sz}${String(v)}`;
      },
    },
    {
      key: "resolution",
      label: "Ekran Çözünürlüğü",
      group: "screen",
      paths: [["resolution"], ["specs", "resolution"]],
      format: (v) => String(v),
    },
    {
      key: "battery",
      label: "Pil Ömrü & Kullanım Süresi",
      group: "battery",
      paths: [["batteryLifeDays"], ["specs", "batteryLifeDays"]],
      format: (v, p) => {
        const mah = p?.specs?.batteryCapacityMah ? ` (${p.specs.batteryCapacityMah} mAh)` : "";
        return `${v} Gün Kesintisiz Kullanım${mah}`;
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "waterResistance",
      label: "Suya Dayanıklılık & Dalış",
      group: "build",
      paths: [["waterResistance"], ["specs", "waterResistance"]],
      format: (v) => String(v),
      compare: (vals) => {
        const s0 = String(vals[0]).toLowerCase();
        const s1 = String(vals[1]).toLowerCase();
        const rank = (s: string) => {
          if (s.includes("100m") || s.includes("10 atm")) return 3;
          if (s.includes("50m") || s.includes("5 atm")) return 2;
          if (s.includes("ip68")) return 1;
          return 0;
        };
        return rank(s0) > rank(s1) ? 0 : rank(s1) > rank(s0) ? 1 : null;
      },
    },
    {
      key: "sensors",
      label: "Biyometrik & Sağlık Sensörleri",
      group: "processor",
      paths: [["hasECG"], ["hasSpO2"], ["specs", "hasECG"]],
      format: (v, p) => {
        const s = p?.specs || {};
        const feats = [];
        if (s.hasECG) feats.push("EKG");
        if (s.hasSpO2) feats.push("SpO2 Kandaki Oksijen");
        if (s.hasHeartRate) feats.push("Kalp Nabız");
        if (s.hasGps) feats.push("GPS");
        return feats.length > 0 ? feats.join(" • ") : "Gelişmiş Biyometrik Sensörler";
      },
    },
    {
      key: "calling",
      label: "Sesli Görüşme & Hoparlör",
      group: "camera",
      paths: [["voiceCalling"], ["specs", "voiceCalling"]],
      format: (v, p) => (p?.specs?.voiceCalling || p?.specs?.hasSpeaker ? "Dahili Mikrofon & Hoparlör (Arama Desteği)" : "Yalnızca Bildirim"),
    },
    {
      key: "case",
      label: "Kasa Boyutu & Malzeme",
      group: "build",
      paths: [["caseSizeMm"], ["casingMaterial"], ["specs", "caseSizeMm"]],
      format: (v, p) => {
        const mm = p?.specs?.caseSizeMm ? `${p.specs.caseSizeMm} mm ` : "";
        const mat = p?.specs?.casingMaterial || "";
        return `${mm}${mat}`.trim();
      },
    },
  ],

  headphones: [
    {
      key: "acoustic",
      label: "Akustik Yapı & Gürültü Engelleme (ANC)",
      group: "camera",
      paths: [["acousticSystem"], ["specs", "acousticSystem"]],
      format: (v) => String(v),
    },
    {
      key: "driver",
      label: "Sürücü Çapı & Tipi",
      group: "camera",
      paths: [["driverSize"], ["specs", "driverSize"]],
      format: (v) => String(v),
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "frequency",
      label: "Frekans Tepkisi (Hz)",
      group: "camera",
      paths: [["frequencyResponse"], ["specs", "frequencyResponse"]],
      format: (v) => String(v),
    },
    {
      key: "battery",
      label: "Batarya & Toplam Çalma Süresi",
      group: "battery",
      paths: [["batteryLife"], ["specs", "batteryLife"]],
      format: (v) => String(v),
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "connectivity",
      label: "Bağlantı & İletim Standardı",
      group: "build",
      paths: [["connectivityType"], ["specs", "connectivityType"]],
      format: (v) => String(v),
    },
    {
      key: "form",
      label: "Tasarım & Form Faktörü",
      group: "build",
      paths: [["formFactor"], ["specs", "formFactor"]],
      format: (v) => String(v),
    },
  ],

  appliances: [
    {
      key: "suction",
      label: "Emiş Gücü (Pa)",
      group: "processor",
      paths: [["suctionPowerPa"], ["specs", "suctionPowerPa"]],
      format: (v) => `${num(v)} Pa Yüksek Emiş Gücü`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "batteryRuntime",
      label: "Çalışma Süresi & Pil Ömrü",
      group: "battery",
      paths: [["batteryRuntimeMin"], ["specs", "batteryRuntimeMin"]],
      format: (v) => `${v} Dakika Kesintisiz Temizlik`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "navigation",
      label: "Navigasyon & Haritalama Teknolojisi",
      group: "screen",
      paths: [["mappingTechnology"], ["specs", "mappingTechnology"]],
      format: (v) => String(v || "LiDAR & 3D AI Engel Tanıma"),
    },
    {
      key: "station",
      label: "Akıllı İstasyon & Bakım Özellikleri",
      group: "build",
      paths: [["autoCleanDock"], ["specs", "autoCleanDock"], ["autoEmptyStation"], ["specs", "autoEmptyStation"]],
      format: (v, p) => {
        if (p?.specs?.autoCleanDock || p?.specs?.autoEmptyStation) {
          return "Otomatik Toz Boşaltma & Sıcak Su Mop Yıkama İstasyonu";
        }
        return v ? "Otomatik Temizlik İstasyonu" : "Standart Şarj Ünitesi";
      },
    },
    {
      key: "capacity",
      label: "Toz & Su Hazne Kapasitesi",
      group: "build",
      paths: [["capacity"], ["specs", "capacity"]],
      format: (v) => String(v),
    },
    {
      key: "power",
      label: "Güç & Motor Kapasitesi",
      group: "processor",
      paths: [["btuCapacity"], ["powerWatts"], ["specs", "btuCapacity"], ["specs", "powerWatts"]],
      format: (v, p) => {
        if (p?.specs?.btuCapacity) return `${num(p.specs.btuCapacity)} BTU Kapasite`;
        if (v) return `${num(v)} W Motor Gücü`;
        return "Belirtilmemiş";
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "energyClass",
      label: "Enerji Verimlilik Seviyesi",
      group: "battery",
      paths: [["energyClassCooling"], ["energyClass"], ["specs", "energyClassCooling"]],
      format: (v) => (v ? `${String(v).toUpperCase()} Enerji Sınıfı` : "Belirtilmemiş"),
      compare: (vals) => {
        const rank = (s: string) => {
          const u = String(s).toUpperCase();
          if (u.includes("A+++")) return 7;
          if (u.includes("A++")) return 6;
          if (u.includes("A+")) return 5;
          if (u.includes("A")) return 4;
          if (u.includes("B")) return 3;
          if (u.includes("C")) return 2;
          return 1;
        };
        const r0 = rank(vals[0]);
        const r1 = rank(vals[1]);
        return r0 > r1 ? 0 : r1 > r0 ? 1 : null;
      },
    },
    {
      key: "noise",
      label: "Ses & Çalışma Gürültü Seviyesi",
      group: "build",
      paths: [["noiseLevelDb"], ["noiseDb"], ["specs", "noiseLevelDb"], ["specs", "noiseDb"]],
      format: (v) => `${parseNumber(v)} dB (Sessiz Çalışma)`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        // Lower dB is quieter and superior
        return n0 < n1 ? 0 : n1 < n0 ? 1 : null;
      },
    },
    {
      key: "inverter",
      label: "Motor & Kompresör Teknolojisi",
      group: "processor",
      paths: [["inverter"], ["specs", "inverter"]],
      format: (v) => (v ? "Inverter Dijital Akıllı Motor" : "Belirtilmemiş"),
    },
    {
      key: "warranty",
      label: "Resmi Garanti Süresi",
      group: "build",
      paths: [["warrantyYears"], ["specs", "warrantyYears"]],
      format: (v) => `${v} Yıl Resmi Garanti`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
  ],

  monitors: [
    {
      key: "panel",
      label: "Panel Teknolojisi",
      group: "screen",
      paths: [["panelType"], ["specs", "panelType"]],
      format: (v) => String(v),
      compare: (vals) => {
        const rank = (s: string) => {
          const l = String(s).toLowerCase();
          if (l.includes("qd-oled") || l.includes("oled")) return 4;
          if (l.includes("fast ips") || l.includes("ips")) return 3;
          if (l.includes("va")) return 2;
          return 1;
        };
        const r0 = rank(vals[0]);
        const r1 = rank(vals[1]);
        return r0 > r1 ? 0 : r1 > r0 ? 1 : null;
      },
    },
    {
      key: "size",
      label: "Ekran Boyutu",
      group: "screen",
      paths: [["screenSizeInches"], ["specs", "screenSizeInches"]],
      format: (v) => `${v} inç`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "resolution",
      label: "Çözünürlük",
      group: "screen",
      paths: [["resolution"], ["specs", "resolution"]],
      format: (v) => String(v),
      compare: (vals) => {
        const rank = (v: any) => {
          const s = String(v).toLowerCase();
          if (s.includes("4k") || s.includes("3840")) return 3;
          if (s.includes("2k") || s.includes("2560") || s.includes("qhd")) return 2;
          if (s.includes("1080") || s.includes("fhd")) return 1;
          return 0;
        };
        const r0 = rank(vals[0]);
        const r1 = rank(vals[1]);
        return r0 > r1 ? 0 : r1 > r0 ? 1 : null;
      },
    },
    {
      key: "refreshRate",
      label: "Yenileme Hızı (Hz)",
      group: "screen",
      paths: [["refreshRateHz"], ["specs", "refreshRateHz"]],
      format: (v) => `${parseNumber(v)} Hz`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "responseTime",
      label: "Tepki Süresi (GtG)",
      group: "screen",
      paths: [["responseTimeMs"], ["specs", "responseTimeMs"]],
      format: (v) => `${v} ms`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        // Lower ms is faster and superior
        return n0 < n1 ? 0 : n1 < n0 ? 1 : null;
      },
    },
    {
      key: "brightness",
      label: "Parlaklık & HDR Desteği",
      group: "screen",
      paths: [["hdrSupport"], ["brightnessNits"], ["specs", "brightnessNits"]],
      format: (v, p) => {
        const nits = p?.specs?.brightnessNits ? `${p.specs.brightnessNits} Nits` : "";
        const hdr = p?.specs?.hdrSupport || v;
        return `${nits ? `${nits} • ` : ""}${hdr}`;
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "sync",
      label: "Oyun Senkronizasyonu",
      group: "processor",
      paths: [["syncTechnology"], ["specs", "syncTechnology"]],
      format: (v) => String(v),
    },
  ],

  consoles: [
    {
      key: "tflops",
      label: "Grafik Hesaplama Gücü",
      group: "processor",
      paths: [["tflops"], ["specs", "tflops"]],
      format: (v) => `${parseNumber(v)} TFLOPs`,
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "processor",
      label: "İşlemci & Çip Mimarisi",
      group: "processor",
      paths: [["processor"], ["specs", "processor"]],
      format: (v) => String(v),
    },
    {
      key: "gpu",
      label: "Grafik Mimarisi & AI Yükseltme",
      group: "processor",
      paths: [["gpu"], ["specs", "gpu"]],
      format: (v) => String(v),
    },
    {
      key: "storage",
      label: "Dahili Yüksek Hızlı SSD",
      group: "processor",
      paths: [["storageGb"], ["specs", "storageGb"]],
      format: (v) => {
        const n = parseNumber(v);
        return n >= 1024 ? `${n / 1024} TB Ultra Hızlı SSD` : `${n} GB Ultra Hızlı SSD`;
      },
      compare: (vals) => {
        const n0 = parseNumber(vals[0]);
        const n1 = parseNumber(vals[1]);
        return n0 > n1 ? 0 : n1 > n0 ? 1 : null;
      },
    },
    {
      key: "resolution",
      label: "Çözünürlük & Hedef FPS",
      group: "screen",
      paths: [["resolution"], ["fps"], ["specs", "resolution"]],
      format: (v, p) => {
        const res = p?.specs?.resolution || v;
        const fps = p?.specs?.fps ? ` (${p.specs.fps})` : "";
        return `${res}${fps}`;
      },
    },
    {
      key: "connectivity",
      label: "Bağlantı & HDMI Standartı",
      group: "build",
      paths: [["hdmi"], ["wifi"], ["specs", "hdmi"]],
      format: (v, p) => {
        const hdmi = p?.specs?.hdmi || "";
        const wifi = p?.specs?.wifi || "";
        return `${hdmi ? `${hdmi} ` : ""}${wifi ? `• ${wifi}` : ""}`.trim();
      },
    },
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
