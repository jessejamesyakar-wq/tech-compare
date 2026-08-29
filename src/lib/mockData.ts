import { Smartphone } from './types';
import rawSmartphones from './smartphonesData.json';

export const mockSmartphones: Smartphone[] = rawSmartphones as Smartphone[];

export const popularComparisonsList = [
  {
    phone1Id: "apple-apple-iphone-17-pro-max-2-tb-1027080",
    phone2Id: "samsung-samsung-galaxy-s26-ultra-120",
    viewCount: 14820
  },
  {
    phone1Id: "apple-apple-iphone-16-pro-max-1-tb-960862",
    phone2Id: "samsung-samsung-galaxy-s25-ultra-109",
    viewCount: 12450
  },
  {
    phone1Id: "apple-apple-iphone-17-pro-max-1-tb-1027079",
    phone2Id: "apple-apple-iphone-16-pro-max-512-gb-960861",
    viewCount: 9840
  },
  {
    phone1Id: "samsung-samsung-galaxy-s26-ultra-120",
    phone2Id: "samsung-samsung-galaxy-s24-ultra-95",
    viewCount: 8710
  }
];
