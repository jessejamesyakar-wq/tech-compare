/**
 * Icecat LIVE JSON API Module
 * Uses live.icecat.biz/api to fetch official manufacturer product data, specs and media assets.
 */

export interface IcecatQueryOptions {
  brand?: string;
  productCode?: string;
  gtin?: string;
  language?: string;
  username?: string;
}

export interface IcecatFeature {
  name: string;
  value: string;
  category?: string;
}

export interface IcecatProductResult {
  title: string;
  brand: string;
  productCode: string;
  gtin?: string;
  category?: string;
  description?: string;
  bulletPoints: string[];
  specs: IcecatFeature[];
  images: {
    highPic?: string;
    lowPic?: string;
    thumbPic?: string;
    gallery: string[];
  };
  pdfUrl?: string;
  sourceUrl: string;
}

const ICECAT_LIVE_ENDPOINT = 'https://live.icecat.biz/api/';

/**
 * Searches and fetches official metadata, specs, and images from Icecat JSON API.
 */
export async function fetchIcecatProduct(options: IcecatQueryOptions): Promise<IcecatProductResult | null> {
  const username = options.username || process.env.ICECAT_USERNAME || 'MehmetYakar';
  const apiToken = process.env.ICECAT_API_TOKEN || '';
  const contentToken = process.env.ICECAT_CONTENT_TOKEN || '';
  const language = options.language || 'tr';

  const queryParams = new URLSearchParams();
  queryParams.set('UserName', username);
  queryParams.set('Language', language);

  if (options.gtin) {
    queryParams.set('GTIN', options.gtin.trim());
  } else if (options.brand && options.productCode) {
    queryParams.set('Brand', options.brand.trim());
    queryParams.set('ProductCode', options.productCode.trim());
  } else {
    return null;
  }

  if (apiToken) {
    queryParams.set('app_key', apiToken);
  }

  const url = `${ICECAT_LIVE_ENDPOINT}?${queryParams.toString()}`;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'TechCompare-IcecatIntegration/2.0'
    };

    if (apiToken) {
      headers['api-token'] = apiToken;
      headers['Authorization'] = `Bearer ${apiToken}`;
    }

    if (contentToken) {
      headers['Content-Token'] = contentToken;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    if (!payload || !payload.data) {
      return null;
    }

    const d = payload.data;
    const general = d.GeneralInfo || {};
    const imgObj = d.Image || {};
    const galleryItems = Array.isArray(d.Gallery) ? d.Gallery : [];

    // Helper to format image URL with content_token if present
    const formatUrl = (imgUrl?: string) => {
      if (!imgUrl) return undefined;
      if (contentToken && !imgUrl.includes('content_token=')) {
        const delimiter = imgUrl.includes('?') ? '&' : '?';
        return `${imgUrl}${delimiter}content_token=${contentToken}`;
      }
      return imgUrl;
    };

    const highPic = formatUrl(imgObj.HighPic || imgObj.highPic || general.Image?.HighPic);
    const lowPic = formatUrl(imgObj.LowPic || imgObj.lowPic);
    const thumbPic = formatUrl(imgObj.ThumbPic || imgObj.thumbPic);

    const gallery: string[] = [];
    galleryItems.forEach((g: any) => {
      const pic = formatUrl(g.Pic || g.pic || g.HighPic || g.ThumbPic);
      if (pic && !gallery.includes(pic)) {
        gallery.push(pic);
      }
    });

    // Extract specifications & features
    const specs: IcecatFeature[] = [];
    const featureGroups = Array.isArray(d.FeaturesGroups) ? d.FeaturesGroups : [];

    featureGroups.forEach((group: any) => {
      const groupName = group.FeatureGroup?.Name?.Value || group.FeatureGroup?.Name || '';
      const features = Array.isArray(group.Features) ? group.Features : [];

      features.forEach((feat: any) => {
        const fName = feat.Feature?.Name?.Value || feat.Feature?.Name || '';
        const fVal = feat.PresentationValue || feat.Value || '';
        if (fName && fVal) {
          specs.push({
            name: fName,
            value: fVal,
            category: groupName
          });
        }
      });
    });

    // Bullet points
    const bulletPoints: string[] = [];
    if (Array.isArray(d.BulletPoints?.Values)) {
      d.BulletPoints.Values.forEach((bp: any) => {
        if (typeof bp === 'string') bulletPoints.push(bp);
        else if (bp?.Value) bulletPoints.push(bp.Value);
      });
    }

    const title = general.Title || general.ProductName || options.productCode || '';
    const brand = general.Brand || options.brand || '';
    const productCode = general.ProductCode || options.productCode || '';
    const gtin = Array.isArray(general.GTIN) ? general.GTIN[0] : (general.GTIN || options.gtin);
    const category = general.Category?.Name?.Value || general.Category?.Name || '';
    const description = general.SummaryDescription?.LongDesc || general.Description?.LongDesc || '';

    return {
      title,
      brand,
      productCode,
      gtin,
      category,
      description,
      bulletPoints,
      specs,
      images: {
        highPic,
        lowPic,
        thumbPic,
        gallery
      },
      sourceUrl: url
    };
  } catch (error) {
    console.error(`[Icecat Module] Error querying ${url}:`, error);
    return null;
  }
}
