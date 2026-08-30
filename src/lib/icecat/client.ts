import { IcecatFetchParams, IcecatOfficialMedia } from './types';

const ICECAT_LIVE_BASE_URL = 'https://live.icecat.biz/api/';

/**
 * Fetches product metadata and official media assets from Icecat Open Catalog (LIVE API).
 */
export async function fetchIcecatProduct(params: IcecatFetchParams): Promise<IcecatOfficialMedia | null> {
  const username = params.username || process.env.ICECAT_USERNAME || 'openIcecat-live';
  const language = params.language || 'tr';

  const queryParams = new URLSearchParams();
  queryParams.set('UserName', username);
  queryParams.set('Language', language);

  if (params.gtin) {
    queryParams.set('GTIN', params.gtin);
  } else if (params.brand && params.productCode) {
    queryParams.set('Brand', params.brand);
    queryParams.set('ProductCode', params.productCode);
  } else {
    return null;
  }

  const requestUrl = `${ICECAT_LIVE_BASE_URL}?${queryParams.toString()}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TechCompare-CatalogIntegrator/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) return null;
      throw new Error(`Icecat API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return extractOfficialMedia(data);
  } catch (error) {
    console.error(`[Icecat Client] Error querying ${requestUrl}:`, error);
    return null;
  }
}

/**
 * Extracts high-resolution media, gallery angles, and metadata from Icecat JSON response.
 */
export function extractOfficialMedia(data: any): IcecatOfficialMedia | null {
  if (!data || !data.data) return null;

  const d = data.data;
  const general = d.GeneralInfo || {};
  const image = d.Image || {};
  const gallery = Array.isArray(d.Gallery)
    ? d.Gallery.map((g: any) => g.Pic || g.pic || '').filter((p: string) => !!p)
    : [];

  const highPic = image.HighPic || image.highPic || image.Pic || image.pic || '';

  if (!highPic && gallery.length === 0) return null;

  return {
    highPic: highPic || gallery[0],
    lowPic: image.LowPic || image.lowPic,
    thumbPic: image.ThumbPic || image.thumbPic,
    gallery,
    title: general.Title || general.title,
    brand: general.Brand || general.brand,
    productCode: general.ProductCode || general.productCode,
    ean: Array.isArray(general.GTIN) ? general.GTIN[0] : general.GTIN,
    category: general.Category?.Name?.Value || general.Category?.Name
  };
}
