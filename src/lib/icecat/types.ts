export interface IcecatFetchParams {
  username?: string;
  gtin?: string;
  brand?: string;
  productCode?: string;
  language?: string;
}

export interface IcecatGalleryItem {
  id?: string;
  pic: string;
  thumb?: string;
  size?: number;
  isMain?: boolean;
}

export interface IcecatOfficialMedia {
  highPic: string;
  lowPic?: string;
  thumbPic?: string;
  gallery: string[];
  title?: string;
  brand?: string;
  productCode?: string;
  ean?: string;
  category?: string;
}

export interface IcecatStagingItem {
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
  brand: string;
  currentImage: string;
  icecatFound: boolean;
  icecatHighPic?: string;
  icecatGallery?: string[];
  searchKeyUsed: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NOT_FOUND';
  reviewedAt?: string;
}
