import { TechnicalSourceType, UsageAuthorizationStatus } from './hepsiburadaSourceQualifier';

export interface RetailerSourceQualification {
  retailerId: string;
  name: string;
  domain: string;
  technicalSourceType: TechnicalSourceType;
  usageAuthorizationStatus: UsageAuthorizationStatus;
  rateCapRequestsPerSecond: number;
  rateCapClarification: string;
  isApiConfigured: boolean;
  endpointOrPattern: string;
  antiBotBypassAllowed: false;
  liveIngestionAuthorized: false;
  ingestionStatus: 'HOLD_PERMISSION_UNVERIFIED' | 'AUTHORIZED_FOR_SHADOW' | 'DISABLED';
}

export interface MultiRetailerRegistryDoc {
  timestamp: string;
  registeredRetailersCount: number;
  qualifications: Record<string, RetailerSourceQualification>;
  liveIngestionAuthorizedRetailersCount: 0;
  globalPublicReachability: 0;
}

export class MultiRetailerSourceQualifier {
  private static registeredRetailers: Map<string, RetailerSourceQualification> = new Map();

  public static initializeRegistry(): MultiRetailerRegistryDoc {
    this.registeredRetailers.clear();

    const retailers = [
      {
        id: 'hepsiburada',
        name: 'Hepsiburada',
        domain: 'hepsiburada.com',
        envKey: 'HEPSIBURADA_USERNAME',
        pattern: 'https://www.hepsiburada.com/[slug]-p-[sku]',
        rate: 4
      },
      {
        id: 'trendyol',
        name: 'Trendyol',
        domain: 'trendyol.com',
        envKey: 'TRENDYOL_API_KEY',
        pattern: 'https://www.trendyol.com/[slug]-p-[sku]',
        rate: 4
      },
      {
        id: 'vatan',
        name: 'Vatan Bilgisayar',
        domain: 'vatanbilgisayar.com',
        envKey: 'VATAN_API_KEY',
        pattern: 'https://www.vatanbilgisayar.com/[slug].html',
        rate: 2
      },
      {
        id: 'amazon',
        name: 'Amazon Turkey',
        domain: 'amazon.com.tr',
        envKey: 'AMAZON_SELLER_ID',
        pattern: 'https://www.amazon.com.tr/dp/[asin]',
        rate: 2
      },
      {
        id: 'n11',
        name: 'N11',
        domain: 'n11.com',
        envKey: 'N11_API_KEY',
        pattern: 'https://www.n11.com/urun/[slug]',
        rate: 4
      },
      {
        id: 'mediamarkt',
        name: 'MediaMarkt',
        domain: 'mediamarkt.com.tr',
        envKey: 'MEDIAMARKT_API_KEY',
        pattern: 'https://www.mediamarkt.com.tr/tr/product/[id].html',
        rate: 2
      },
      {
        id: 'teknosa',
        name: 'Teknosa',
        domain: 'teknosa.com',
        envKey: 'TEKNOSA_API_KEY',
        pattern: 'https://www.teknosa.com/[slug]-p-[id]',
        rate: 2
      },
      {
        id: 'pttavm',
        name: 'PttAVM',
        domain: 'pttavm.com',
        envKey: 'PTTAVM_API_KEY',
        pattern: 'https://www.pttavm.com/[slug]-p-[id]',
        rate: 2
      }
    ];

    const qualifications: Record<string, RetailerSourceQualification> = {};

    for (const r of retailers) {
      const isConfigured = Boolean(process.env[r.envKey]);
      const qual: RetailerSourceQualification = {
        retailerId: r.id,
        name: r.name,
        domain: r.domain,
        technicalSourceType: isConfigured ? 'OFFICIAL_API' : 'STRUCTURED_WEB_SOURCE',
        usageAuthorizationStatus: isConfigured ? 'AUTHORIZED_WITH_LIMITATIONS' : 'PERMISSION_UNVERIFIED',
        rateCapRequestsPerSecond: r.rate,
        rateCapClarification: 'INITIAL_INTERNAL_SAFETY_CAP (Not an official provider SLA cap)',
        isApiConfigured: isConfigured,
        endpointOrPattern: r.pattern,
        antiBotBypassAllowed: false,
        liveIngestionAuthorized: false, // Live unverified ingestion NOT authorized
        ingestionStatus: 'HOLD_PERMISSION_UNVERIFIED'
      };

      this.registeredRetailers.set(r.id, qual);
      qualifications[r.id] = qual;
    }

    return {
      timestamp: new Date().toISOString(),
      registeredRetailersCount: retailers.length,
      qualifications,
      liveIngestionAuthorizedRetailersCount: 0,
      globalPublicReachability: 0
    };
  }

  public static getQualification(retailerId: string): RetailerSourceQualification | undefined {
    return this.registeredRetailers.get(retailerId.toLowerCase());
  }
}
